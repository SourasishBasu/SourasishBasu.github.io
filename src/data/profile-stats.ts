/** Pull "1,140 Films · 195 This year" out of a Letterboxd profile page. */
export function parseProfileStats(html: string): { total: number; thisYear: number } | null {
  const read = (label: string) => {
    const m = html.match(new RegExp(`<span class="value">([\\d,]+)</span>\\s*<span class="definition[^"]*">${label}</span>`, 'i'));
    return m ? Number(m[1].replace(/,/g, '')) : null;
  };
  const total = read('Films');
  const thisYear = read('This year');
  return total !== null && thisYear !== null ? { total, thisYear } : null;
}
