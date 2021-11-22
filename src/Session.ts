import { WebSocket } from 'ws';
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

  handleNewConnection = (webSocket: WebSocket) => {
    if (!this.lastKeyframe) return;
    this.webServer.send(webSocket, this.lastKeyframe);
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
