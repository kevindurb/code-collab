import { EventEmitter } from 'events';
import * as Diff from 'diff';
import fs from 'fs/promises';
import path from 'path';
import chokidar, { FSWatcher } from 'chokidar';
import ignore, { Ignore } from 'ignore';
import { UpdateMessage, CursorLocation } from './types/UpdateMessage';

export class Watcher extends EventEmitter {
  ig: Ignore;
  fsWatcher?: FSWatcher;
  root: string;
  fileCache: Record<string, string | undefined> = {};

  constructor(root: string) {
    super();
    this.root = root;
    this.ig = ignore();
  }

  async watch() {
    console.log(`Watching ${this.root}`);
    this.ig.add('.git');

    try {
      const gitignore = path.join(this.root, '.gitignore');
      if ((await fs.stat(gitignore)).isFile()) {
        this.ig.add((await fs.readFile(gitignore)).toString());
      }
    } catch {
      console.warn('.gitignore missing');
    }

    this.fsWatcher = chokidar.watch(this.root);
    this.fsWatcher.on('change', this.handleChange);
    this.fsWatcher.on('new-file', this.handleNewFile);
  }

  shouldIgnore(filename: string) {
    return this.ig.ignores(filename);
  }

  async getFileContents(filename: string) {
    return (await fs.readFile(path.resolve(this.root, filename))).toString();
  }

  getCursorLocation(oldContents: string, newContents: string): CursorLocation {
    if (oldContents !== newContents) {
      const [firstChange] = Diff.diffChars(oldContents, newContents);
      const firstChangeLines = firstChange.value.split('\n');

      return {
        line: firstChangeLines.length,
        column: 0,
      };
    }
    return {
      line: 0,
      column: 0,
    };
  }

  getLastKnownFileContents(filename: string) {
    return this.fileCache[filename];
  }

  handleChange = async (filename: string) => {
    if (this.shouldIgnore(filename)) return;

    console.log('change', filename);

    const newContents = await this.getFileContents(filename);
    const oldContents = this.getLastKnownFileContents(filename) ?? newContents;
    const cursorLocation = this.getCursorLocation(oldContents, newContents);
    const message: UpdateMessage = {
      type: 'UpdateMessage',
      cursorLocation,
      filename,
      fileContent: newContents,
    };

    this.emit('update', message);
  };

  handleNewFile = async (filename: string) => {
    if (this.shouldIgnore(filename)) return;
    console.log('new', filename);
    const newContents = await this.getFileContents(filename);
    const message: UpdateMessage = {
      type: 'UpdateMessage',
      cursorLocation: { line: 0, column: 0 },
      filename,
      fileContent: newContents,
    };

    this.emit('update', message);
  };
}
