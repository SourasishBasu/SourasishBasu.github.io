/**
 * The Off the clock koi pond: the vendored ascii-animals koi (food on tap,
 * depth fog, trails, pause off-screen, reduced motion) on near-black water,
 * with the design's lily pads floating on top. Pads are drawn through the
 * engine's own Pen after the koi, so the fish glide underneath them.
 *
 * Movement: the stock koi all follow one course across the screen. Here each
 * fish steers by its own heading (see wanderHeading): a lazy meander, soft
 * walls, and now and then a crossing that leaves and re-enters from whichever
 * edge lies upstream of its heading, top and bottom included.
 */
import { AnimalEngine } from '@/vendor/ascii-animals/engine';
import { koi, VARIETIES } from '@/vendor/ascii-animals/animals/koi';
import type { Animal, Creature, Flock } from '@/vendor/ascii-animals/flock';
import type { Pen } from '@/vendor/ascii-animals/renderer';
import { INK_LIT, ink, type RGB } from '@/vendor/ascii-animals/ink';
import { angleDiff } from '@/vendor/ascii-animals/math';
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

interface Wander {
  /** Heading the fish is steering by, radians. */
  a: number;
  /** Current turn rate, rad/s. */
  w: number;
  /** Passing through: ignores the walls until it re-enters. */
  leaving: boolean;
  /** How far it has turned while hugging a wall, radians; past half a loop it's let out instead of circling. */
  walled: number;
  x: number;
  y: number;
}

const wanders = new WeakMap<Creature, Wander>();
const MAX_TURN = 0.6;

/**
 * Where this fish wants to swim right now, in screen radians. A meander whose
 * turn rate averages zero (no endless circles), a gentle pull toward swimming
 * the long way across the pond, and soft walls: the fish looks ahead and veers
 * to whichever side the open water is, never toward a shared centre, so the
 * school doesn't bunch up. About one crossing in eight ignores the walls and
 * leave, to re-enter from another edge. Turn rates ease in and are capped, so
 * there are no sharp snaps.
 */
export function wanderHeading(f: Creature, flock: Flock<any>, dt: number) {
  let s = wanders.get(f);
  if (!s) {
    s = { a: f.heading, w: 0, leaving: false, walled: 0, x: f.x, y: f.y };
    wanders.set(f, s);
  }
  // A jump since the last step means the fish re-entered upstream: carry on from its new heading.
  if (Math.hypot(f.x - s.x, f.y - s.y) > f.span * 0.5) {
    s.a = f.heading;
    s.w = 0;
    s.walled = 0;
    s.leaving = Math.random() < 0.12;
  }
  const t = flock.time;
  let turn = 0.14 * Math.sin(t * 0.11 + f.id * 1.9) + 0.08 * Math.sin(t * 0.27 + f.id * 4.3);
  // The pond is wide and shallow: lean toward horizontal travel.
  turn -= 0.15 * Math.sin(2 * s.a);
  if (!s.leaving) {
    const look = f.span * 0.5 + 40;
    const ax = f.x + Math.cos(s.a) * look;
    const ay = f.y + Math.sin(s.a) * look;
    const m = Math.min(flock.width, flock.height) * 0.08;
    const px = ax < m ? m - ax : ax > flock.width - m ? flock.width - m - ax : 0;
    const py = ay < m ? m - ay : ay > flock.height - m ? flock.height - m - ay : 0;
    if (px || py) {
      // Turn toward the side the open water is on (left or right of the heading), harder the closer the wall.
      const side = Math.cos(s.a) * py - Math.sin(s.a) * px >= 0 ? 1 : -1;
      turn += side * MAX_TURN * Math.min(1, Math.hypot(px, py) / look);
      s.walled += Math.abs(s.w) * dt;
      if (s.walled > Math.PI * 0.9) s.leaving = true;
    } else {
      s.walled = Math.max(0, s.walled - dt * 0.5);
    }
  }
  s.w += (turn - s.w) * Math.min(1, dt * 1.2);
  s.w = Math.max(-MAX_TURN, Math.min(MAX_TURN, s.w));
  s.a += s.w * dt;
  return s.a;
}

/**
 * Koi tuned for the pond: slower than stock, a little larger and mostly near
 * (the artboard's fish sat at depths 0.7–1), in small cells (about 6 px wide on desktop).
 */
export const pondKoi: Animal<any> = {
  ...koi,
  key: 'pond-koi',
  label: 'Pond koi',
  // Gentle separation: the stock push (780) suits fish swimming in parallel; crossing paths it snaps
  // them round. At 60 a passing neighbour nudges a fish's course by at most ~24°.
  defaults: { ...koi.defaults, speed: 1, separation: 60, detail: 1.76, size: 2.2, farthest: 0.62, farBias: 1, trail: 3, fog: 0.55 },
  create(c, flock) {
    const fish = koi.create(c, flock as Flock<any>);
    return { ...fish, variety: (firstVariety + c.id) % VARIETIES.length };
  },
  // Fish seeded at the start face different ways (golden-angle spread) instead of all along the course.
  enter(f, flock) {
    if (!wanders.has(f)) f.heading = f.id * 2.39996;
    koi.enter!(f, flock);
  },
  // The stock koi read their course from the shared `direction` knob. Point it at this fish's own
  // heading while it moves, so steering, leaving and re-entering all follow that fish.
  update(f, flock, dt) {
    const k = flock.tuning;
    const shared = k.direction;
    k.direction = (-wanderHeading(f, flock, dt) * 180) / Math.PI;
    koi.update(f, flock, dt);
    k.direction = shared;
    const s = wanders.get(f);
    if (s) {
      s.x = f.x;
      s.y = f.y;
    }
  },
  drawAll(flock, pen) {
    koi.drawAll!(flock, pen);
    drawPads(flock, pen);
  },
};

export function mountPond(canvas: HTMLCanvasElement) {
  const width = canvas.getBoundingClientRect().width;
  const engine = new AnimalEngine(canvas, { animal: pondKoi, count: koiCount(width), theme: 'dark' });
  // Dev only: lets the behaviour checks read fish positions.
  if (import.meta.env.DEV) (window as unknown as { __pond: AnimalEngine }).__pond = engine;
  return engine;
}
