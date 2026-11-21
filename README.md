# sourasishbasu.github.io

Personal site of Sourasish Basu, platform engineer. It has two pages: **Work** (`/`) and **Off the clock** (`/off-the-clock/`). The whole site is drawn as a sheet of paper on a cutting mat.

## Stack

- [Astro](https://astro.build) with static output, TypeScript
- Plain CSS with custom properties (`src/styles/tokens.css`), scoped styles per component
- Self-hosted fonts from Fontsource: Archivo (variable, width axis), IBM Plex Sans, IBM Plex Mono
- Tests: Node's built-in test runner (`node:test`) with native TypeScript stripping

## Commands

Node 22.23.1 (see `.node-version`).

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
  lib/         small pure helpers (ridgeline paths, flap cells)
  styles/      tokens.css (light + dark), global.css (sheet, bands, primitives)
  layouts/     Base.astro: head, fonts, sheet, top bar, footer
  components/  TopBar, Footer, IstClock, work/*, off/*
  pages/       index (Work), off-the-clock, 404
public/        favicon, tool icons, legacy policy pages and sitemap (kept at their old paths)
tests/         unit.test.ts, build.test.ts
```

## Deploy

Cloudflare Pages, connected to this repository:

- Build command: `npm run build`
- Output directory: `dist`
- Node version: from `.node-version`

## Credits

Tool logos come from [simple-icons](https://simpleicons.org) (CC0) and [devicon](https://devicon.dev) (MIT). See `THIRD_PARTY_NOTICES.md`.
