/**
 * Letterboxd, read without an API: the public diary RSS (the latest 50 diary
 * entries, with rating, watched date and poster) plus each film's own page for
 * a landscape still and the director. Profile pages sit behind a bot check;
 * the RSS and film pages don't. No imports, so the build, the unit tests and
 * scripts/refresh-films.ts can all use it.
 */

export interface DiaryEntry {
  title: string;
  year: number;
  /** Stars, 0.5–5; null when the entry has no rating. */
  rating: number | null;
  /** YYYY-MM-DD */
  watched: string;
  slug: string;
  poster: string | null;
  rewatch: boolean;
}

export interface RecentFilm extends DiaryEntry {
  /** Landscape still from the film page (1200×675), or null. */
  still: string | null;
  director: string | null;
  href: string;
}

const decode = (s: string) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));

const tag = (item: string, name: string) => {
  const m = item.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`));
  return m ? decode(m[1].replace(/^<!\[CDATA\[|\]\]>$/g, '').trim()) : null;
};

/** Diary entries from the RSS, newest first, as the feed lists them. */
export function parseDiaryRss(xml: string): DiaryEntry[] {
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  const out: DiaryEntry[] = [];
  for (const item of items) {
    const title = tag(item, 'letterboxd:filmTitle');
    const watched = tag(item, 'letterboxd:watchedDate');
    const link = tag(item, 'link') ?? '';
    const slug = link.match(/\/film\/([^/]+)\//)?.[1];
    if (!title || !watched || !slug) continue; // lists and other non-diary items
    const rating = tag(item, 'letterboxd:memberRating');
    const poster = item.match(/<img src="([^"]+)"/)?.[1] ?? null;
    out.push({
      title,
      year: Number(tag(item, 'letterboxd:filmYear')) || 0,
      rating: rating ? Number(rating) : null,
      watched,
      slug,
      poster: poster ? decode(poster) : null,
      rewatch: tag(item, 'letterboxd:rewatch') === 'Yes',
    });
  }
  return out;
}

/** The latest `count` films rated at least `min`, newest watch first, each film once. */
export function pickRecent(entries: DiaryEntry[], min = 3.5, count = 12): DiaryEntry[] {
  const seen = new Set<string>();
  return [...entries]
    .filter((e) => e.rating !== null && e.rating >= min)
    .sort((a, b) => (a.watched < b.watched ? 1 : a.watched > b.watched ? -1 : 0))
    .filter((e) => (seen.has(e.slug) ? false : (seen.add(e.slug), true)))
    .slice(0, count);
}

/** A film page's og:image (a landscape still) and director(s) from its JSON-LD. */
export function parseFilmPage(html: string): { still: string | null; director: string | null } {
  const og = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1] ?? null;
  // Only landscape stills: some films have no backdrop and fall back to the poster.
  const still = og && /-1200-1200-675-675-/.test(og) ? decode(og) : null;
  let director: string | null = null;
  const ld = html.match(/<script type="application\/ld\+json">\s*(?:\/\*[\s\S]*?\*\/)?\s*(\{[\s\S]*?\})\s*(?:\/\*[\s\S]*?\*\/)?\s*<\/script>/);
  if (ld) {
    try {
      const data = JSON.parse(ld[1]) as { director?: { name?: string }[] };
      const names = (data.director ?? []).map((d) => d.name).filter(Boolean);
      if (names.length) director = names.slice(0, 2).join(', ');
    } catch {
      // leave director empty
    }
  }
  return { still, director };
}

/** "★★★½" for 3.5 */
export function stars(rating: number) {
  return '★'.repeat(Math.floor(rating)) + (rating % 1 ? '½' : '');
}

const UA = 'Mozilla/5.0 (compatible; portfolio-build; +https://github.com/SourasishBasu)';

async function get(url: string, timeout: number) {
  const res = await fetch(url, { headers: { 'user-agent': UA, accept: 'text/html,application/xml' }, signal: AbortSignal.timeout(timeout) });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

/**
 * Read the diary RSS, keep the latest well-rated films, and fill in each one's
 * still and director from its film page (a few at a time, politely). Throws if
 * the RSS can't be read; a film page that fails just leaves its still empty.
 */
export async function fetchRecentFilms(profile: string, { min = 3.5, count = 12 } = {}): Promise<RecentFilm[]> {
  const picked = pickRecent(parseDiaryRss(await get(`${profile}rss/`, 8000)), min, count);
  const out: RecentFilm[] = [];
  for (let i = 0; i < picked.length; i += 4) {
    const batch = picked.slice(i, i + 4);
    const pages = await Promise.all(
      batch.map((e) =>
        get(`https://letterboxd.com/film/${e.slug}/`, 8000)
          .then(parseFilmPage)
          .catch(() => ({ still: null, director: null })),
      ),
    );
    batch.forEach((e, k) => out.push({ ...e, ...pages[k], href: `https://letterboxd.com/film/${e.slug}/` }));
  }
  return out;
}
