/**
 * fanart.tv disc art: real CD/DVD/Blu-ray disc scans and designs, made by its
 * community, as 1000×1000 PNGs with a transparent hole and edge. Needs a free
 * project API key (fanart.tv/get-an-api-key), read at build time from the
 * FANART_API_KEY environment variable and never sent to the browser. Without a
 * key, or for films with no disc art (most new releases), the disc prints a
 * crop of the film's still instead. No imports, so the unit tests can load it.
 */

interface FanartImage {
  url: string;
  lang?: string;
  likes?: string | number;
  disc_type?: string;
}

/** The best disc image in a fanart.tv v3 movie response: English or language-neutral first, then the most liked. */
export function pickFanartDisc(json: unknown): string | null {
  const discs = ((json as { moviedisc?: FanartImage[] })?.moviedisc ?? []).filter((d) => typeof d?.url === 'string');
  if (!discs.length) return null;
  const langRank = (l?: string) => (l === 'en' ? 0 : l === '00' || !l ? 1 : 2);
  const sorted = [...discs].sort((a, b) => langRank(a.lang) - langRank(b.lang) || Number(b.likes ?? 0) - Number(a.likes ?? 0));
  return sorted[0].url.replace(/^http:/, 'https:');
}

/** Look a film up by TMDB id (or IMDb id); null when there's no key, no disc art, or the request fails. */
export async function fetchFanartDisc(id: number | string, key: string | undefined, timeout = 6000): Promise<string | null> {
  if (!key) return null;
  try {
    const res = await fetch(`https://webservice.fanart.tv/v3/movies/${encodeURIComponent(String(id))}`, {
      headers: { 'api-key': key },
      signal: AbortSignal.timeout(timeout),
    });
    if (!res.ok) return null;
    return pickFanartDisc(await res.json());
  } catch {
    return null;
  }
}
