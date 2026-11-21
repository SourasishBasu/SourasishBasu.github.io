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
