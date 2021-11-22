import { WebSocket, RawData } from 'ws';
import { EventEmitter } from 'events';
import { WebServer } from './WebServer';
import { Watcher } from './Watcher';
import { Message, Keyframe } from './types/Messages';

export class Session extends EventEmitter {
  lastKeyframe?: Keyframe;
  webServer: WebServer;
  watcher: Watcher;

  constructor(webServer: WebServer, watcher: Watcher) {
    super();
    this.webServer = webServer;
    this.watcher = watcher;
  }

  handleClientMessage = (data: RawData) => {
    const message = JSON.parse(data.toString()) as Message;
    console.log(message);
    switch (message.type) {
      case 'CollaboratorSelection':
        return this.webServer.broadcast(message);
    }
  };

  handleNewConnection = (webSocket: WebSocket) => {
    webSocket.on('message', this.handleClientMessage);

    if (this.lastKeyframe) {
      this.webServer.send(webSocket, this.lastKeyframe);
    }
  };

  handleWatcherMessage = (message: Message) => {
    this.webServer.broadcast(message);
    if (message.type === 'Keyframe') {
      this.lastKeyframe = message;
    }
  };

  async start() {
    this.webServer.on('connection', this.handleNewConnection);
    this.watcher.on('message', this.handleWatcherMessage);
  }
}
