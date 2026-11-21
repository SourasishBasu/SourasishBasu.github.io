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

test('positionFromScroll maps the pinned track onto the discs and clamps', async () => {
  const { positionFromScroll } = await import('../src/components/off/discs.ts');
  assert.equal(positionFromScroll(-50, 120, 13), 0);
  assert.equal(positionFromScroll(180, 120, 13), 1.5);
  assert.equal(positionFromScroll(99999, 120, 13), 12);
  assert.equal(positionFromScroll(100, 120, 1), 0);
});
