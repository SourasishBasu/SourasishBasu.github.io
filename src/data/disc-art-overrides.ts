/**
 * Per-film fixes for disc art, keyed by Letterboxd slug.
 * `disc` pins a particular fanart.tv disc image when a film has several and the
 * first isn't the one to show. `src: 'poster'` prints the poster instead of the
 * still (some posters make better discs than any frame of the film);
 * `position` steers the square crop of the still, using sharp's positions
 * ('left', 'right top', 'entropy', …) instead of the default 'attention'
 * (detail, saturation and skin tones).
 */
export const discArtOverrides: Record<string, { disc?: string; src?: 'poster' | 'still'; position?: string }> = {
  // The white Blu-ray design, not the black one fanart.tv lists first.
  belly: { disc: 'https://assets.fanart.tv/fanart/belly-5d26316877acb.png' },
};
