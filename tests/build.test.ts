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

test('404 page exists', () => {
  assert.ok(existsSync(dist('404.html')));
});

/** All opening tags of `name` in `src` whose attribute text matches every pattern. */
export function tags(src: string, name: string, ...patterns: RegExp[]): string[] {
  const all = src.match(new RegExp(`<${name}\\b[^>]*>`, 'g')) ?? [];
  return all.filter((t) => patterns.every((p) => p.test(t)));
}

test('work route is light, with Work as the current page', () => {
  const page = html('index.html');
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
  assert.doesNotMatch(page, /class="ruler/);
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
    const resume = tags(footer, 'a', /aria-disabled="true"/);
    assert.equal(resume.length, 1, p);
    assert.doesNotMatch(resume[0], /href=/, p);
    assert.match(footer, /Résumé, PDF/, p);
    assert.match(footer, /SASQUATCH/, p);
    assert.match(footer, /<ist-clock/, p);
    assert.match(footer, /© 2026 Sourasish Basu/, p);
  }
});

test('work footer draws seven dithered ridges, off footer has the pond', () => {
  const work = html('index.html');
  const scene = work.slice(work.indexOf('class="band scene'), work.indexOf('</svg>', work.indexOf('class="band scene')));
  assert.equal(tags(scene, 'path', /fill="url\(#d[0-6]\)"/).length, 7);
  assert.match(html('off-the-clock/index.html'), /class="band pond/);
});
