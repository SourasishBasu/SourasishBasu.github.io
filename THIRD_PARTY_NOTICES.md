# Third-party notices

## Fonts

Self-hosted through [Fontsource](https://fontsource.org) packages (MIT-licensed package code). The font files are under the SIL Open Font License 1.1:

- **Archivo**, Copyright 2020 The Archivo Project Authors (https://github.com/Omnibus-Type/Archivo)
- **IBM Plex Sans** and **IBM Plex Mono**, Copyright © 2017 IBM Corp. with Reserved Font Name "Plex"

OFL 1.1: https://openfontlicense.org

## Resume (`resume/`)

- **Typst**, compiled at build time by **typst.ts** (`@myriaddreamin/typst-ts-node-compiler`), Apache License 2.0 (https://github.com/Myriad-Dreamin/typst.ts). A build tool; none of it ships with the site.
- **New Computer Modern** (built into Typst), GUST Font License; subsets are embedded in the PDF.
- **Font Awesome 4.7** (`resume/fonts/FontAwesome.otf`), by Dave Gandy, SIL Open Font License 1.1, for the contact icons; subsets are embedded in the PDF.
- The layout follows the LaTeX resume template by Aras Gungore (MIT).

## Tool logos (`public/icons/tools/`)

Brand marks belong to their owners and are shown only to say which tools I use.

- **simple-icons** 16.37.0 (https://simpleicons.org), released under CC0 1.0. Files: `ansible`, `claude`, `cursor`, `docker`, `ghostty`, `githubactions`, `gnubash`, `go`, `googlecloud`, `grafana`, `kubernetes`, `obsidian`, `opencode`, `opentelemetry`, `podman`, `postgresql`, `prometheus`, `python`, `snowflake`, `temporal`, `terraform`, `victoriametrics`.
- **devicon** 2.18.0 (https://devicon.dev). Files: `aws` (the multi-colour `amazonwebservices-original`), `azure`, `argocd`, `loki`.

```
MIT License

Copyright (c) 2015 konpa

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## ASCII animals: koi pond and 404 butterflies (`src/vendor/ascii-animals/`)

**ascii-animals** (https://github.com/DesignerStephen1/ascii-animals), commit `93f2b66`, built on stackedlol/ascii-sharks. Vendored: the engine, the koi (Off the clock pond) and the butterflies (404 page), with small changes marked `portfolio:` and described in the folder's README.

```
MIT License

Copyright (c) 2026 drewdi
Copyright (c) 2026 Stephen Zhang

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Work footer range (`src/components/ui/ridgeline-dither-footer.tsx`)

**ridgeline-dither-footer**, a 21st.dev community component by @kedhareswer (https://21st.dev). Copied in as published, with a scene-only mode added (changes are marked `portfolio:` in the file).

## Company marks (`public/logos/`)

- `atlan-mark.png`: Atlan's favicon mark from its brand guidelines (https://atlan.com/brand/logo/), downsized to 160 px, colours unchanged as the guidelines require.
- `anonymous-digital-mark.png`: Anonymous Digital's site icon (https://www.anonymousdigital.com/).

Both are trademarks of their owners, shown to name my employers.

## Gunpla viewer (`src/components/off/gunpla/`)

- **three.js** 0.187.0 (https://threejs.org), MIT License, Copyright © 2010-2026 three.js authors. Loaded on demand with the viewer, including the addons `RoomEnvironment` and `GLTFLoader`.
- The **Gundam Dynames** 3D model in `public/models/dynames.glb` is "Gundam Dynames" by MrGundam on Thingiverse (https://www.thingiverse.com/thing:184096), CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/). Changed: converted from the published SketchUp `.skp` file to glTF, recoloured per material after Bandai's MG 1/100 Gundam Dynames product photos (`notes/gunpla/repaint-glb.mjs`), and slimmed for the web (unused UVs dropped, vertex data quantised with KHR_mesh_quantization; `notes/gunpla/slim-glb.mjs`). `public/models/dynames.glb` is distributed under CC BY-SA 4.0. The geometry is as published. Gundam and its mobile suit designs are © Sotsu·Sunrise; Gunpla is a trademark of Bandai Spirits.
- The **Gundam Virtue** 3D model in `public/models/virtue.glb` is "Gundam Virtue" by cosmos28 on Sketchfab (https://sketchfab.com/3d-models/gundam-virtue-7f3bc6b2e4544c809a6bfd4cf77db777), CC BY 4.0. Changed: repainted in clean kit colours (the weathering removed, panel lines kept, metal-roughness and occlusion maps dropped; `notes/gunpla/repaint-glb.mjs`), then slimmed for the web (textures as 1024 px JPEGs, vertex data quantised with KHR_mesh_quantization; `notes/gunpla/slim-glb.mjs`). The geometry is as published.
- The **Freedom Gundam** 3D model in `public/models/freedom.glb` is "Freedom Gundam" by Ammer on Sketchfab (https://sketchfab.com/3d-models/freedom-gundam-e04d497c3765423886597443b4ce825e), CC BY 4.0. It came untextured; changed: coloured per material after Bandai's MG 1/100 Freedom Ver. 2.0 product photo (one material split by height so only its upper parts stay red), then slimmed the same way. The geometry is as published. Credited on the page under each kit.
- The kit pictures in `public/gunpla/` (Dynames, Virtue, Vidar, Freedom) are cut out of Bandai's official product photos (Dynames, Virtue and Freedom from the Gundam Planet and HLJ listings, Vidar from Bandai's CG render on HLJ), then cut out with macOS Vision's subject lifting and given a light posterise and a thin outline (`notes/gunpla/lift.swift`, not shipped). Photos © Bandai Spirits; designs © Sotsu·Sunrise. Replace them with photos of the built kits when there are some.

## Film disc art (`src/data/disc-art.ts`)

- By default each disc prints the film's Letterboxd still (TMDB and Letterboxd imagery), cropped square at build time with sharp's attention strategy through Astro's image service, and served from the site.
- With a `FANART_API_KEY`, discs use fanart.tv's community disc art where it exists, and its title logos on discs that print a still (https://fanart.tv). fanart.tv's terms let uploads be used without attribution; copyright in the artwork stays with its owners. Textless posters from fanart.tv (language code 00) are used as key art when TMDB has none.
- With a `TMDB_API_KEY`, discs without disc art print the film's textless poster (key art) from TMDB (https://www.themoviedb.org). This product uses the TMDB API but is not endorsed or certified by TMDB; the credits page (`/credits/`, linked from the Off the clock footer) carries that notice with TMDB's approved logo (`public/credits/tmdb.svg`, from https://www.themoviedb.org/about/logos-attribution, unaltered). Copyright in the posters stays with their owners.

