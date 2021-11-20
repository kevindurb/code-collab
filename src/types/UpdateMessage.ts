export interface CursorLocation {
  line: number;
  column: number;
}

export interface UpdateMessage {
  type: 'UpdateMessage';
  cursorLocation: CursorLocation;
  filename: string;
  fileContent: string;
}

export type Message = UpdateMessage;
