# ascii-animals (vendored)

From https://github.com/DesignerStephen1/ascii-animals at commit `93f2b66` (2026-11-16), MIT licensed (see `LICENSE`, © 2026 drewdi, Stephen Zhang).

Files are copied as-is: `engine.ts`, `flock.ts`, `renderer.ts`, `ink.ts`, `math.ts`, `animals/koi.ts`. The only change is in `engine.ts`, which imports the koi directly instead of loading the by-name registry of all seven animals.

The pond (lily pads, tuning, theme) lives in `src/components/pond/`, outside this folder, so the vendored files stay diffable against upstream.
