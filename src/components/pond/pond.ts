/**
 * The Off the clock koi pond: the vendored ascii-animals koi (food on tap,
 * depth fog, trails, pause off-screen, reduced motion) on near-black water,
 * with the design's lily pads floating on top. Pads are drawn through the
 * engine's own Pen after the koi, so the fish glide underneath them.
 *
 * Movement: the stock koi all follow one course across the screen. Here each
 * fish steers by its own heading, which turns slowly (some clockwise, some
 * counter-clockwise) with a lazy wobble, so they loop around the pond. Most of
 * the time a fish turns back before an edge; now and then it swims out and
 * re-enters from whichever edge lies upstream of its heading, top and bottom
 * included.
 */
import { AnimalEngine } from '@/vendor/ascii-animals/engine';
import { koi, VARIETIES } from '@/vendor/ascii-animals/animals/koi';
import type { Animal, Creature, Flock } from '@/vendor/ascii-animals/flock';
import type { Pen } from '@/vendor/ascii-animals/renderer';
import { INK_LIT, ink, type RGB } from '@/vendor/ascii-animals/ink';
import { angleDiff, hash3, smoothstep } from '@/vendor/ascii-animals/math';
import { koiCount } from './count';

/** Pads as fractions of the pond: centre x (of width), centre y and radius (of height), notch angle. */
export const PADS: readonly [number, number, number, number][] = [
  [0.08, 0.3, 0.15, 0.7],
  [0.27, 0.74, 0.11, 3.6],
  [0.47, 0.22, 0.17, 2.1],
  [0.66, 0.7, 0.09, 5.2],
  [0.82, 0.3, 0.13, 1.3],
  [0.95, 0.78, 0.085, 4.4],
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

/** Varieties go round-robin from a random start, so a pond of five or six shows as many as it can. */
const firstVariety = Math.floor(Math.random() * VARIETIES.length);

/** Where this fish wants to swim right now, in screen radians. */
export function wanderHeading(f: Creature, flock: Flock<any>) {
  const t = flock.time;
  // Golden-angle spread, so fish start out heading different ways.
  const home = f.id * 2.39996;
  // Each fish loops one way or the other, a full turn in roughly 40–90 s.
  const spin = (hash3(f.id, 5, 11) - 0.5) * 0.3;
  let a = home + spin * t + 0.7 * Math.sin(t * 0.09 + f.id * 1.7) + 0.3 * Math.sin(t * 0.23 + f.id * 2.9);
  // Most of the time a fish turns back before the edge; the rest of the time it leaves and re-enters.
  const homebody = Math.sin(t * 0.035 + f.id * 4.1) > -0.4;
  if (homebody) {
    const nx = (f.x / flock.width) * 2 - 1;
    const ny = (f.y / flock.height) * 2 - 1;
    const edge = smoothstep(0.55, 1, Math.max(Math.abs(nx), Math.abs(ny)));
    if (edge > 0) {
      const centre = Math.atan2(flock.height / 2 - f.y, flock.width / 2 - f.x);
      a += angleDiff(a, centre) * edge;
    }
  }
  return a;
}

/**
 * Koi tuned for the pond: slower than stock, a little larger and mostly near
 * (the artboard's fish sat at depths 0.7–1), in small cells (about 6 px wide on desktop).
 */
export const pondKoi: Animal<any> = {
  ...koi,
  key: 'pond-koi',
  label: 'Pond koi',
  defaults: { ...koi.defaults, speed: 1, detail: 1.76, size: 2.2, farthest: 0.62, farBias: 1, trail: 3, fog: 0.55 },
  create(c, flock) {
    const fish = koi.create(c, flock as Flock<any>);
    return { ...fish, variety: (firstVariety + c.id) % VARIETIES.length };
  },
  // The stock koi read their course from the shared `direction` knob. Point it at this fish's own
  // heading while it moves, so steering, leaving and re-entering all follow that fish.
  update(f, flock, dt) {
    const k = flock.tuning;
    const shared = k.direction;
    k.direction = (-wanderHeading(f, flock) * 180) / Math.PI;
    koi.update(f, flock, dt);
    k.direction = shared;
  },
  drawAll(flock, pen) {
    koi.drawAll!(flock, pen);
    drawPads(flock, pen);
  },
};

export function mountPond(canvas: HTMLCanvasElement) {
  const width = canvas.getBoundingClientRect().width;
  return new AnimalEngine(canvas, { animal: pondKoi, count: koiCount(width), theme: 'dark' });
}
