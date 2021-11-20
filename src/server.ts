import { WebSocketServer, WebSocket } from 'ws';
import chokidar from 'chokidar';
import ignore from 'ignore';
import fs from 'fs/promises';
import path from 'path';
import * as Diff from 'diff';
import { UpdateMessage } from './types/UpdateMessage';

const fileCache: Record<string, string> = {};
const sockets: WebSocket[] = [];
let lastUpdate: UpdateMessage;

async function main(argv: string[]) {
  const watchPath = argv[2];
  const wss = new WebSocketServer({ port: 1337 });
  const gitignore = path.join(watchPath, '.gitignore');

  const ig = ignore();
  ig.add('.git');

  if ((await fs.stat(gitignore)).isFile()) {
    ig.add((await fs.readFile(gitignore)).toString());
  }

  wss.on('connection', (ws) => {
    if (lastUpdate) {
      ws.send(JSON.stringify(lastUpdate));
    }
    sockets.push(ws);
  });

  console.log(`Watching ${watchPath}`);
  chokidar
    .watch(watchPath)
    .on('change', async (filename) => {
      if (ig.ignores(path.relative(watchPath, filename))) {
        console.log('ignoring', filename);
        return;
      }
      console.log('change', filename);
      const currentContents = (
        await fs.readFile(path.resolve(watchPath, filename))
      ).toString();

      const update: UpdateMessage = {
        cursorLocation: { line: 0, column: 0 },
        filename,
        fileContent: currentContents,
      };

      if (fileCache[filename]) {
        const [firstChange] = Diff.diffChars(
          fileCache[filename],
          currentContents,
        );
        const firstChangeLines = firstChange.value.split('\n');

        update.cursorLocation.line = firstChangeLines.length;
      }
      lastUpdate = update;

      const message = JSON.stringify(update);
      sockets.forEach((ws) => ws.send(message));
      fileCache[filename] = currentContents;
      console.log('here');
    })
    .on('new-file', async (filename) => {
      if (ig.ignores(path.relative(watchPath, filename))) {
        console.log('ignoring', filename);
        return;
      }
      console.log('new', filename);
      const currentContents = (
        await fs.readFile(path.resolve(watchPath, filename))
      ).toString();

      const update: UpdateMessage = {
        cursorLocation: { line: 0, column: 0 },
        filename,
        fileContent: currentContents,
      };
      lastUpdate = update;

      const message = JSON.stringify(update);
      sockets.forEach((ws) => ws.send(message));
      fileCache[filename] = currentContents;
    });
}

main(process.argv);
