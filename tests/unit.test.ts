import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ridgePath, RIDGE_W, RIDGE_H } from '../src/lib/ridges.ts';
import { padCells } from '../src/lib/flap.ts';

const yAt = (path: string, x: number) => {
  const m = path.match(new RegExp(` L${x},(-?[\\d.]+)`));
  assert.ok(m, `no point at x=${x}`);
  return Number(m[1]);
};

test('ridgePath draws a closed band from the bottom-left corner', () => {
  const p = ridgePath(0);
  assert.ok(p.startsWith(`M0,${RIDGE_H} L0,`), p.slice(0, 20));
  assert.ok(p.endsWith(` L${RIDGE_W},${RIDGE_H} Z`));
});

test('ridgePath samples every 16px across the full width', () => {
  const points = ridgePath(2).match(/ L/g) ?? [];
  assert.equal(points.length, RIDGE_W / 16 + 1 + 1); // 83 ridge points + the closing corner
});

test('ridgePath is deterministic', () => {
  assert.equal(ridgePath(4), ridgePath(4));
});

test('ridgePath rises under the pointer', () => {
  assert.ok(yAt(ridgePath(3, 400), 400) < yAt(ridgePath(3), 400));
  assert.equal(yAt(ridgePath(3, 400), 1296), yAt(ridgePath(3), 1296));
});

test('padCells uppercases, blanks spaces and pads to length', () => {
  assert.deepEqual(padCells('ab', 4), ['A', 'B', '', '']);
  assert.deepEqual(padCells('a b', 3), ['A', '', 'B']);
  assert.equal(padCells('abcdef', 4).length, 4);
});
