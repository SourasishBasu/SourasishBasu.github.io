/**
 * Geometry for the film CDs, after the A24 concept site (a24.raviklaassens.com,
 * via the Wayback Machine): the row runs diagonally, climbing to the right.
 * It moves like a belt: the disc in focus is front and centre, largest, and
 * turned almost square to you; the discs either side shrink and fall back into
 * the stage, tilted at A24's angle as they arrive and leave.
 * Distances are in disc steps (0 = the disc in focus); px values are at the
 * desktop disc size and get multiplied by the stage's unit for smaller discs.
 */

export interface DiscPose {
  x: number;
  y: number;
  z: number;
  scale: number;
  opacity: number;
  /** How far the disc is turned toward A24's three-quarter angle: small at the focus, 1 a step or more away. */
  tilt: number;
  /** Stacking order: the focus on top, then outward. */
  order: number;
  /** Far discs are hidden and take no clicks. */
  visible: boolean;
}

export const STEP_X = 290;
export const STEP_Y = 86;
export const STEP_Z = 120;
/** The three-quarter angle (A24's gallery uses −30° on X and Y). */
export const TILT_DEG = 30;
/** The focused disc keeps a little of that angle, so its edge and rim still read. */
export const FOCUS_TILT = 0.25;
/** Discs this many steps or more from the focus aren't drawn. Discs between 2.5 and this are drawn but transparent, so they're already rasterised when they slide in. */
export const RENDER_RADIUS = 4;
/** Posters load for discs within this many steps, so the next ones are ready. */
export const LOAD_RADIUS = 5;

/** Pose of a disc `d` steps from the focus (negative = left). */
export function discPose(d: number): DiscPose {
  const a = Math.abs(d);
  const c = Math.min(2.5, a);
  return {
    x: d * STEP_X,
    y: 0 - d * STEP_Y,
    z: 0 - c * STEP_Z,
    scale: 1 - c * 0.15,
    opacity: a <= 1.5 ? 1 : Math.max(0, 1 - (a - 1.5)),
    tilt: FOCUS_TILT + (1 - FOCUS_TILT) * Math.min(1, a),
    order: Math.round(100 - a * 10),
    visible: a < 2.5,
  };
}

/** The CSS transform for a disc `d` steps away, at `unit` (1 = desktop disc size). */
export function discTransform(d: number, unit: number) {
  const p = discPose(d);
  return `translate3d(${(p.x * unit).toFixed(1)}px,${(p.y * unit).toFixed(1)}px,${(p.z * unit).toFixed(1)}px) scale(${p.scale.toFixed(3)})`;
}

/** The turn of the disc itself (top back, right side forward), for a disc `d` steps away. */
export function discTilt(d: number) {
  const deg = TILT_DEG * discPose(d).tilt;
  return `rotateX(${deg.toFixed(2)}deg) rotateY(${(-deg).toFixed(2)}deg)`;
}
