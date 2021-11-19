import * as React from 'react';

const editorStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
};

const Index: React.FC = () => {
  const ace = window.ace;
  const [editor, setEditor] = React.useState<AceAjax.Editor>();

  React.useLayoutEffect(() => {
    (ace as any).config.set(
      'basePath',
      'https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.13/',
    );
    const editor = ace.edit('editor');
    setEditor(editor);
    editor.setTheme('ace/theme/twilight');
    editor.session.setMode('ace/mode/javascript');
  });

  return (
    <pre id="editor" style={editorStyle}>
      console.log('hello world')
    </pre>
  );
};

export default React.memo(Index);
