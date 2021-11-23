import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';
import chokidar, { FSWatcher } from 'chokidar';
import ignore, { Ignore } from 'ignore';
import { Keyframe } from './types/Messages';
import { getCursorLocation } from './utils/diff';

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
    this.fsWatcher.on('new-file', this.handleChange);
  }

  shouldIgnore(filename: string) {
    return this.ig.ignores(filename);
  }

  async getFileContents(filename: string) {
    return (await fs.readFile(path.resolve(this.root, filename))).toString();
  }

  getLastKnownFileContents(filename: string) {
    return this.fileCache[filename];
  }

  async updateFileCache(filename: string) {
    this.fileCache[filename] = await this.getFileContents(filename);
  }

  handleChange = async (filename: string) => {
    if (this.shouldIgnore(filename)) return;

    console.log('change', filename);

    const newContents = await this.getFileContents(filename);
    const oldContents = this.getLastKnownFileContents(filename) ?? newContents;
    const currentRange = getCursorLocation(oldContents, newContents);
    const message: Keyframe = {
      type: 'Keyframe',
      currentRange,
      filename,
      fileContents: newContents,
    };

    await this.updateFileCache(filename);

    this.emit('message', message);
  };
}
