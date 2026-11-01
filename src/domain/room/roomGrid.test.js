import test from 'node:test';
import assert from 'node:assert/strict';
import { getFootprintScreenPolygon, gridToScreen, screenToGrid } from './roomGrid.js';

test('grid projection round-trips the room corners and interior positions', () => {
  [[0, 0], [10, 0], [0, 10], [10, 10], [3, 5], [7.5, 2.5]].forEach(([gridX, gridY]) => {
    const screen = gridToScreen(gridX, gridY);
    const restored = screenToGrid(screen.x, screen.y);
    assert.ok(Math.abs(restored.gridX - gridX) < 0.0001);
    assert.ok(Math.abs(restored.gridY - gridY) < 0.0001);
  });
});

test('footprint polygons share cell boundaries for every supported footprint size', () => {
  [[1, 1], [1, 2], [2, 2], [2, 4], [3, 1]].forEach(([gridWidth, gridHeight]) => {
    const polygon = getFootprintScreenPolygon({ gridX: 3, gridY: 3, gridWidth, gridHeight });
    assert.equal(polygon.length, 4);
    assert.ok(polygon.every(({ x, y }) => Number.isFinite(x) && Number.isFinite(y)));
  });
});
