import { WebServer } from './WebServer';
import { Watcher } from './Watcher';
import { Session } from './Session';

const PORT = 1337;

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
  const session = new Session(webServer, watcher);

  await session.start();
  await watcher.watch();
  await webServer.listen(PORT);
  console.log(`Ready!
    http://localhost:${PORT}
`);
}

main(process.argv).catch((e) => {
  console.error(e.message);
  process.exit(1);
});
