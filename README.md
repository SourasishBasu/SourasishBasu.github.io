# sourasishbasu.github.io

Personal site of Sourasish Basu, platform engineer. It has two pages: **Work** (`/`) and **Off the clock** (`/off-the-clock/`). The whole site is drawn as a sheet of paper on a cutting mat.

## Stack

- [Astro](https://astro.build) with static output, TypeScript
- Plain CSS with custom properties (`src/styles/tokens.css`), scoped styles per component
- React islands only where a copied-in component needs them (`client:visible`), with Tailwind v4 (theme + utilities, no preflight) and the shadcn layout (`components.json`, `@/components/ui`, `@/lib/utils`) so components from shadcn, 21st.dev, React Bits and Canvas UI drop in
- Vendored, dependency-free canvas engines in `src/vendor/` (the ascii-animals koi)
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
| `npm run films:refresh` | Refresh the committed Letterboxd snapshot used when a build can't reach Letterboxd |

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
  pages/       index (Work), off-the-clock, resume (+ resume.pdf), credits, 404
resume/        resume.typ (the words), template.typ (the layout), fonts/ (Font Awesome 4 icons)
public/        favicon, tool icons, legacy policy pages and sitemap (kept at their old paths)
tests/         unit.test.ts, build.test.ts
```

## Letterboxd

The film shelf on Off the clock is read at build time from the public diary RSS (`src/data/letterboxd.ts`): the latest films rated 3.5+ (12 of them), each with its still and director from its film page. If Letterboxd can't be reached, the build uses `src/data/recent-films.snapshot.json`. The all-time and this-year counts live behind a bot check on the profile page, so the build tries once and otherwise uses the stored numbers in `src/data/films.ts`. A scheduled rebuild keeps it fresh (see Deploy).

Disc art (`src/data/disc-art.ts`): each film's 1920×1080 still is cropped square around its subject at build time (sharp's attention crop, via Astro's image service) and served from the site, so nobody ends up under the hub. Set `FANART_API_KEY` (a free fanart.tv project key, fanart.tv/get-an-api-key) in the Cloudflare Pages build environment to print real disc art where fanart.tv has it, and the film's title logo on discs that print a still; the key is read at build time only. For films without disc art, set `TMDB_API_KEY` to a TMDB API Read Access Token (the long token on themoviedb.org/settings/api, free with an account) and discs use the film's textless poster art from TMDB before falling back to the still; TMDB's required notice and logo are on the credits page (`/credits/`), linked from the Off the clock footer. `src/data/disc-art-overrides.ts` fixes a film that crops badly (use its poster, or steer the crop).

## Resume

The resume is Typst, not LaTeX: edit `resume/resume.typ` (a `- ` line is a point, `*bold*`, `--` an en dash) and leave the look to `resume/template.typ`. Every build compiles it with typst.ts (`src/data/resume.ts`) into `/resume.pdf` and the drawing on `/resume/`, so nothing generated is committed; `npm run dev` shows edits on refresh. The Footer's Résumé button opens `/resume/`. The layout follows the old LaTeX template (Aras Gungore's, MIT) in New Computer Modern, which is built into Typst.

## Deploy

Cloudflare Pages project `sourasishbasu` (https://sourasishbasu.pages.dev), connected to this repository. Pushes to `main` deploy to production; other branches don't build.

- Build command: `npm run build`
- Output directory: `dist`, with Pages build caching on
- Node version: from `.node-version`
- `FANART_API_KEY` and `TMDB_API_KEY`: encrypted production variables in the project's settings
- Freshness: a daily rebuild through a Pages deploy hook (triggered by a scheduled Cloudflare Worker) refreshes the Letterboxd shelf

## Credits

Tool logos come from [simple-icons](https://simpleicons.org) (CC0) and [devicon](https://devicon.dev) (MIT). The koi pond runs on [ascii-animals](https://github.com/DesignerStephen1/ascii-animals) (MIT), and the Work footer range is the 21st.dev ridgeline dither footer by @kedhareswer. See `THIRD_PARTY_NOTICES.md`.
