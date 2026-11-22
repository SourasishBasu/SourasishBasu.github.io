/**
 * fanart.tv artwork for the film discs, made by its community: disc art (real
 * CD/DVD/Blu-ray disc scans and designs, 1000×1000 PNGs with a transparent hole
 * and edge) and title logos (the film's own title lettering on a transparent
 * PNG, about 800×310). Needs a free project API key
 * (fanart.tv/get-an-api-key), read at build time from the FANART_API_KEY
 * environment variable and never sent to the browser. Without a key, or for
 * films with no disc art (most new releases), the disc prints a crop of the
 * film's still instead. No imports, so the unit tests can load it.
 */

interface FanartImage {
  url: string;
  lang?: string;
  likes?: string | number;
}

export interface FanartArt {
  disc: string | null;
  logo: string | null;
}

/** The best image in a list: English or language-neutral first, then the most liked. */
function best(list: FanartImage[] | undefined): string | null {
  const ok = (list ?? []).filter((d) => typeof d?.url === 'string');
  if (!ok.length) return null;
  const langRank = (l?: string) => (l === 'en' ? 0 : l === '00' || !l ? 1 : 2);
  const sorted = [...ok].sort((a, b) => langRank(a.lang) - langRank(b.lang) || Number(b.likes ?? 0) - Number(a.likes ?? 0));
  return sorted[0].url.replace(/^http:/, 'https:');
}

/** The best disc image in a fanart.tv v3 movie response. */
export function pickFanartDisc(json: unknown): string | null {
  return best((json as { moviedisc?: FanartImage[] })?.moviedisc);
}

/** The best title logo: the HD logos, or the older low-resolution ones when a film has no HD logo. */
export function pickFanartLogo(json: unknown): string | null {
  const j = json as { hdmovielogo?: FanartImage[]; movielogo?: FanartImage[] };
  return best(j?.hdmovielogo) ?? best(j?.movielogo);
}

/** Look a film up by TMDB id (or IMDb id); nulls when there's no key, no art, or the request fails. */
export async function fetchFanart(id: number | string, key: string | undefined, timeout = 6000): Promise<FanartArt> {
  const none = { disc: null, logo: null };
  if (!key) return none;
  try {
    const res = await fetch(`https://webservice.fanart.tv/v3/movies/${encodeURIComponent(String(id))}`, {
      headers: { 'api-key': key },
      signal: AbortSignal.timeout(timeout),
    });
    if (!res.ok) return none;
    const json = await res.json();
    return { disc: pickFanartDisc(json), logo: pickFanartLogo(json) };
  } catch {
    return none;
  }
}
