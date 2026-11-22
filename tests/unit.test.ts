import { test } from 'node:test';
import assert from 'node:assert/strict';
import { padCells } from '../src/lib/flap.ts';

test('padCells uppercases, blanks spaces and pads to length', () => {
  assert.deepEqual(padCells('ab', 4), ['A', 'B', '', '']);
  assert.deepEqual(padCells('a b', 3), ['A', '', 'B']);
  assert.equal(padCells('abcdef', 4).length, 4);
});

test('koiCount keeps a few fish in any pond width', async () => {
  const { koiCount } = await import('../src/components/pond/count.ts');
  assert.equal(koiCount(300), 3);
  assert.equal(koiCount(1310), 5);
  assert.equal(koiCount(4000), 6);
});

test('discPose: a belt, with the focus in front and both sides falling back along the diagonal', async () => {
  const { discPose } = await import('../src/components/off/discs.ts');
  const f = discPose(0);
  assert.deepEqual([f.x, f.y, f.z, f.scale, f.opacity, f.visible], [0, 0, 0, 1, 1, true]);
  const right = discPose(1);
  const left = discPose(-1);
  assert.ok(right.x > 0 && right.y < 0 && left.x < 0 && left.y > 0, 'the row climbs to the right');
  for (const side of [left, right]) {
    assert.ok(side.z < 0 && side.scale < 1 && side.order < f.order, 'neighbours sit behind and smaller');
    assert.equal(side.tilt, 1);
  }
  assert.equal(right.z, left.z);
  assert.ok(f.tilt > 0 && f.tilt < 0.5, 'the focus turns nearly square to the viewer');
  assert.ok(discPose(2).order < right.order);
  assert.equal(discPose(3).visible, false);
  assert.equal(discPose(2.5).opacity, 0);
});

test('discTransform scales offsets by the unit; discTilt eases from the focus to the three-quarter angle', async () => {
  const { discTransform, discTilt } = await import('../src/components/off/discs.ts');
  assert.equal(discTransform(0, 1), 'translate3d(0.0px,0.0px,0.0px) scale(1.000)');
  assert.equal(discTransform(1, 0.5), 'translate3d(145.0px,-43.0px,-60.0px) scale(0.850)');
  assert.equal(discTilt(0), 'rotateX(7.50deg) rotateY(-7.50deg)');
  assert.equal(discTilt(-2), 'rotateX(30.00deg) rotateY(-30.00deg)');
});

test('parseProfileStats reads Films and This year from a Letterboxd profile', async () => {
  const { parseProfileStats } = await import('../src/data/profile-stats.ts');
  const html = '<h4 class="profile-statistic statistic"><a href="/x/films/"><span class="value">1,140</span><span class="definition">Films</span></a></h4><h4 class="profile-statistic statistic"><a href="/x/films/diary/for/2026/"><span class="value">195</span><span class="definition">This year</span></a></h4>';
  assert.deepEqual(parseProfileStats(html), { total: 1140, thisYear: 195 });
  assert.equal(parseProfileStats('<title>Just a moment...</title>'), null);
});

const RSS = `<rss><channel>
<item><title>Big Night, 1996 - ★★★½</title><link>https://letterboxd.com/me/film/big-night/</link>
<letterboxd:watchedDate>2026-11-20</letterboxd:watchedDate><letterboxd:rewatch>No</letterboxd:rewatch>
<letterboxd:filmTitle>Big Night</letterboxd:filmTitle><letterboxd:filmYear>1996</letterboxd:filmYear>
<letterboxd:memberRating>3.5</letterboxd:memberRating>
<description><![CDATA[ <p><img src="https://a.ltrbxd.com/resized/film-poster/big-night.jpg?v=1"/></p> ]]></description></item>
<item><title>Tom &amp; Jerry, 1992 - ★★</title><link>https://letterboxd.com/me/film/tom-jerry/</link>
<letterboxd:watchedDate>2026-11-19</letterboxd:watchedDate><letterboxd:filmTitle>Tom &amp; Jerry</letterboxd:filmTitle>
<letterboxd:filmYear>1992</letterboxd:filmYear><letterboxd:memberRating>2.0</letterboxd:memberRating></item>
<item><title>Big Night, 1996</title><link>https://letterboxd.com/me/film/big-night/1/</link>
<letterboxd:watchedDate>2026-09-02</letterboxd:watchedDate><letterboxd:rewatch>Yes</letterboxd:rewatch>
<letterboxd:filmTitle>Big Night</letterboxd:filmTitle><letterboxd:filmYear>1996</letterboxd:filmYear>
<letterboxd:memberRating>4.0</letterboxd:memberRating></item>
<item><title>My list</title><link>https://letterboxd.com/me/list/faves/</link></item>
</channel></rss>`;

test('parseDiaryRss reads diary entries and skips lists', async () => {
  const { parseDiaryRss } = await import('../src/data/letterboxd.ts');
  const e = parseDiaryRss(RSS);
  assert.equal(e.length, 3);
  assert.deepEqual(e[0], { title: 'Big Night', year: 1996, rating: 3.5, watched: '2026-11-20', slug: 'big-night', poster: 'https://a.ltrbxd.com/resized/film-poster/big-night.jpg?v=1', rewatch: false });
  assert.equal(e[1].title, 'Tom & Jerry');
  assert.equal(e[2].rewatch, true);
});

test('pickRecent keeps 3.5+ only, newest first, one entry per film', async () => {
  const { parseDiaryRss, pickRecent } = await import('../src/data/letterboxd.ts');
  const picked = pickRecent(parseDiaryRss(RSS), 3.5, 12);
  assert.deepEqual(picked.map((p) => [p.slug, p.watched]), [['big-night', '2026-11-20']]);
});

test('parseFilmPage takes landscape stills only, and the directors', async () => {
  const { parseFilmPage } = await import('../src/data/letterboxd.ts');
  const page = '<meta property="og:image" content="https://a.ltrbxd.com/resized/sm/upload/x/still-1200-1200-675-675-crop-000000.jpg?v=1"><script type="application/ld+json">{"director":[{"name":"A"},{"name":"B"},{"name":"C"}]}</script>';
  assert.deepEqual(parseFilmPage(page), {
    still: 'https://a.ltrbxd.com/resized/sm/upload/x/still-1200-1200-675-675-crop-000000.jpg?v=1',
    backdrop: null,
    director: 'A, B',
    tmdb: null,
    imdb: null,
  });
  assert.deepEqual(parseFilmPage('<meta property="og:image" content="https://a.ltrbxd.com/resized/film-poster/p-0-1000-0-1500-crop.jpg">'), {
    still: null,
    backdrop: null,
    director: null,
    tmdb: null,
    imdb: null,
  });
});

test('parseFilmPage reads the 1920 backdrop and the TMDB and IMDb ids', async () => {
  const { parseFilmPage } = await import('../src/data/letterboxd.ts');
  const page =
    '<body class="film backdropped" data-type="film" data-tmdb-type="movie" data-tmdb-id="417466"><div data-backdrop2x="https://a.ltrbxd.com/resized/sm/upload/x/monos-1920-1920-1080-1080-crop-000000.jpg?v=9&amp;x=1"></div><a href="http://www.imdb.com/title/tt6062774/maindetails">IMDb</a>';
  const f = parseFilmPage(page);
  assert.equal(f.backdrop, 'https://a.ltrbxd.com/resized/sm/upload/x/monos-1920-1920-1080-1080-crop-000000.jpg?v=9&x=1');
  assert.equal(f.tmdb, 417466);
  assert.equal(f.imdb, 'tt6062774');
  assert.equal(parseFilmPage('<body data-tmdb-type="tv" data-tmdb-id="5">').tmdb, null, 'TV ids are not film ids');
});

test('pickFanartDisc prefers English or neutral discs, then the most liked', async () => {
  const { pickFanartDisc } = await import('../src/data/fanart.ts');
  assert.equal(pickFanartDisc({}), null);
  assert.equal(pickFanartDisc({ moviedisc: [] }), null);
  const json = {
    moviedisc: [
      { url: 'http://assets.fanart.tv/fanart/de.png', lang: 'de', likes: '9' },
      { url: 'http://assets.fanart.tv/fanart/en-1.png', lang: 'en', likes: '1' },
      { url: 'http://assets.fanart.tv/fanart/en-4.png', lang: 'en', likes: '4' },
      { url: 'http://assets.fanart.tv/fanart/none.png', lang: '00', likes: '7' },
    ],
  };
  assert.equal(pickFanartDisc(json), 'https://assets.fanart.tv/fanart/en-4.png');
});

test('fanartLogoCandidates: HD logos first, readable languages only when there are any', async () => {
  const { fanartLogoCandidates } = await import('../src/data/fanart.ts');
  assert.deepEqual(fanartLogoCandidates({}), []);
  assert.deepEqual(fanartLogoCandidates(null), []);
  const hd = [
    { url: 'http://assets.fanart.tv/fanart/fr.png', lang: 'fr', likes: '12' },
    { url: 'http://assets.fanart.tv/fanart/none.png', lang: '00', likes: '9' },
    { url: 'http://assets.fanart.tv/fanart/en.png', lang: 'en', likes: '2' },
    { lang: 'en' },
  ];
  const old = [{ url: 'http://assets.fanart.tv/fanart/old.png', lang: 'en', likes: '5' }];
  assert.deepEqual(fanartLogoCandidates({ hdmovielogo: hd, movielogo: old }), [
    'https://assets.fanart.tv/fanart/en.png',
    'https://assets.fanart.tv/fanart/none.png',
    'https://assets.fanart.tv/fanart/old.png',
  ]);
  assert.deepEqual(fanartLogoCandidates({ hdmovielogo: [hd[0]] }), ['https://assets.fanart.tv/fanart/fr.png'], 'a foreign logo beats none');
});

test('pickFanartKeyart takes the most liked textless poster', async () => {
  const { pickFanartKeyart } = await import('../src/data/fanart.ts');
  assert.equal(pickFanartKeyart({}), null);
  assert.equal(pickFanartKeyart({ movieposter: [{ url: 'http://assets.fanart.tv/fanart/en.jpg', lang: 'en', likes: '9' }] }), null, 'posters with text are not key art');
  const json = {
    movieposter: [
      { url: 'http://assets.fanart.tv/fanart/a.jpg', lang: '00', likes: '1' },
      { url: 'http://assets.fanart.tv/fanart/b.jpg', lang: '00', likes: '4' },
      { url: 'http://assets.fanart.tv/fanart/en.jpg', lang: 'en', likes: '9' },
    ],
  };
  assert.equal(pickFanartKeyart(json), 'https://assets.fanart.tv/fanart/b.jpg');
});

test('pickTextlessPoster takes the best-rated language-less TMDB poster', async () => {
  const { pickTextlessPoster, looksLikeReadToken } = await import('../src/data/tmdb.ts');
  assert.equal(pickTextlessPoster({}), null);
  assert.equal(pickTextlessPoster(null), null);
  const json = {
    posters: [
      { file_path: '/en.jpg', iso_639_1: 'en', vote_average: 9, vote_count: 50 },
      { file_path: '/low.jpg', iso_639_1: null, vote_average: 5.2, vote_count: 3 },
      { file_path: '/best.jpg', iso_639_1: null, vote_average: 5.6, vote_count: 2 },
      { file_path: '/xx.jpg', iso_639_1: 'xx', vote_average: 5.6, vote_count: 1 },
    ],
  };
  assert.equal(pickTextlessPoster(json), 'https://image.tmdb.org/t/p/w780/best.jpg');
  assert.equal(pickTextlessPoster({ posters: [{ file_path: '/en.jpg', iso_639_1: 'en' }] }), null, 'posters with text are skipped');
  assert.equal(looksLikeReadToken('0123456789abcdef0123456789abcdef'), false, 'the short v3 key is not a bearer token');
  assert.equal(looksLikeReadToken(`eyJhbGciOiJIUzI1NiJ9.${'a'.repeat(80)}.${'b'.repeat(43)}`), true);
});

test('chooseLogo prefers the first one-line logo, else the widest', async () => {
  const { chooseLogo } = await import('../src/data/fanart.ts');
  assert.equal(chooseLogo([]), null);
  // Digger on fanart.tv: a stacked logo, a two-line one, then a one-line one.
  const digger = [
    { id: 'stacked', aspect: 0.51 },
    { id: 'two-line', aspect: 2.44 },
    { id: 'one-line', aspect: 4.8 },
  ];
  assert.equal(chooseLogo(digger)?.id, 'one-line');
  assert.equal(chooseLogo([{ id: 'wide', aspect: 3.4 }, { id: 'wider', aspect: 12 }])?.id, 'wide', 'preference order wins among one-line logos');
  // Big Night: two near-identical shapes, the better-ranked one is kept.
  assert.equal(chooseLogo([{ id: 'hd', aspect: 2.91 }, { id: 'small', aspect: 2.92 }])?.id, 'hd');
  assert.equal(chooseLogo([{ id: 'stacked', aspect: 1.2 }, { id: 'squat', aspect: 1.8 }])?.id, 'squat');
});

test('pngInfo finds the visible part of a transparent PNG', async () => {
  const { deflateSync } = await import('node:zlib');
  const { pngInfo } = await import('../src/data/png-info.ts');
  // A 20×10 RGBA image, transparent except a 12×3 block at (4, 5), rows written with the Sub and Paeth filters.
  const w = 20;
  const h = 10;
  const rows: number[] = [];
  for (let y = 0; y < h; y++) {
    const px = Array.from({ length: w }, (_, x) => (x >= 4 && x < 16 && y >= 5 && y < 8 ? [200, 30, 30, 255] : [0, 0, 0, 0])).flat();
    if (y % 2) {
      rows.push(1, ...px.map((v, i) => (v - (i >= 4 ? px[i - 4] : 0)) & 255));
    } else rows.push(0, ...px);
  }
  const chunk = (tag: string, data: Buffer) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    return Buffer.concat([len, Buffer.from(tag, 'latin1'), data, Buffer.alloc(4)]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(Buffer.from(rows))),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  assert.deepEqual(await pngInfo(png), { width: 20, height: 10, bounds: { x: 4, y: 5, w: 12, h: 3 } });
  assert.equal(await pngInfo(Buffer.from('not a png at all, just some text bytes')), null);
});

test('stars formats halves', async () => {
  const { stars } = await import('../src/data/letterboxd.ts');
  assert.equal(stars(3.5), '★★★½');
  assert.equal(stars(5), '★★★★★');
});

test('dynames model: feet on the floor, about kit height, drive on the back, pairs reflected', async () => {
  const THREE = await import('three');
  const { buildDynames } = await import('../src/components/off/gunpla/dynames.ts');
  const m = buildDynames();
  assert.ok(m.meshCount > 120, `${m.meshCount} parts`);
  assert.ok(m.size.height > 17 && m.size.height < 20, `height ${m.size.height}`);
  const box = new THREE.Box3().setFromObject(m.root);
  assert.ok(Math.abs(box.min.y) < 0.05, `lowest point ${box.min.y}`);
  // The rifle reaches out to the right (-x), the left shield sets the other side: both sides within the turntable.
  assert.ok(m.size.radius < 7.5, `radius ${m.size.radius}`);
  const drive = m.emitter.getWorldPosition(new THREE.Vector3());
  assert.ok(drive.z < -2.5 && drive.y > 12 && Math.abs(drive.x) < 0.01, `drive at ${drive.toArray()}`);
  // Right-hand copies are reflections (negative determinant), never rotations.
  const mirrored: number[] = [];
  m.root.traverse((o: any) => o.isMesh && mirrored.push(o.matrixWorld.determinant() < 0 ? 1 : 0));
  const right = mirrored.filter(Boolean).length;
  assert.ok(right > 30 && right < mirrored.length / 2, `${right} of ${mirrored.length} reflected`);
  m.dispose();
});

test('kits: built ones first; models for all but the Vidar, credited when they aren\'t ours', async () => {
  const { kits } = await import('../src/data/kits.ts');
  const built = kits.map((k) => k.built);
  assert.deepEqual(built, [...built].sort((a, b) => Number(b) - Number(a)));
  assert.deepEqual(kits.filter((k) => k.model).map((k) => k.id), ['dynames', 'virtue', 'freedom']);
  for (const k of kits) assert.equal(!!k.modelCredit, !!k.model && k.model !== 'dynames', k.id);
  for (const k of kits) if (!k.model || k.model !== 'dynames') assert.ok(k.art, `${k.id} has a picture`);
  for (const k of kits) assert.equal(k.whenLabel, k.built ? 'Built' : 'Status');
});

test('resume: Typst compiles it to one page without warnings', async () => {
  const { compileResume } = await import('../src/data/resume.ts');
  const r = compileResume();
  assert.equal(r.pages, 1);
  assert.deepEqual(r.warnings, []);
  assert.equal(new TextDecoder().decode(r.pdf.subarray(0, 5)), '%PDF-');
  assert.match(r.svg, /class="typst-doc"/);
  // The contact links survive into the drawing.
  for (const url of ['mailto:sourasishbasu06@gmail.com', 'https://www.linkedin.com/in/sourasishbasu', 'https://github.com/SourasishBasu']) {
    assert.ok(r.svg.includes(url), url);
  }
});

test('scopeSvg moves the bare svg rule onto the drawing', async () => {
  const { scopeSvg } = await import('../src/data/resume.ts');
  const out = scopeSvg('<svg class="typst-doc"><style>.a {\n}\nsvg {\n  fill: none;\n}\n.b svg { x: 1 }</style></svg>');
  assert.match(out, /\}\n\.typst-doc \{\n  fill: none;/);
  assert.match(out, /\.b svg \{ x: 1 \}/);
  assert.doesNotMatch(out, /(^|[}>]\s*)svg\s*\{/);
});
