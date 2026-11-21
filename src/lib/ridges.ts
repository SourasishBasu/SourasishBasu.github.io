/**
 * Dithered ridgelines for the Work footer, ported from the artboard's ridge().
 * Seven layers, back to front; each is a closed path filled with a dot pattern.
 * `mx` is the pointer x in viewBox units: the ridge lifts in a gaussian bump under it.
 */
export const RIDGE_W = 1312;
export const RIDGE_H = 280;
export const RIDGE_LAYERS = 7;

const SHAPE = [0.42, 0.55, 0.38, 0.62, 0.8, 0.58, 0.47, 0.9, 0.74, 0.66, 0.5, 0.71];
const STEP = 16;

export function ridgePath(i: number, mx: number | null = null): string {
  const base = 96 + i * 26;
  const amp = 26 + i * 9;
  const pts: string[] = [];
  for (let x = 0; x <= RIDGE_W; x += STEP) {
    const t = (x / RIDGE_W) * (SHAPE.length - 1);
    const k = Math.floor(t);
    const f = t - k;
    const d = SHAPE[k] * (1 - f) + SHAPE[Math.min(k + 1, SHAPE.length - 1)] * f;
    const wave = 0.5 + 0.5 * Math.sin(x * (0.006 + i * 0.0013) + i * 1.7) * Math.cos(x * 0.0021 + i);
    let y = base - amp * (0.35 + 0.65 * d) * wave;
    if (mx !== null) {
      const g = Math.exp(-((x - mx) * (x - mx)) / (2 * 70 * 70));
      y -= g * (10 + i * 5);
    }
    pts.push(`${x},${y.toFixed(1)}`);
  }
  return `M0,${RIDGE_H} L${pts.join(' L')} L${RIDGE_W},${RIDGE_H} Z`;
}
