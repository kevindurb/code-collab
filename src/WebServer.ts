import express from 'express';
import http from 'http';
import path from 'path';
import { EventEmitter } from 'events';
import { WebSocketServer, WebSocket } from 'ws';
import { Message } from './types/Messages';

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

  async listen(port: number | string) {
    this.httpServer.listen(port);
  }

  send = (webSocket: WebSocket, message: Message) => {
    if (webSocket.readyState === WebSocket.OPEN) {
      webSocket.send(JSON.stringify(message));
    }
  };

  broadcast(message: Message) {
    this.webSocketServer.clients.forEach((ws) => this.send(ws, message));
  }
}
