# ascii-animals (vendored)

From https://github.com/DesignerStephen1/ascii-animals at commit `93f2b66` (2026-11-16), MIT licensed (see `LICENSE`, © 2026 drewdi, Stephen Zhang).

Files are copied as-is: `engine.ts`, `flock.ts`, `renderer.ts`, `ink.ts`, `math.ts`, `animals/koi.ts`, `animals/butterflies.ts`. Three files are changed, each marked `portfolio:`: `engine.ts` imports the koi directly instead of loading the by-name registry of all seven animals, `animals/koi.ts` adds two varieties (tancho, asagi) and exports `VARIETIES`, and `animals/butterflies.ts` paints each butterfly in one of the site's four chip colours (`WINGS`) instead of every one as a blue morpho.

The pond (lily pads, tuning, theme) lives in `src/components/pond/` and the 404's butterfly tuning in `src/components/notfound/`, outside this folder, so the vendored files stay diffable against upstream.
