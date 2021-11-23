import { Client } from './Client';
import './main.css';
import './aceRequires';

async function main() {
  const client = new Client();
  await client.start();
}

main();
