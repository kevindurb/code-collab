import { Message } from './types/Messages';
import './main.css';

async function main() {
  const ace = window.ace;
  const modelist = ace.require('ace/ext/modelist');
  const editor = ace.edit('editor');
  editor.setTheme('ace/theme/twilight');
  editor.setReadOnly(true);

  const ws = new WebSocket('ws://localhost:1337/listen');
  ws.onmessage = function (event) {
    const message = JSON.parse(event.data) as Message;
    if (message.type !== 'Keyframe') return;
    const mode = modelist.getModeForPath(message.filename).mode;

    editor.setValue(message.fileContents);
    editor.session.setMode(mode);
    editor.gotoLine(
      message.currentRange.startRow,
      message.currentRange.startColumn,
      true,
    );
  };
}

main();
