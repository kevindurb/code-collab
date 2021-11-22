export interface Range {
  startRow: number;
  startColumn: number;
  endRow: number;
  endColumn: number;
}

export interface Keyframe {
  type: 'Keyframe';
  currentRange: Range;
  filename: string;
  fileContents: string;
}

export interface Update {
  type: 'Update';
  range: Range;
  filename: string;
  patch: string;
}

export interface CollaboratorSelection {
  type: 'CollaboratorSelection';
  range: Range;
  filename: string;
}

export type Message = Keyframe | Update | CollaboratorSelection;
