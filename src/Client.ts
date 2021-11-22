import faker from 'faker';
import { Collaborator } from './types/Collaborator';
import { Keyframe, Message, CollaboratorSelection } from './types/Messages';
import { Ace } from './types/Ace';

const ace = window.ace as unknown as Ace;

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

    console.log(keyframe.currentRange);

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

  handleCollaboratorSelection = ({
    collaborator,
    range,
  }: CollaboratorSelection) => {
    // ignore my own updates
    if (collaborator.username === this.username) return;

    if (!this.editor) return;

    console.log(collaborator, range);

    const markRange = new ace.Range(
      range.startRow,
      range.startColumn,
      range.endRow,
      range.endColumn,
    );

    this.editor.session.addMarker(markRange, 'collab-mark', 'line', true);
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
