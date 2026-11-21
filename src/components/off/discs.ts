/**
 * Geometry for the film CDs, after the A24 concept site (a24.raviklaassens.com,
 * via the Wayback Machine): every disc lies tilted back at the same angle, and
 * the row climbs diagonally to the right, nearer and larger toward the right.
 * Distances are in disc steps (0 = the disc in focus); px values are at the
 * desktop disc size and CSS scales them with --u.
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

export const STEP_X = 300;
export const STEP_Y = 92;
export const STEP_Z = 110;

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

/** Which disc a pinned scroll has reached: `scrolled` px into a track of `step` px per disc, as a fraction. */
export function positionFromScroll(scrolled: number, step: number, count: number) {
  if (count < 2 || step <= 0) return 0;
  return Math.max(0, Math.min(count - 1, scrolled / step));
}
