import express from 'express';
import http from 'http';
import path from 'path';
import { EventEmitter } from 'events';
import { WebSocketServer, WebSocket } from 'ws';

export class WebServer extends EventEmitter {
  app: express.Express;
  httpServer: http.Server;
  webSocketServer: WebSocketServer;

  constructor() {
    super();

    this.app = express();
    this.httpServer = http.createServer(this.app);
    this.webSocketServer = new WebSocketServer({
      server: this.httpServer,
      path: '/listen',
    });
    this.app.use(express.static(path.join(__dirname, '../dist')));

    this.app.get('/', (req, res) => {
      res.type('text/html');
      res.status(200);
      res.sendFile(path.join(__dirname, './index.html'));
    });

    this.webSocketServer.on('connection', (ws) => this.emit('connection', ws));
  }

  run() {
    this.httpServer.listen(1337);
  }

  broadcast(message: any) {
    this.webSocketServer.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }
}
