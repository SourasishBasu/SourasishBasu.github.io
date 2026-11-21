import { FANART_API_KEY } from 'astro:env/server';
import { fetchFanartDisc } from './fanart';
import { discArtOverrides } from './disc-art-overrides';
import type { RecentFilm } from './letterboxd';

export interface DiscArt {
  /** Remote image to fetch and crop at build time. */
  src: string;
  /** 'disc': real disc art from fanart.tv, already round. 'print': a square crop of a still or poster. */
  kind: 'disc' | 'print';
  /** Where the square crop sits in the source (a sharp position or strategy). */
  position: string;
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
  if (!fix.src && id) {
    const disc = await fetchFanartDisc(id, FANART_API_KEY);
    if (disc) return { src: disc, kind: 'disc', position: 'centre' };
  }
  const src = fix.src === 'poster' ? film.poster : (film.backdrop ?? film.still ?? film.poster);
  return src ? { src, kind: 'print', position: fix.position ?? 'attention' } : null;
}
