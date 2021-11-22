import faker from 'faker';
import { Collaborator } from './types/Collaborator';
import { Keyframe, Message, CollaboratorSelection } from './types/Messages';

const ace = window.ace;
const Range = (ace as any).Range as AceAjax.Range;

export class Client {
  webSocket?: WebSocket;
  editor?: AceAjax.Editor;
  modeList?: any;
  filename = '';
  username: string;
  color: string;

  constructor() {
    this.username = localStorage.getItem('username') ?? '';
    this.color = localStorage.getItem('color') ?? '';

    if (!this.username) {
      this.username = faker.random.words(2);
    }

    if (!this.color) {
      this.color = faker.internet.color();
    }

    localStorage.setItem('username', this.username);
    localStorage.setItem('color', this.color);
  }

  getCollaboratorData = (): Collaborator => ({
    username: this.username,
    color: this.color,
  });

  handleKeyframe = (keyframe: Keyframe) => {
    if (!this.editor) return;

    const mode = this.modeList.getModeForPath(keyframe.filename).mode;

    this.editor.setValue(keyframe.fileContents);
    this.editor.session.setMode(mode);
    this.editor.scrollToLine(
      keyframe.currentRange.startRow,
      true,
      true,
      () => {},
    );
    this.filename = keyframe.filename;
  };

  handleCollaboratorSelection = (message: CollaboratorSelection) => {
    // ignore my own updates
    if (message.collaborator.username === this.username) return;

    const range = new Range();
  };

  handleMessage = (event: MessageEvent) => {
    const message = JSON.parse(event.data) as Message;
    switch (message.type) {
      case 'Keyframe':
        return this.handleKeyframe(message);
      case 'CollaboratorSelection':
        return this.handleCollaboratorSelection(message);
    }
  };

  handleCursorChange = () => {
    if (!this.editor) return;

    const position = this.editor.selection.getCursor();
    const message: CollaboratorSelection = {
      type: 'CollaboratorSelection',
      collaborator: this.getCollaboratorData(),
      range: {
        startRow: position.row,
        startColumn: position.column,
        endRow: position.row,
        endColumn: position.column,
      },
      filename: this.filename,
    };

    this.send(message);
  };

  send(message: Message) {
    if (!this.webSocket) return;

    this.webSocket.send(JSON.stringify(message));
  }

  async start() {
    this.modeList = ace.require('ace/ext/modelist');
    this.editor = ace.edit('editor');
    this.editor.setTheme('ace/theme/twilight');
    this.editor.setReadOnly(true);
    this.webSocket = new WebSocket('ws://localhost:1337/listen');
    this.webSocket.onmessage = this.handleMessage;
    this.editor.selection.on('changeCursor', this.handleCursorChange);
  }
}
