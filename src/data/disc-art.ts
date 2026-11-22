import { FANART_API_KEY } from 'astro:env/server';
import { fetchFanart } from './fanart';
import { discArtOverrides } from './disc-art-overrides';
import type { RecentFilm } from './letterboxd';

export interface DiscArt {
  /** Remote image to fetch and crop at build time. */
  src: string;
  /** 'disc': real disc art from fanart.tv, already round. 'print': a square crop of a still or poster. */
  kind: 'disc' | 'print';
  /** Where the square crop sits in the source (a sharp position or strategy). */
  position: string;
  /** The film's title logo (transparent PNG) to print on the disc's outer band. Only on prints: real disc art carries its own title. */
  logo?: string;
}

/**
 * What to print on a film's disc. Real disc art from fanart.tv when there's an
 * API key and the film has some; otherwise the 1920×1080 still, cropped square
 * around its subject at build time (see Films.astro), unless an override says
 * otherwise. A centred crop of a wide still loses whoever's off-centre and puts
 * the hub over the middle; the attention crop keeps the subject, and stills tend
 * to put faces in the upper third, clear of the hub.
 */
export async function discArt(film: RecentFilm): Promise<DiscArt | null> {
  const fix = discArtOverrides[film.slug] ?? {};
  const id = film.tmdb ?? film.imdb;
  const fanart = id ? await fetchFanart(id, FANART_API_KEY) : { disc: null, logo: null };
  if (!fix.src && fanart.disc) return { src: fanart.disc, kind: 'disc', position: 'centre' };
  const src = fix.src === 'poster' ? film.poster : (film.backdrop ?? film.still ?? film.poster);
  if (!src) return null;
  return { src, kind: 'print', position: fix.position ?? 'attention', ...(fanart.logo ? { logo: fanart.logo } : {}) };
}
