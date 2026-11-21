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

test('discPose: focus is centred, the row climbs right and nearer discs grow', async () => {
  const { discPose } = await import('../src/components/off/discs.ts');
  const f = discPose(0);
  assert.deepEqual([f.x, f.y, f.z, f.scale, f.opacity, f.visible], [0, 0, 0, 1, 1, true]);
  const right = discPose(1);
  const left = discPose(-1);
  assert.ok(right.x > 0 && right.y < 0 && right.scale > 1 && right.order > f.order);
  assert.ok(left.x < 0 && left.y > 0 && left.scale < 1 && left.order < f.order);
  assert.equal(discPose(3).visible, false);
  assert.equal(discPose(2.5).opacity, 0);
});

test('discTransform scales offsets by the unit and keeps the pose scale', async () => {
  const { discTransform } = await import('../src/components/off/discs.ts');
  assert.equal(discTransform(0, 1), 'translate3d(0.0px,0.0px,0.0px) scale(1.000)');
  assert.equal(discTransform(1, 0.5), 'translate3d(145.0px,-43.0px,50.0px) scale(1.120)');
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
  assert.deepEqual(parseFilmPage(page), { still: 'https://a.ltrbxd.com/resized/sm/upload/x/still-1200-1200-675-675-crop-000000.jpg?v=1', director: 'A, B' });
  assert.deepEqual(parseFilmPage('<meta property="og:image" content="https://a.ltrbxd.com/resized/film-poster/p-0-1000-0-1500-crop.jpg">'), { still: null, director: null });
});

test('stars formats halves', async () => {
  const { stars } = await import('../src/data/letterboxd.ts');
  assert.equal(stars(3.5), '★★★½');
  assert.equal(stars(5), '★★★★★');
});
