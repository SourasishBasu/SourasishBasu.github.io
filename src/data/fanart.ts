/**
 * fanart.tv artwork for the film discs, made by its community: disc art (real
 * CD/DVD/Blu-ray disc scans and designs, 1000×1000 PNGs with a transparent hole
 * and edge) and title logos (the film's own title lettering on a transparent
 * 800×310 PNG). Needs a free project API key (fanart.tv/get-an-api-key), read
 * at build time from the FANART_API_KEY environment variable and never sent to
 * the browser. Without a key, or for films with no disc art (most new
 * releases), the disc prints a crop of the film's still instead. No imports, so
 * the unit tests can load it.
 */

interface FanartImage {
  url: string;
  lang?: string;
  likes?: string | number;
}

export interface FanartArt {
  disc: string | null;
  /** Title logos worth considering, best first (see fanartLogoCandidates). */
  logos: string[];
  /** A textless poster (key art), when there is one. */
  keyart: string | null;
}

const langRank = (l?: string) => (l === 'en' ? 0 : l === '00' || !l ? 1 : 2);
const https = (url: string) => url.replace(/^http:/, 'https:');

/** A list's usable images: English first, then language-neutral, then the rest; the most liked first within each. */
function ranked(list: FanartImage[] | undefined): FanartImage[] {
  const ok = (list ?? []).filter((d) => typeof d?.url === 'string');
  return [...ok].sort((a, b) => langRank(a.lang) - langRank(b.lang) || Number(b.likes ?? 0) - Number(a.likes ?? 0));
}

/** The best disc image in a fanart.tv v3 movie response. */
export function pickFanartDisc(json: unknown): string | null {
  const best = ranked((json as { moviedisc?: FanartImage[] })?.moviedisc)[0];
  return best ? https(best.url) : null;
}

/** The best textless poster: fanart.tv marks posters without text with the language code 00. */
export function pickFanartKeyart(json: unknown): string | null {
  const textless = ((json as { movieposter?: FanartImage[] } | null)?.movieposter ?? []).filter((d) => d?.lang === '00');
  const best = ranked(textless)[0];
  return best ? https(best.url) : null;
}

/**
 * Title logos in order of preference: the HD ones, then the older low-resolution ones, keeping only English and
 * language-neutral logos when there are any. Which of these actually gets printed depends on its shape (chooseLogo).
 */
export function fanartLogoCandidates(json: unknown): string[] {
  const j = json as { hdmovielogo?: FanartImage[]; movielogo?: FanartImage[] } | null;
  const all = [...ranked(j?.hdmovielogo), ...ranked(j?.movielogo)];
  const readable = all.filter((d) => langRank(d.lang) < 2);
  return (readable.length ? readable : all).map((d) => https(d.url));
}

/**
 * A logo counts as horizontal (the title on one line) when its visible lettering is more than three times as wide as
 * it is tall; two-line and stacked titles come in under that.
 */
export const HORIZONTAL = 3;

/**
 * Pick the logo to print on the disc's band, which is wide and short: the first horizontal logo in preference order,
 * or else the widest, where logos within 10% of the widest count as equally wide and preference order decides.
 */
export function chooseLogo<T extends { aspect: number }>(measured: T[]): T | null {
  if (!measured.length) return null;
  const widest = Math.max(...measured.map((m) => m.aspect));
  return measured.find((m) => m.aspect > HORIZONTAL) ?? measured.find((m) => m.aspect >= widest * 0.9)!;
}

/** Look a film up by TMDB id (or IMDb id); empty when there's no key, no art, or the request fails. */
export async function fetchFanart(id: number | string, key: string | undefined, timeout = 6000): Promise<FanartArt> {
  const none = { disc: null, logos: [], keyart: null };
  if (!key) return none;
  try {
    const res = await fetch(`https://webservice.fanart.tv/v3/movies/${encodeURIComponent(String(id))}`, {
      headers: { 'api-key': key },
      signal: AbortSignal.timeout(timeout),
    });
    if (!res.ok) return none;
    const json = await res.json();
    return { disc: pickFanartDisc(json), logos: fanartLogoCandidates(json), keyart: pickFanartKeyart(json) };
  } catch {
    return none;
  }
}
