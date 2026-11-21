/**
 * Per-film fixes for disc art that crops badly, keyed by Letterboxd slug.
 * `src: 'poster'` prints the poster instead of the still (some posters make
 * better discs than any frame of the film); `position` steers the square crop
 * of the still, using sharp's positions ('left', 'right top', 'entropy', …)
 * instead of the default 'attention' (detail, saturation and skin tones).
 */
export const discArtOverrides: Record<string, { src?: 'poster' | 'still'; position?: string }> = {};
