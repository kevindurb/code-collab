import { UpdateMessage } from './types/UpdateMessage';
import { WebServer } from './WebServer';
import { Watcher } from './Watcher';

let lastUpdate: UpdateMessage;

async function main(argv: string[]) {
  const watchPath = argv[2];
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
  webServer.run();
}

main(process.argv);
