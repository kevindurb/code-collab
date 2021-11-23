import faker from 'faker';
import mime from 'mime-types';
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import { Collaborator } from './types/Collaborator';
import { Keyframe, Message, CollaboratorSelection } from './types/Messages';

export class Client {
  webSocket?: WebSocket;
  editor?: CodeMirror.Editor;
  filename = '';
  username: string;
  color: string;
  //here

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

  handleKeyframe = ({ currentRange, filename, fileContents }: Keyframe) => {
    if (!this.editor) return;

    // const mode = this.modeList.getModeForPath(filename).mode;

    console.log(currentRange);

    this.editor.setValue(fileContents);
    const mimeType = mime.lookup(filename);
    if (mimeType) {
      this.editor.setOption('mode', mimeType);
    }

    const fromPos: CodeMirror.Position = {
      line: currentRange.startRow,
      ch: currentRange.startColumn,
    };

    const toPos: CodeMirror.Position = {
      line: currentRange.endRow,
      ch: currentRange.endColumn,
    };

    this.editor.markText(fromPos, toPos, { className: 'update-mark' });
    this.editor.scrollIntoView(fromPos);
    // this.editor.session.setMode(mode);
    // this.editor.scrollToLine(currentRange.startRow, true, true, () => {});

    this.filename = filename;
  };

  handleCollaboratorSelection = ({
    collaborator,
    range,
  }: CollaboratorSelection) => {
    // ignore my own updates
    if (collaborator.username === this.username) return;

    if (!this.editor) return;

    console.log(collaborator, range);
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

    const position = this.editor.getCursor();
    const message: CollaboratorSelection = {
      type: 'CollaboratorSelection',
      collaborator: this.getCollaboratorData(),
      range: {
        startRow: position.line,
        startColumn: position.ch,
        endRow: position.line,
        endColumn: position.ch,
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
    this.editor = CodeMirror(document.body, {});
    this.webSocket = new WebSocket('ws://localhost:1337/listen');
    this.webSocket.onmessage = this.handleMessage;
    this.editor.on('cursorActivity', this.handleCursorChange);
  }
}
