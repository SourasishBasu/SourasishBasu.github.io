// Structural checks on the built site. Run `npm run build` first.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const dist = (p: string) => new URL(`../dist/${p}`, import.meta.url);
const html = (p: string) => readFileSync(dist(p), 'utf8');

test('policy pages and sitemap are carried byte for byte', () => {
  for (const f of ['privacy-policy.html', 'refund-policy.html', 'terms-of-service.html', 'support.html', 'sitemap.xml']) {
    const original = execFileSync('git', ['show', `fdc2657:static/${f}`]);
    assert.deepEqual(readFileSync(dist(f)), original, f);
  }
});

test('old blog posts are gone', () => {
  assert.equal(existsSync(dist('article')), false);
});

test('404: dark, butterflies in the main band, the lost pet in the footer', () => {
  const page = html('404.html');
  assert.match(page, /<html lang="en" data-theme="dark"/);
  assert.equal(tags(page, 'canvas', /class="field"/).length, 1);
  assert.match(page, /<h1[^>]*>Page not found<\/h1>/);
  const footer = page.slice(page.indexOf('<footer'), page.indexOf('</footer>'));
  assert.equal(tags(footer, 'div', /data-lost-pet/).length, 1);
  assert.doesNotMatch(footer, /E-ink pet named Sasquatch/);
  // Every other page keeps the usual pet.
  for (const p of ['index.html', 'off-the-clock/index.html', 'credits/index.html', 'resume/index.html']) {
    const f = html(p);
    assert.match(f.slice(f.indexOf('<footer')), /E-ink pet named Sasquatch/, p);
    assert.doesNotMatch(f, /data-lost-pet/, p);
  }
});

/** All opening tags of `name` in `src` whose attribute text matches every pattern. */
export function tags(src: string, name: string, ...patterns: RegExp[]): string[] {
  const all = src.match(new RegExp(`<${name}\\b[^>]*>`, 'g')) ?? [];
  return all.filter((t) => patterns.every((p) => p.test(t)));
}

test('work route is light, with Work as the current page', () => {
  const page = html('index.html');
  assert.doesNotMatch(page, /class="ruler/);
  assert.match(page, /<html[^>]*data-theme="light"/);
  assert.equal(tags(page, 'a', /href="\/"/, /aria-current="page"/).length, 1);
  assert.equal(tags(page, 'a', /href="\/off-the-clock\/"/).length, 1);
  assert.equal(tags(page, 'a', /href="\/off-the-clock\/"/, /aria-current/).length, 0);
});

test('off the clock route is dark, with its own current page', () => {
  const page = html('off-the-clock/index.html');
  assert.match(page, /<html[^>]*data-theme="dark"/);
  assert.equal(tags(page, 'a', /href="\/off-the-clock\/"/, /aria-current="page"/).length, 1);
  assert.match(page, /<h1[^>]*>Away from the terminal<\/h1>/);
});

test('the two critical fonts are preloaded', () => {
  const head = html('index.html').split('</head>')[0];
  assert.equal(tags(head, 'link', /rel="preload"/, /as="font"/, /crossorigin/).length, 2);
});

test('anchor targets clear the sticky bar', () => {
  const css = readdirSync(dist('_astro')).filter((f) => f.endsWith('.css')).map((f) => readFileSync(dist(`_astro/${f}`), 'utf8')).join('');
  assert.match(css, /scroll-padding-top:var\(--top-h\)/);
  assert.match(css, /--top-h:56px/);
});

test('get in touch points at the footer', () => {
  assert.equal(tags(html('index.html'), 'a', /href="#contact"/).length, 1);
});

test('both pages share the footer', () => {
  for (const p of ['index.html', 'off-the-clock/index.html']) {
    const page = html(p);
    const footer = page.slice(page.indexOf('<footer'), page.indexOf('</footer>'));
    assert.match(footer, /id="contact"/, p);
    assert.equal(tags(footer, 'a', /href="mailto:sourasishbasu06@gmail.com"/).length, 1, p);
    assert.equal(tags(footer, 'a', /href="https:\/\/github.com\/SourasishBasu"/).length, 1, p);
    assert.equal(tags(footer, 'a', /href="https:\/\/www.linkedin.com\/in\/sourasishbasu"/).length, 1, p);
    const resume = tags(footer, 'a', /class="ghost-btn resume/);
    assert.equal(resume.length, 1, p);
    assert.match(resume[0], /href="\/resume\/"/, p);
    assert.doesNotMatch(resume[0], /aria-disabled/, p);
    assert.match(footer, /SASQUATCH/, p);
    assert.match(footer, /<ist-clock/, p);
    assert.match(footer, /© <span data-copyright-year[^>]*>\d{4}<\/span> Sourasish Basu/, p);
    const legal = footer.slice(footer.indexOf('class="legal'));
    assert.doesNotMatch(legal, /ist-clock|IST/, p);
  }
});

test('work footer has the dithered range without the altimeter, off footer has the pond', () => {
  const work = html('index.html');
  const footer = work.slice(work.indexOf('<footer'), work.indexOf('</footer>'));
  const range = tags(footer, 'div', /class="rdf-root rdf-scene-only/);
  assert.equal(range.length, 1);
  assert.match(range[0], /aria-hidden="true"/);
  assert.match(footer, /<astro-island[^>]*client="visible"/);
  assert.match(footer, /<canvas/);
  assert.doesNotMatch(footer, /class="(rdf-alt|rdf-top|rdf-bar|bird)/);
  const off = html('off-the-clock/index.html');
  assert.equal(tags(off, 'div', /class="band pond/, /role="img"/).length, 1);
  assert.equal(tags(off, 'canvas', /class="pond-canvas/).length, 1);
});

test('credits page: TMDB logo and notice, linked only from the Off the clock footer', () => {
  const page = html('credits/index.html');
  assert.match(page, /<html[^>]*data-theme="dark"/);
  assert.equal(tags(page, 'img', /src="\/credits\/tmdb\.svg"/, /alt="TMDB"/).length, 1);
  assert.match(page, /This product uses the TMDB API but is not endorsed or certified by TMDB\./);
  for (const href of ['https://fanart.tv', 'https://letterboxd.com', 'https://threejs.org', 'https://www.thingiverse.com/thing:184096']) assert.equal(tags(page, 'a', new RegExp(`href="${href}"`)).length, 1, href);
  assert.ok(existsSync(dist('credits/tmdb.svg')));
  const legal = (p: string) => {
    const s = html(p);
    return s.slice(s.indexOf('class="legal'), s.indexOf('</footer>'));
  };
  assert.equal(tags(legal('off-the-clock/index.html'), 'a', /href="\/credits\/"/).length, 1);
  assert.equal(tags(legal('index.html'), 'a', /href="\/credits\/"/).length, 0);
  for (const p of ['index.html', 'off-the-clock/index.html']) assert.doesNotMatch(html(p), /not endorsed or certified by TMDB/, p);
});

test('third-party code is credited with its licence', () => {
  const notices = readFileSync(new URL('../THIRD_PARTY_NOTICES.md', import.meta.url), 'utf8');
  assert.match(notices, /ascii-animals/);
  assert.match(notices, /Copyright \(c\) 2026 drewdi/);
  assert.match(notices, /ridgeline-dither-footer/);
  assert.ok(existsSync(new URL('../src/vendor/ascii-animals/LICENSE', import.meta.url)));
});

// ---------- phase 2: Work page ----------

const section = (page: string, marker: string) => {
  const start = page.indexOf(marker);
  assert.ok(start >= 0, `missing ${marker}`);
  return page.slice(start, page.indexOf('</section>', start));
};
const text = (s: string) => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

test('hero: hidden h1, name board, stickers, status row, intro cells', () => {
  const page = html('index.html');
  assert.match(page, /<h1 class="sr-only"[^>]*>Sourasish Basu<\/h1>/);
  const board = section(page, 'class="board');
  assert.match(tags(page, 'div', /class="board/)[0], /aria-hidden="true"/);
  const letters = [...board.matchAll(/<span class="glyph"[^>]*>([A-Z])<\/span>/g)].map((m) => m[1]).join('');
  assert.equal(letters, 'SOURASISHBASU');
  for (const chip of ['chip-blue', 'chip-red', 'chip-yellow', 'chip-white']) assert.match(board, new RegExp(`tile ${chip}`));
  const stickers = [...board.matchAll(/data-tile="(\d+)"[\s\S]*?<b[^>]*>([A-Z0-9-]+)<\/b>/g)].map((m) => `${m[1]}:${m[2]}`);
  assert.deepEqual(stickers, ['0:ATLAN', '1:AI-NATIVE', '3:PWNAGOTCHI', '5:3XCAFFEINE', '9:LETTERBOXD', '10:GUNPLA']);
  const status = [...board.matchAll(/<span class="flap mini"[^>]*>([^<]*)<\/span>/g)].map((m) => m[1] || ' ');
  assert.equal(status.length, 20);
  assert.equal(status.join('').trimEnd(), 'PLATFORM @ ATLAN');
  assert.equal(tags(page, 'a', /href="#projects"/).length, 1);
  const intro = text(section(page, 'class="band hero'));
  assert.match(intro, /HELLO|Hello/);
  assert.match(intro, /I'm Sourasish, a platform engineer at Atlan\./);
  assert.match(intro, /Day job/);
  assert.match(intro, /Also into/);
  assert.match(intro, /a Pwnagotchi on a Pi Zero W/);
});

test('experience: Atlan tab selected, both panels rendered', () => {
  const page = html('index.html');
  const xp = section(page, 'class="band xp');
  assert.equal(tags(xp, 'div', /role="tablist"/).length, 1);
  const tabs = tags(xp, 'button', /role="tab"/);
  assert.equal(tabs.length, 2);
  assert.match(tabs[0], /aria-selected="true"/);
  assert.match(tabs[1], /aria-selected="false"/);
  assert.equal(tags(xp, 'article', /id="atlan"/).length, 1);
  assert.doesNotMatch(tags(xp, 'article', /id="atlan"/)[0], /hidden/);
  assert.match(tags(xp, 'article', /id="adm"/)[0], /hidden/);
  const atlan = text(xp.slice(xp.indexOf('id="atlan"'), xp.indexOf('id="adm"')));
  for (const s of ['Cloud cost', 'Dashboards', 'Alerting', '[monthly cloud spend cut]', '[hours saved a month]', '[clusters upgraded]', '[dashboards in daily use]', 'Platform Engineer', 'June 2025 – present · Remote'])
    assert.ok(atlan.includes(s), s);
  for (const t of ['Go', 'Temporal', 'Grafana', 'Sigma', 'VictoriaMetrics', 'Snowflake', 'Mixpanel']) assert.ok(atlan.includes(t), t);
  assert.doesNotMatch(atlan, /Intern/);
  const atlanHtml = xp.slice(xp.indexOf('id="atlan"'), xp.indexOf('id="adm"'));
  assert.ok(atlanHtml.indexOf('class="tags') < atlanHtml.indexOf('class="metrics'), 'tags sit above the numbers');
  const adm = text(xp.slice(xp.indexOf('id="adm"')));
  for (const s of ['3 5 %', '6 0 %', '2 0 0 +', '9 9 . 9 %', 'National Restaurant Association of India', 'June – Oct 2024 · Kolkata']) assert.ok(adm.includes(s), s);
});

test('tools: 26 logo tiles in five groups, icons present', () => {
  const page = html('index.html');
  const tools = section(page, 'class="band tools');
  const tiles = tags(tools, 'span', /class="ti\b/);
  assert.equal(tiles.length, 26);
  for (const t of tiles) {
    assert.match(t, /role="img"/);
    assert.match(t, /tabindex="0"/);
  }
  const labels = tiles.map((t) => t.match(/aria-label="([^"]+)"/)![1]);
  assert.equal(labels[0], 'AWS');
  assert.equal(labels.at(-1), 'Obsidian');
  for (const gone of ['Argo Workflows', 'TypeScript', 'Model Context Protocol']) assert.ok(!labels.includes(gone), gone);
  for (const added of ['Podman', 'Obsidian']) assert.ok(labels.includes(added), added);
  assert.equal(tiles.filter((t) => /class="ti dk/.test(t)).length, 5);
  for (const g of ['Cloud and clusters', 'Delivery and orchestration', 'Observability and data', 'Languages', 'Daily drivers']) assert.ok(tools.includes(g), g);
  for (const t of tiles) {
    const icon = t.match(/url\((\/icons\/tools\/[^)]+\.svg)\)/)![1];
    assert.ok(existsSync(dist(icon.slice(1))), icon);
  }
});

test('projects: five rows in order, a sheet each, the AMD stack showing first', () => {
  const page = html('index.html');
  const pj = page.slice(page.indexOf('id="projects"'), page.indexOf('<footer'));
  const rows = tags(pj, 'button', /class="prow/);
  assert.equal(rows.length, 5);
  assert.match(rows[0], /aria-pressed="true"/);
  rows.slice(1).forEach((r) => assert.match(r, /aria-pressed="false"/));
  const names = [...pj.matchAll(/<span class="pname"[^>]*>([^<]+)<\/span>/g)].map((m) => m[1]);
  assert.deepEqual(names, ['GPU inference stack', 'Frontier SWE OpenEnv', 'Observ', 'VaultAssist', 'RAGnarok']);
  // One sheet per project, each named by its row; only the first shows until a row is clicked.
  const panes = tags(pj, 'div', /class="pane/);
  assert.equal(panes.length, 5);
  panes.forEach((p, i) => assert.equal(/\shidden/.test(p), i > 0, `pane ${i}`));
  rows.forEach((r, i) => assert.match(r, new RegExp(`aria-controls="${panes[i].match(/id="([^"]+)"/)![1]}"`)));
  for (const repo of ['amd-hackathon', 'frontier-swe-openenv', 'Observ', 'mcp-server', 'RAGnarok']) assert.match(pj, new RegExp(`href="https://github.com/[^"]+/${repo}"`));
  const spec = pj.slice(pj.indexOf('class="pane'), pj.indexOf('class="pane', pj.indexOf('class="pane') + 1));
  assert.match(spec, /Oct 2025/);
  assert.match(spec, /AMD hackathon · 3xcaffeine/);
  assert.match(spec, /\$ terraform apply/);
  for (const s of ['Terraform', 'Ansible', 'ROCm', 'vLLM', 'Modal']) assert.match(spec, new RegExp(`class="tag"[^>]*>${s}<`));
  assert.equal(tags(spec, 'a', /href="https:\/\/github.com\/3xcaffeine\/amd-hackathon"/).length, 1);
  assert.match(spec, /Open the repository ↗/);
});

test('films: recent rated discs, only nearby ones drawn and loaded, counts shown', () => {
  const off = html('off-the-clock/index.html');
  const films = off.slice(off.indexOf('class="band films'), off.indexOf('class="band gunpla'));
  const discs = tags(films, 'button', /class="cd/);
  assert.ok(discs.length >= 1 && discs.length <= 12, `${discs.length} discs`);
  assert.match(discs[0], /class="cd focus/);
  assert.match(discs[0], /tabindex="0"/);
  discs.forEach((d, i) => assert.equal(/\shidden/.test(d), i >= 4, `disc ${i} hidden`));
  const arts = tags(films, 'img', /class="art/);
  assert.equal(arts.length, discs.length);
  arts.forEach((img, i) => {
    // Cropped square at build time and served from the site.
    assert.match(img, /data-src="\/_astro\/[^"]+\.webp"/);
    assert.match(img, /width="720" height="720"/);
    assert.equal(/\ssrc="\/_astro/.test(img), i <= 5, `art ${i} loads up front`);
  });
  // No credit text printed on the discs; a title in type only where a print has no logo, hidden from screen readers
  // (the disc's label already names the film). Every disc has a metal rim.
  assert.equal(tags(films, 'img', /class="ring/).length, 0);
  assert.equal(tags(films, 'span', /class="title(?!-print)/).length, 0);
  tags(films, 'span', /class="title-print/).forEach((t) => assert.match(t, /aria-hidden="true"/));
  assert.equal(tags(films, 'span', /class="rim/).length, discs.length);
  assert.doesNotMatch(films, /<textPath/);
  const flaps = [...films.matchAll(/<span class="flap count-flap"[^>]*>([^<]*)<\/span>/g)].map((m) => m[1]).join('');
  assert.equal(flaps, '1140');
  assert.match(films, /195 this year/);
  assert.equal(tags(films, 'a', /href="https:\/\/letterboxd\.com\/film\/[^"]+\/"/, /data-title/).length, 1);
  assert.equal(tags(films, 'a', /href="https:\/\/letterboxd\.com\/sasquatch06\/"/).length, 1);
  assert.doesNotMatch(off, /class="hero-side/);
});

test('gunpla: kit tabs, Dynames first, a canvas for the model, details per kit', () => {
  const off = html('off-the-clock/index.html');
  const g = off.slice(off.indexOf('class="band gunpla'));
  const tabs = tags(g, 'button', /role="tab"/);
  assert.equal(tabs.length, 4);
  assert.match(tabs[0], /aria-selected="true"/);
  assert.match(tabs[0], /data-has-model/);
  assert.deepEqual(tabs.map((t) => t.match(/data-model-id="([^"]+)"/)?.[1] ?? null), ['dynames', 'virtue', null, 'freedom']);
  // glTF models are served from the site and credited.
  for (const k of ['dynames', 'virtue', 'freedom']) assert.ok(existsSync(dist(`models/${k}.glb`)), k);
  assert.equal((g.match(/class="credit"/g) ?? []).length, 3);
  assert.match(g, /3D model by <a href="https:\/\/www\.thingiverse\.com\/thing:184096"[^>]*>MrGundam<\/a>, CC BY-SA 4\.0/);
  assert.match(g, /3D model by <a href="https:\/\/sketchfab\.com\/3d-models\/gundam-virtue-/);
  assert.equal(tags(g, 'canvas', /data-model/, /role="img"/).length, 1);
  const panels = tags(g, 'div', /role="tabpanel"/);
  assert.equal(panels.length, 4);
  panels.forEach((p, i) => assert.equal(/\shidden/.test(p), i > 0));
  assert.equal(tags(g, 'div', /class="mruler/).length, 2);
  // Every kit has a cel-shaded cut-out picture, only the first one showing before JS runs; no dither toggle.
  const pics = tags(g, 'img', /data-art=/);
  assert.deepEqual(pics.map((t) => t.match(/data-art="([^"]+)"/)?.[1]), ['dynames', 'virtue', 'vidar', 'freedom']);
  pics.forEach((t, i) => assert.equal(/\shidden/.test(t), i > 0));
  for (const k of ['dynames', 'virtue', 'vidar', 'freedom']) assert.ok(existsSync(dist(`gunpla/${k}.webp`)), k);
  assert.doesNotMatch(g, /data-dither/);
  // three.js is loaded on demand, not with the page.
  const entry = [...off.matchAll(/<script type="module" src="([^"]+)"/g)].map((m) => m[1]);
  for (const src of entry) assert.doesNotMatch(readFileSync(dist(src.replace(/^\//, '')), 'utf8'), /WebGLRenderer/);
});

test('resume: the Typst drawing inline, the PDF to download, no source link', () => {
  const page = html('resume/index.html');
  assert.match(page, /<html lang="en" data-theme="light"/);
  assert.equal(tags(page, 'svg', /class="typst-doc"/).length, 1);
  // The drawing's stylesheet is scoped, so it can't blank the site's own icons.
  assert.doesNotMatch(page, /(^|[}>\s])svg\s*\{/);
  assert.match(page, /\.typst-doc \{/);
  const download = tags(page, 'a', /href="\/resume\.pdf"/);
  assert.equal(download.length, 1);
  assert.match(download[0], /download="Sourasish-Basu-Resume\.pdf"/);
  assert.doesNotMatch(page, /\.typ\b|Typst source/);
  const pdf = readFileSync(dist('resume.pdf'));
  assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
  assert.ok(pdf.length > 20_000 && pdf.length < 500_000, `pdf is ${pdf.length} bytes`);
  // The sources and the icon font stay out of the site.
  assert.equal(existsSync(dist('resume/resume.typ')), false);
  assert.equal(existsSync(dist('resume/fonts')), false);
});
