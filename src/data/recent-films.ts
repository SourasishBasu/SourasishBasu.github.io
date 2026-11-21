import snapshot from './recent-films.snapshot.json';
import { letterboxd } from './films';
import { fetchRecentFilms, type RecentFilm } from './letterboxd';

/** Films rated at least this many stars make the shelf. */
export const MIN_RATING = 3.5;
/** How many of the latest qualifying films to show. */
export const SHELF_SIZE = 12;

let cached: Promise<{ films: RecentFilm[]; live: boolean }> | undefined;

/**
 * The latest films rated 3.5+ from the Letterboxd diary, read at build time
 * (once per build, and once per dev server). When Letterboxd can't be reached
 * the committed snapshot is used; refresh it with `npm run films:refresh`.
 * A scheduled rebuild keeps the live site current.
 */
export function getRecentFilms() {
  cached ??= fetchRecentFilms(letterboxd.profile, { min: MIN_RATING, count: SHELF_SIZE })
    .then((films) => (films.length ? { films, live: true } : { films: snapshot as RecentFilm[], live: false }))
    .catch(() => ({ films: snapshot as RecentFilm[], live: false }));
  return cached;
}
