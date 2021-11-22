import { EventEmitter } from 'events';
import * as Diff from 'diff';
import fs from 'fs/promises';
import path from 'path';
import chokidar, { FSWatcher } from 'chokidar';
import ignore, { Ignore } from 'ignore';
import { Keyframe, Range } from './types/Messages';

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

  async setupIgnore() {
    this.ig.add('.git');

    try {
      const gitignore = path.join(this.root, '.gitignore');
      if ((await fs.stat(gitignore)).isFile()) {
        this.ig.add((await fs.readFile(gitignore)).toString());
      }
    } catch {
      console.warn('.gitignore missing');
    }
  }

  async watch() {
    console.log(`Watching "${this.root}"`);

    this.setupIgnore();
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

  getCursorLocation(oldContents: string, newContents: string): Range {
    if (oldContents !== newContents) {
      const [firstChange] = Diff.diffChars(oldContents, newContents);
      const firstChangeLines = firstChange.value.split('\n');

      return {
        startRow: firstChangeLines.length,
        startColumn: 0,
        endRow: firstChangeLines.length,
        endColumn: 0,
      };
    }
    return {
      startRow: 0,
      startColumn: 0,
      endRow: 0,
      endColumn: 0,
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
    const currentRange = this.getCursorLocation(oldContents, newContents);
    const message: Keyframe = {
      type: 'Keyframe',
      currentRange,
      filename,
      fileContents: newContents,
    };

    this.emit('message', message);
  };

  handleNewFile = async (filename: string) => {
    if (this.shouldIgnore(filename)) return;
    console.log('new', filename);
    const newContents = await this.getFileContents(filename);
    const message: Keyframe = {
      type: 'Keyframe',
      currentRange: {
        startRow: 0,
        startColumn: 0,
        endRow: 0,
        endColumn: 0,
      },
      filename,
      fileContents: newContents,
    };

    this.emit('message', message);
  };
}
