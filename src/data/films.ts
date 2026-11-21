// Letterboxd settings for Off the clock. The film shelf itself comes from the
// diary RSS at build time (src/data/recent-films.ts); images are Letterboxd's
// own, shown linked back to each film, the way Letterboxd's widgets do.

export const letterboxd = {
  user: 'sasquatch06',
  profile: 'https://letterboxd.com/sasquatch06/',
  film: (slug: string) => `https://letterboxd.com/film/${slug}/`,
} as const;

/**
 * Films logged on Letterboxd. The profile page sits behind a bot check, so the
 * build tries to read it (src/data/film-stats.ts) and falls back to these
 * numbers, last set by hand.
 */
export const statsFallback = { total: 1140, thisYear: 195, year: 2026, asOf: '2026-11-22' } as const;
