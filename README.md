# Sourasish Basu: personal site

Personal site of Sourasish Basu, platform engineer, live at https://sourasishbasu.pages.dev. It has two pages: **Work** (`/`) and **Off the clock** (`/off-the-clock/`). The whole site is drawn as a sheet of paper on a cutting mat.

## Stack

- [Astro](https://astro.build) with static output, TypeScript
- Plain CSS with custom properties (`src/styles/tokens.css`), scoped styles per component
- React islands only where a copied-in component needs them (`client:visible`), with Tailwind v4 (theme + utilities, no preflight) and the shadcn layout (`components.json`, `@/components/ui`, `@/lib/utils`) so components from shadcn, 21st.dev, React Bits and Canvas UI drop in
- Vendored, dependency-free canvas engines in `src/vendor/` (ascii-animals: the koi and the 404's butterflies)
- Self-hosted fonts from Fontsource: Archivo (variable, width axis), IBM Plex Sans, IBM Plex Mono
- Tests: Node's built-in test runner (`node:test`) with native TypeScript stripping

## Commands

Node 26.13.1 LTS (see `.node-version` / `.nvmrc`; `nvm use` picks it up).

| Command | What it does |
| --- | --- |
| `npm ci` | Install the locked dependencies |
| `npm run dev` | Dev server on http://localhost:4321 |
| `npm run build` | Static build into `dist/` |
| `npm run preview` | Serve `dist/` locally |
| `npm run check` | Type-check `.astro` and `.ts` files |
| `npm test` | Unit tests plus checks on the built site (run `npm run build` first) |

## Layout

```
src/
  data/        site, experience, projects and tools content (typed TS)
  lib/         small helpers (flap cells, shadcn's cn())
  styles/      tokens.css (light + dark), global.css (sheet, bands, primitives)
  layouts/     Base.astro: head, fonts, sheet, top bar, footer
  components/  TopBar, Footer, IstClock, work/*, off/*, pond/* (koi pond)
  components/ui/  copied-in React components (21st.dev ridgeline range)
  vendor/      third-party source kept diffable against upstream
  pages/       index (Work), off-the-clock, resume, credits, 404
public/        favicon, tool icons, legacy policy pages and sitemap (kept at their old paths)
tests/         unit.test.ts, build.test.ts
```

## Deploy

Cloudflare Pages, connected to this repository: every push to `main` builds (`npm run build`, Node from `.node-version`) and deploys `dist/`.

## Credits

Tool logos come from [simple-icons](https://simpleicons.org) (CC0) and [devicon](https://devicon.dev) (MIT). The koi pond and the 404's butterflies run on [ascii-animals](https://github.com/DesignerStephen1/ascii-animals) (MIT), and the Work footer range is the 21st.dev ridgeline dither footer by @kedhareswer. See `THIRD_PARTY_NOTICES.md`.
