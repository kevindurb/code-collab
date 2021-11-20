interface CursorLocation {
  line: number;
  column: number;
}

export interface UpdateMessage {
  cursorLocation: CursorLocation;
  filename: string;
  fileContent: string;
}
