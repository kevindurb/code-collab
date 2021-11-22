import { Client } from './Client';
import './main.css';

async function main() {
  const client = new Client();
  await client.start();
}

main();
