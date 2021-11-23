import { getCursorLocation } from './diff';

const BASE_TEXT = `Hello World
This is a test
multiline
test
test
`;

describe('getCursorLocation', () => {
  it('should give back 0,0,0,0 if there was no change', () => {
    expect(getCursorLocation('', '')).toEqual({
      startRow: 0,
      startColumn: 0,
      endRow: 0,
      endColumn: 0,
    });
  });

  it('should give the full line when a full line is added', () => {
    const ADDITION = `Hello World
This is a test
anothermultiline
multiline
test
test
    `;

    expect(getCursorLocation(BASE_TEXT, ADDITION)).toEqual({
      startRow: 2,
      startColumn: 0,
      endRow: 2,
      endColumn: 7,
    });
  });

  it('should give only a partial line when a partial change is made', () => {
    const ADDITION = `Hello World
This is a test
mullllltiline
test
test
    `;

    expect(getCursorLocation(BASE_TEXT, ADDITION)).toEqual({
      startRow: 2,
      startColumn: 3,
      endRow: 2,
      endColumn: 7,
    });
  });

  it('should give the char after a removal', () => {
    const REMOVAL = `Hello World
This is a test
muliline
test
test
    `;

    expect(getCursorLocation(BASE_TEXT, REMOVAL)).toEqual({
      startRow: 2,
      startColumn: 3,
      endRow: 2,
      endColumn: 3,
    });
  });

  it('should give the line after a full line removal', () => {
    const REMOVAL = `Hello World
This is a test
test
test
    `;

    expect(getCursorLocation(BASE_TEXT, REMOVAL)).toEqual({
      startRow: 2,
      startColumn: 0,
      endRow: 2,
      endColumn: 0,
    });
  });
});
