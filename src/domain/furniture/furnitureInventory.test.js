import test from 'node:test';
import assert from 'node:assert/strict';
import { isFurniturePlacementAvailable, isFurniturePlacementInAllowedZone } from './furnitureInventory.js';

test('floor-grid corners and an empty 2×4 TV footprint are valid', () => {
  [[0, 0], [9, 0], [0, 9], [9, 9]].forEach(([gridX, gridY]) => {
    assert.equal(isFurniturePlacementInAllowedZone('poco_cushion_001', gridX, gridY, 'default'), true);
  });
  assert.equal(isFurniturePlacementAvailable([], 'poco_TV_001', 3, 5, 'default'), true);
  assert.equal(isFurniturePlacementInAllowedZone('poco_TV_001', 3, 5, 'default'), true);
});

test('collision remains based solely on overlapping occupied logical cells', () => {
  const placed = [{ instanceId: 'tv', furnitureId: 'poco_TV_001', gridX: 3, gridY: 5, orientation: 'default' }];
  assert.equal(isFurniturePlacementAvailable(placed, 'poco_cushion_001', 3, 5, 'default'), false);
  assert.equal(isFurniturePlacementAvailable(placed, 'poco_cushion_001', 5, 5, 'default'), true);
  assert.equal(isFurniturePlacementAvailable(placed, 'poco_TV_001', 3, 5, 'default', 'tv'), true);
});
