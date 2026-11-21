/**
 * Geometry for the film CDs, after the A24 concept site (a24.raviklaassens.com,
 * via the Wayback Machine): every disc lies tilted back at the same angle, and
 * the row climbs diagonally to the right, nearer and larger toward the right.
 * Distances are in disc steps (0 = the disc in focus); px values are at the
 * desktop disc size and get multiplied by the stage's unit for smaller discs.
 */

export interface DiscPose {
  x: number;
  y: number;
  z: number;
  scale: number;
  opacity: number;
  /** Stacking order: nearer (right-hand) discs on top. */
  order: number;
  /** Far discs are hidden and take no clicks. */
  visible: boolean;
}

export const STEP_X = 290;
export const STEP_Y = 86;
export const STEP_Z = 100;
/** Discs this many steps or more from the focus aren't drawn. Discs between 2.5 and this are drawn but transparent, so they're already rasterised when they slide in. */
export const RENDER_RADIUS = 4;
/** Posters load for discs within this many steps, so the next ones are ready. */
export const LOAD_RADIUS = 5;

/** Pose of a disc `d` steps from the focus (negative = left, farther). */
export function discPose(d: number): DiscPose {
  const a = Math.abs(d);
  const c = Math.max(-2.5, Math.min(2.5, d));
  return {
    x: d * STEP_X,
    y: 0 - d * STEP_Y,
    z: d * STEP_Z,
    scale: 1 + c * 0.12,
    opacity: a <= 1.5 ? 1 : Math.max(0, 1 - (a - 1.5)),
    order: Math.round(100 + d * 10),
    visible: a < 2.5,
  };
}

/** The CSS transform for a disc `d` steps away, at `unit` (1 = desktop disc size). */
export function discTransform(d: number, unit: number) {
  const p = discPose(d);
  return `translate3d(${(p.x * unit).toFixed(1)}px,${(p.y * unit).toFixed(1)}px,${(p.z * unit).toFixed(1)}px) scale(${p.scale.toFixed(3)})`;
}
