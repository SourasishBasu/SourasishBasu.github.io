/**
 * Dust: faint motes drifting in the Off the clock lamp glow, after the "Dust"
 * component on danielsun.space. Sparse, tiny and lavender-white, denser and
 * brighter near the top where the glow is strongest. They drift on a gentle
 * flow field, twinkle, and part around the pointer. Pauses off-screen, caps
 * DPR at 2, and draws one still frame under reduced motion.
 */

interface Mote {
  x: number;
  y: number;
  r: number;
  a: number;
  tw: number;
  ph: number;
}

const COUNT_PER_MPX = 90; // motes per million CSS px² of hero
const REPEL = 110;

export function mountDust(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let w = 0;
  let h = 0;
  let dpr = 1;
  let motes: Mote[] = [];
  let raf = 0;
  let visible = true;
  let last = performance.now();
  let px = -1e4;
  let py = -1e4;

  const seed = () => {
    const n = Math.max(24, Math.round(((w * h) / 1e6) * COUNT_PER_MPX));
    motes = Array.from({ length: n }, () => ({
      x: Math.random() * w,
      // Biased toward the top, where the glow is.
      y: Math.pow(Math.random(), 1.8) * h,
      r: 0.45 + Math.random() * 0.75,
      a: 0.25 + Math.random() * 0.55,
      tw: 0.6 + Math.random() * 1.6,
      ph: Math.random() * Math.PI * 2,
    }));
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    seed();
    draw(performance.now(), 0);
  };

  const draw = (now: number, dt: number) => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const t = now / 1000;
    for (const m of motes) {
      if (dt > 0) {
        // Sum-of-sines flow: a slow sideways drift that curls a little.
        const fx = Math.sin(m.y * 0.012 + t * 0.21) + 0.5 * Math.sin(m.y * 0.031 - t * 0.13);
        const fy = 0.35 + Math.cos(m.x * 0.01 + t * 0.17) * 0.6;
        m.x += fx * 6 * dt;
        m.y += fy * 4 * dt;
        const dx = m.x - px;
        const dy = m.y - py;
        const d2 = dx * dx + dy * dy;
        if (d2 < REPEL * REPEL && d2 > 0.01) {
          const d = Math.sqrt(d2);
          const push = (1 - d / REPEL) * 60 * dt;
          m.x += (dx / d) * push;
          m.y += (dy / d) * push;
        }
        if (m.x < -4) m.x += w + 8;
        if (m.x > w + 4) m.x -= w + 8;
        if (m.y > h + 4) {
          m.y = -4;
          m.x = Math.random() * w;
        }
        if (m.y < -4) m.y = h;
      }
      // Fades out with the glow toward the bottom; twinkles on its own clock.
      const glow = Math.max(0, 1 - m.y / (h * 0.85));
      const alpha = m.a * (0.35 + 0.65 * glow) * (0.6 + 0.4 * Math.sin(t * m.tw + m.ph));
      if (alpha < 0.02) continue;
      ctx.fillStyle = `rgba(228,226,255,${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const frame = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    draw(now, dt);
    raf = requestAnimationFrame(frame);
  };

  const schedule = () => {
    cancelAnimationFrame(raf);
    if (!visible || reduced.matches) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };

  const onMove = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    px = e.clientX - rect.left;
    py = e.clientY - rect.top;
  };
  const onLeave = () => {
    px = -1e4;
    py = -1e4;
  };

  const host = canvas.parentElement ?? canvas;
  host.addEventListener('pointermove', onMove);
  host.addEventListener('pointerleave', onLeave);
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  const io = new IntersectionObserver(([entry]) => {
    visible = !!entry?.isIntersecting;
    schedule();
  });
  io.observe(canvas);
  reduced.addEventListener('change', schedule);
  resize();
  schedule();

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    reduced.removeEventListener('change', schedule);
    host.removeEventListener('pointermove', onMove);
    host.removeEventListener('pointerleave', onLeave);
  };
}
