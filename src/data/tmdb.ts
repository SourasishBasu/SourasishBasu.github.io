/**
 * TMDB key art for the film discs: textless posters. TMDB tags an image that
 * has no text as having no language, so asking for language-less posters gets
 * the artwork without the title block, which crops onto a disc far better than
 * a poster with text. Needs a free TMDB account's API Read Access Token (the
 * long one on themoviedb.org/settings/api), read at build time from the
 * TMDB_API_KEY environment variable and sent as a bearer token, never in a URL.
 * No imports, so the unit tests can load it.
 */

interface TmdbImage {
  file_path?: string;
  iso_639_1?: string | null;
  vote_average?: number;
  vote_count?: number;
}

/** The best-rated textless poster in a TMDB /movie/{id}/images response, at a size that crops well to 720 px. */
export function pickTextlessPoster(json: unknown, size = 'w780'): string | null {
  const posters = ((json as { posters?: TmdbImage[] } | null)?.posters ?? []).filter(
    (p) => typeof p?.file_path === 'string' && (p.iso_639_1 == null || p.iso_639_1 === 'xx'),
  );
  if (!posters.length) return null;
  const best = [...posters].sort((a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0) || (b.vote_count ?? 0) - (a.vote_count ?? 0))[0];
  return `https://image.tmdb.org/t/p/${size}${best.file_path}`;
}

/** The read access token is a long JWT; the older v3 API key is 32 hex characters and won't work as a bearer token. */
export const looksLikeReadToken = (key: string) => key.split('.').length === 3 && key.length > 60;

let warned = false;

/** A film's best textless poster by TMDB id; null without a key, without textless posters, or on any failure. */
export async function fetchTextlessPoster(id: number, key: string | undefined, timeout = 6000): Promise<string | null> {
  if (!key) return null;
  if (!looksLikeReadToken(key)) {
    if (!warned) console.warn('TMDB_API_KEY should be the API Read Access Token (the long one), not the short v3 API key; skipping TMDB posters.');
    warned = true;
    return null;
  }
  try {
    const res = await fetch(`https://api.themoviedb.org/3/movie/${encodeURIComponent(String(id))}/images?include_image_language=null`, {
      headers: { Authorization: `Bearer ${key}`, accept: 'application/json' },
      signal: AbortSignal.timeout(timeout),
    });
    if (!res.ok) return null;
    return pickTextlessPoster(await res.json());
  } catch {
    return null;
  }
}
