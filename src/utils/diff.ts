import * as Diff from 'diff';
import { Range } from '../types/Messages';

export const getCursorLocation = (
  oldContents: string,
  newContents: string,
): Range => {
  if (oldContents !== newContents) {
    const [beforeChange, change] = Diff.diffChars(oldContents, newContents);
    const beforeChangeLines = beforeChange.value.split('\n');
    const lastLineBeforeChange =
      beforeChangeLines[beforeChangeLines.length - 1];
    const changeLines = change.value.split('\n');
    const lastChangeLine = changeLines[changeLines.length - 1];

    if (change.added) {
      return {
        startRow: beforeChangeLines.length - 1,
        startColumn: lastLineBeforeChange.length,
        endRow: beforeChangeLines.length + changeLines.length - 2,
        endColumn: lastLineBeforeChange.length + lastChangeLine.length,
      };
    }
    return {
      startRow: beforeChangeLines.length - 1,
      startColumn: lastLineBeforeChange.length,
      endRow: beforeChangeLines.length - 1,
      endColumn: lastLineBeforeChange.length,
    };
  }
  return {
    startRow: 0,
    startColumn: 0,
    endRow: 0,
    endColumn: 0,
  };
};
