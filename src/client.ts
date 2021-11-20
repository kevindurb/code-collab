import { UpdateMessage } from './types/UpdateMessage';

async function main() {
  const ace = window.ace;
  const modelist = ace.require('ace/ext/modelist');
  const editor = ace.edit('editor');
  editor.setTheme('ace/theme/twilight');
  editor.setReadOnly(true);

  const ws = new WebSocket('ws://localhost:1337');
  ws.onmessage = function (event) {
    const message = JSON.parse(event.data) as UpdateMessage;
    const mode = modelist.getModeForPath(message.filename).mode;

    editor.setValue(message.fileContent);
    editor.session.setMode(mode);
    editor.gotoLine(
      message.cursorLocation.line,
      message.cursorLocation.column,
      true,
    );
  };
}

main();
