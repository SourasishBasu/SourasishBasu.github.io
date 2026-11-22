/**
 * Per-film fixes for disc art, keyed by Letterboxd slug.
 * `disc` pins a particular fanart.tv disc image when a film has several and the
 * first isn't the one to show. `src: 'poster'` prints the Letterboxd poster and
 * `src: 'still'` the still, skipping fanart.tv disc art and key art (when the
 * key art for a film doesn't suit a disc); `position` steers the square crop,
 * using sharp's positions ('left', 'right top', 'entropy', …) instead of the
 * default 'attention' (detail, saturation and skin tones).
 */
export const discArtOverrides: Record<string, { disc?: string; src?: 'poster' | 'still'; position?: string }> = {
  // The white Blu-ray design, not the black one fanart.tv lists first.
  belly: { disc: 'https://assets.fanart.tv/fanart/belly-5d26316877acb.png' },
};
