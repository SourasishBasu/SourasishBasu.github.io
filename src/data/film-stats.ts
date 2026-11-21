import { letterboxd, statsFallback } from './films';
import { parseProfileStats } from './profile-stats';

export interface FilmStats {
  total: number;
  /** null when the stored number is from a previous year. */
  thisYear: number | null;
  live: boolean;
}

let cached: Promise<FilmStats> | undefined;

/**
 * Live counts at build time when Letterboxd lets the request through; the
 * stored fallback otherwise. Fetched once per build (and once per dev server).
 */
export function getFilmStats(): Promise<FilmStats> {
  cached ??= (async () => {
    const fallback: FilmStats = {
      total: statsFallback.total,
      thisYear: statsFallback.year === new Date().getFullYear() ? statsFallback.thisYear : null,
      live: false,
    };
    try {
      const res = await fetch(letterboxd.profile, {
        headers: { 'user-agent': 'Mozilla/5.0 (compatible; portfolio-build)', accept: 'text/html' },
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) return fallback;
      const stats = parseProfileStats(await res.text());
      return stats ? { ...stats, live: true } : fallback;
    } catch {
      return fallback;
    }
  })();
  return cached;
}
