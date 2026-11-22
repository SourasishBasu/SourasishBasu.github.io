import { FANART_API_KEY } from 'astro:env/server';
import { chooseLogo, fetchFanart } from './fanart';
import { pngInfo } from './png-info';
import { discArtOverrides } from './disc-art-overrides';
import type { RecentFilm } from './letterboxd';

export interface Logo {
  src: string;
  /** The PNG's own size, so it can be resized without cropping. */
  width: number;
  height: number;
}

export interface DiscArt {
  /** Remote image to fetch and crop at build time. */
  src: string;
  /** 'disc': real disc art from fanart.tv, already round. 'print': a square crop of a still or poster. */
  kind: 'disc' | 'print';
  /** Where the square crop sits in the source (a sharp position or strategy). */
  position: string;
  /** The film's title logo (transparent PNG) to print on the disc's outer band. Only on prints: real disc art carries its own title. */
  logo?: Logo;
}

/** How many of a film's logos to download and measure before choosing. */
const LOGOS_TO_MEASURE = 6;

/**
 * The logo that suits the band best (see chooseLogo): every fanart.tv logo sits on the same 800×310 canvas, so its
 * shape only shows in where its visible pixels are.
 */
async function measureLogos(urls: string[]): Promise<Logo | null> {
  const measured = await Promise.all(
    urls.slice(0, LOGOS_TO_MEASURE).map(async (src) => {
      try {
        const res = await fetch(src, { signal: AbortSignal.timeout(6000) });
        if (!res.ok) return null;
        const info = await pngInfo(new Uint8Array(await res.arrayBuffer()));
        if (!info?.bounds) return null;
        return { src, width: info.width, height: info.height, aspect: info.bounds.w / info.bounds.h };
      } catch {
        return null;
      }
    }),
  );
  const pick = chooseLogo(measured.filter((m) => m !== null));
  return pick && { src: pick.src, width: pick.width, height: pick.height };
}

/**
 * What to print on a film's disc. Real disc art from fanart.tv when there's an
 * API key and the film has some (or the disc an override names); otherwise the
 * 1920×1080 still, cropped square around its subject at build time (see
 * Films.astro), unless an override says otherwise, with the film's title logo.
 * A centred crop of a wide still loses whoever's off-centre and puts the hub
 * over the middle; the attention crop keeps the subject, and stills tend to put
 * faces in the upper third, clear of the hub.
 */
export async function discArt(film: RecentFilm): Promise<DiscArt | null> {
  const fix = discArtOverrides[film.slug] ?? {};
  if (fix.disc) return { src: fix.disc, kind: 'disc', position: 'centre' };
  const id = film.tmdb ?? film.imdb;
  const fanart = id ? await fetchFanart(id, FANART_API_KEY) : { disc: null, logos: [] };
  if (!fix.src && fanart.disc) return { src: fanart.disc, kind: 'disc', position: 'centre' };
  const src = fix.src === 'poster' ? film.poster : (film.backdrop ?? film.still ?? film.poster);
  if (!src) return null;
  const logo = await measureLogos(fanart.logos);
  return { src, kind: 'print', position: fix.position ?? 'attention', ...(logo ? { logo } : {}) };
}
