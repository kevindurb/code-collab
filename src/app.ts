import { UpdateMessage } from './types/UpdateMessage';
import { WebServer } from './WebServer';
import { Watcher } from './Watcher';

const PORT = 1337;
let lastUpdate: UpdateMessage;

async function main(argv: string[]) {
  const watchPath = argv[2];
  if (!watchPath) {
    throw new Error(`
    Error: watchPath missing
    Usage: code-collab <watchPath>
`);
  }

  const webServer = new WebServer();
  const watcher = new Watcher(watchPath);

  webServer.on('connection', () => {
    if (!lastUpdate) return;
    webServer.broadcast(lastUpdate);
  });

  watcher.on('update', (message) => {
    webServer.broadcast(message);
    lastUpdate = message;
  });

  await watcher.watch();
  webServer.run(PORT);
  console.log(`Ready!
    http://localhost:${PORT}
`);
}

main(process.argv).catch((e) => {
  console.error(e.message);
  process.exit(1);
});
