/**
 * ASCII butterflies for the 404: the vendored ascii-animals butterflies in the name board's four chip colours, on the
 * dark sheet's own paper, with no trail behind them. Click to scatter them.
 *
 * Flight, against the stock migration: they glide far less often (stock glides about once a second, wings held flat,
 * which reads as drifting without flapping), beat a little faster, and barely sway as a group, so each one's own
 * flutter carries the motion. Depth runs from a third to full size, weighted toward far, so sizes spread about threefold.
 */
import { AnimalEngine } from '@/vendor/ascii-animals/engine';
import { butterflies } from '@/vendor/ascii-animals/animals/butterflies';
import type { RGB } from '@/vendor/ascii-animals/ink';

const PAPER: RGB = [16, 18, 21];

export function mountButterflies(canvas: HTMLCanvasElement) {
  const narrow = canvas.getBoundingClientRect().width < 760;
  const engine = new AnimalEngine(canvas, {
    animal: butterflies,
    count: narrow ? 6 : 10,
    theme: 'dark',
    tuning: {
      trail: 0,
      glide: 0.2,
      flapRate: 1.35,
      flutter: 0.7,
      sway: 0.08,
      spread: 0.7,
      direction: 24,
      speed: 0.8,
      size: narrow ? 1.25 : 1.75,
      farthest: 0.32,
      farBias: 1.5,
      fog: 0.2,
      grid: 0.8,
    },
  });
  // The renderer paints its own paper; match the sheet's.
  const r = (engine as unknown as { renderer: { palette: { background: RGB }; restyle(): void } }).renderer;
  r.palette = { ...r.palette, background: PAPER };
  r.restyle();
  // Dev only: lets the flight checks read the butterflies.
  if (import.meta.env.DEV) (window as unknown as { __butterflies: AnimalEngine }).__butterflies = engine;
  return engine;
}
