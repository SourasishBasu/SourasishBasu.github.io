/**
 * Just enough PNG decoding to find where a transparent image's visible pixels
 * are: its size and the bounding box of pixels that aren't (nearly) transparent.
 * Used at build time to tell a wide title logo from a stacked one, since
 * fanart.tv puts every logo on the same 800×310 canvas. Handles 8- and 16-bit
 * RGBA and grey + alpha, and palette images with a transparency chunk; for
 * anything else (no alpha, interlaced) the whole canvas counts as visible.
 * Inflates with the standard DecompressionStream (PNG data is zlib-wrapped deflate).
 */
export interface PngInfo {
  width: number;
  height: number;
  /** Visible pixels' bounding box, or null when every pixel is transparent. */
  bounds: { x: number; y: number; w: number; h: number } | null;
}

const SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];
const CHANNELS: Record<number, number> = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };

export async function pngInfo(buf: Uint8Array, threshold = 16): Promise<PngInfo | null> {
  if (buf.length < 33 || SIGNATURE.some((b, i) => buf[i] !== b)) return null;
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  let width = 0;
  let height = 0;
  let depth = 0;
  let type = 0;
  let interlace = 0;
  let trns: Uint8Array | null = null;
  const idat: Uint8Array[] = [];
  for (let off = 8; off + 8 <= buf.length; ) {
    const len = dv.getUint32(off);
    const tag = String.fromCharCode(buf[off + 4], buf[off + 5], buf[off + 6], buf[off + 7]);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (tag === 'IHDR') {
      width = dv.getUint32(off + 8);
      height = dv.getUint32(off + 12);
      depth = buf[off + 16];
      type = buf[off + 17];
      interlace = buf[off + 20];
    } else if (tag === 'tRNS') trns = data;
    else if (tag === 'IDAT') idat.push(data);
    else if (tag === 'IEND') break;
    off += 12 + len;
  }
  if (!width || !height || !(type in CHANNELS)) return null;
  const whole = { width, height, bounds: { x: 0, y: 0, w: width, h: height } };
  const alpha = type === 6 || type === 4 || (type === 3 && trns);
  if (!alpha || interlace) return whole;

  const bitsPerPixel = CHANNELS[type] * depth;
  const bpp = Math.max(1, bitsPerPixel >> 3);
  const stride = Math.ceil((width * bitsPerPixel) / 8);
  let raw: Uint8Array;
  try {
    const all = new Uint8Array(idat.reduce((n, d) => n + d.length, 0));
    let at = 0;
    for (const d of idat) all.set(d, (at += d.length) - d.length);
    const stream = new Blob([all]).stream().pipeThrough(new DecompressionStream('deflate'));
    raw = new Uint8Array(await new Response(stream).arrayBuffer());
  } catch {
    return whole;
  }
  if (raw.length < (stride + 1) * height) return whole;

  // Undo each row's filter, then note where the visible pixels are.
  let prev = new Uint8Array(stride);
  let cur = new Uint8Array(stride);
  let x0 = width;
  let y0 = height;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < height; y++) {
    const base = y * (stride + 1);
    const filter = raw[base];
    for (let i = 0; i < stride; i++) {
      const v = raw[base + 1 + i];
      const a = i >= bpp ? cur[i - bpp] : 0;
      const b = prev[i];
      const c = i >= bpp ? prev[i - bpp] : 0;
      let out = v;
      if (filter === 1) out = v + a;
      else if (filter === 2) out = v + b;
      else if (filter === 3) out = v + ((a + b) >> 1);
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        out = v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
      }
      cur[i] = out & 255;
    }
    for (let x = 0; x < width; x++) {
      let al: number;
      if (type === 6) al = cur[x * 4 * (depth >> 3) + 3 * (depth >> 3)];
      else if (type === 4) al = cur[x * 2 * (depth >> 3) + (depth >> 3)];
      else {
        const bit = x * depth;
        const index = (cur[bit >> 3] >> (8 - depth - (bit & 7))) & ((1 << depth) - 1);
        al = index < trns!.length ? trns![index] : 255;
      }
      if (al > threshold) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        y1 = y;
      }
    }
    [prev, cur] = [cur, prev];
  }
  return { width, height, bounds: x1 < 0 ? null : { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 } };
}
