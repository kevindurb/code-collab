// import express from 'express';

// const app = express();

// app.listen('8080', () => console.log('listening on port 8080'));

import fs from 'fs/promises';
import path from 'path';
import * as Diff from 'diff';

const fileCache: Record<string, string> = {};

async function main(argv: string[]) {
  const watchPath = argv[2];
  console.log(`Watching ${watchPath}`);
  for await (const { eventType, filename } of fs.watch(watchPath)) {
    console.log(`Event for file ${filename}`);
    const currentContents = (
      await fs.readFile(path.resolve(watchPath, filename))
    ).toString();
    if (fileCache[filename]) {
      console.log('Cache exists');
      const result = Diff.createPatch(
        filename,
        fileCache[filename],
        currentContents,
      );
      console.log(result);
    } else {
      fileCache[filename] = currentContents;
    }
  }
}

main(process.argv);
