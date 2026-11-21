/** How many koi for a pond this wide: one per ~240 px, 3 to 6. */
export function koiCount(width: number) {
  return Math.min(6, Math.max(3, Math.round(width / 240)));
}
