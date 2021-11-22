export interface Ace extends AceAjax.Ace {
  /**
   * Creates a new `Range` object with the given starting and ending row and column points.
   * @param startRow The starting row
   * @param startColumn The starting column
   * @param endRow The ending row
   * @param endColumn The ending column
   **/
  Range: {
    fromPoints(pos1: AceAjax.Position, pos2: AceAjax.Position): AceAjax.Range;
    new (
      startRow: number,
      startColumn: number,
      endRow: number,
      endColumn: number,
    ): AceAjax.Range;
  };
}

declare var ace: Ace;
