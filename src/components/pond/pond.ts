/**
 * The Off the clock koi pond: the vendored ascii-animals koi (food on tap,
 * depth fog, trails, pause off-screen, reduced motion) on near-black water,
 * with the design's lily pads floating on top. Pads are drawn through the
 * engine's own Pen after the koi, so the fish glide underneath them.
 */
import { AnimalEngine } from '@/vendor/ascii-animals/engine';
import { koi } from '@/vendor/ascii-animals/animals/koi';
import type { Animal, Flock } from '@/vendor/ascii-animals/flock';
import type { Pen } from '@/vendor/ascii-animals/renderer';
import { INK_LIT, ink, type RGB } from '@/vendor/ascii-animals/ink';
import { angleDiff } from '@/vendor/ascii-animals/math';
import { koiCount } from './count';

/** Pads as fractions of the pond: centre x (of width), centre y and radius (of height), notch angle. */
export const PADS: readonly [number, number, number, number][] = [
  [0.1, 0.24, 0.144, 0.7],
  [0.3, 0.72, 0.106, 3.6],
  [0.55, 0.2, 0.18, 2.1],
  [0.6, 0.32, 0.08, 5.2],
  [0.8, 0.68, 0.13, 1.3],
  [0.93, 0.26, 0.094, 4.4],
];

const BLOSSOM: RGB = [242, 155, 192];
const POLLEN: RGB = [247, 210, 122];
const PAD_DEEP: RGB = [34, 86, 46];

/** Lily pads: a disc with a notch, veins radiating from the centre, lit from the upper left. Every other pad flowers. */
function drawPads(flock: Flock<any>, pen: Pen) {
  const t = flock.time;
  PADS.forEach(([fx, fy, fr, notch], i) => {
    const r = fr * flock.height;
    const bob = Math.sin(t * 0.6 + i) * 2;
    const pose = { x: fx * flock.width, y: fy * flock.height + bob, heading: notch, span: r, depth: 1, id: 900 + i };
    pen.shape(pose, 1.05, (u, v) => {
      const d = Math.hypot(u, v);
      if (d > 1) return false;
      // Body coordinates point u at the notch, so the notch is a wedge around angle 0.
      const ang = Math.atan2(v, u);
      if (Math.abs(ang) < 0.32 && d > 0.12) return false;
      const shade = 0.6 + 0.4 * Math.cos(ang + notch - 2.4) * d;
      const vein = Math.abs(angleDiff(ang, Math.PI)) < 0.12 || Math.abs(Math.sin(ang * 4)) < 0.1;
      return ink(pen.ink, 52 * shade + 17, 145 * shade + 24, 79 * shade + 17, INK_LIT, vein ? '|' : shade > 0.85 ? '%' : '#');
    });
    if (i % 2 === 0) {
      const x = pose.x + r * 0.15;
      const y = pose.y - r * 0.2;
      pen.spot(x, y, '*', BLOSSOM, PAD_DEEP, 1);
      pen.spot(x + pen.cw, y, 'o', POLLEN, PAD_DEEP, 1);
      pen.spot(x + pen.cw * 2, y, '*', BLOSSOM, PAD_DEEP, 1);
    }
  });
}

/**
 * Koi tuned for a wide, shallow pond: they cross the long way, a little larger
 * than stock and mostly near (the artboard's fish sat at depths 0.7–1), in small
 * cells (about 6 px wide on desktop).
 */
export const pondKoi: Animal<any> = {
  ...koi,
  key: 'pond-koi',
  label: 'Pond koi',
  defaults: { ...koi.defaults, direction: 8, detail: 1.76, size: 2.2, farthest: 0.62, farBias: 1, trail: 3, fog: 0.55 },
  drawAll(flock, pen) {
    koi.drawAll!(flock, pen);
    drawPads(flock, pen);
  },
};

export function mountPond(canvas: HTMLCanvasElement) {
  const width = canvas.getBoundingClientRect().width;
  return new AnimalEngine(canvas, { animal: pondKoi, count: koiCount(width), theme: 'dark' });
}
