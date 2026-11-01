import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeFurnitureSettings } from './furnitureSizing.js';

test('image-only settings preserve legacy catalogue offsets without changing footprint settings', () => {
  const normalized = normalizeFurnitureSettings({
    footprint: { width: 2, depth: 1 },
    footprintOffset: { x: 5, y: -2 },
    imageAnchor: { x: 0.45, y: 0.92 },
  });

  assert.deepEqual(normalized.footprint, { width: 2, depth: 1 });
  assert.deepEqual(normalized.imageOffset, { x: 5, y: -2 });
  assert.deepEqual(normalized.imageAnchor, { x: 0.45, y: 0.92 });
});

test('an explicit imageOffset takes precedence over the legacy visual offset', () => {
  const normalized = normalizeFurnitureSettings({
    footprintOffset: { x: 5, y: 5 },
    imageOffset: { x: 0, y: 0 },
  });

  assert.deepEqual(normalized.imageOffset, { x: 0, y: 0 });
});
