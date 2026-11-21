/** Split text into exactly `n` flap cells: uppercase, spaces become blank cells. */
export function padCells(text: string, n: number): string[] {
  const cells = Array.from(text.toUpperCase().slice(0, n), (ch) => (ch === ' ' ? '' : ch));
  while (cells.length < n) cells.push('');
  return cells;
}
