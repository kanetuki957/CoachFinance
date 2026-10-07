// Visual-only configuration for the placement footprint markers.
// Coordinates are percentages of the room image, so they stay responsive.
export const ROOM_GRID_CONFIG = {
  cellWidth: 10,
  cellHeight: 10,
  markerWidth: 8.5,
  markerHeight: 4.5,
};

const toPointString = (points) => points.map(({ x, y }) => `${x},${y}`).join(' ');

// Returns one flat diamond per occupied logical grid cell.  The placement
// system remains grid-based; this helper only controls its floor indicator.
export const getFootprintMarkerPolygons = ({ gridX, gridY, gridWidth, gridHeight, columns, rows, footprintOffset }) => {
  const cellWidth = 100 / columns;
  const cellHeight = 100 / rows;
  const markerWidth = Math.min(ROOM_GRID_CONFIG.markerWidth, cellWidth * 0.9);
  const markerHeight = Math.min(ROOM_GRID_CONFIG.markerHeight, cellHeight * 0.65);
  const offsetX = Number(footprintOffset?.x) || 0;
  const offsetY = Number(footprintOffset?.y) || 0;

  return Array.from({ length: gridWidth * gridHeight }, (_, index) => {
    const cellOffsetX = index % gridWidth;
    const cellOffsetY = Math.floor(index / gridWidth);
    const halfWidth = markerWidth / 2;
    const halfHeight = markerHeight / 2;
    // Each footprint width step goes down-right; each depth step goes
    // down-left. This keeps the marker group in the room's isometric plane.
    const centerX = (gridX + 0.5) * cellWidth + (cellOffsetX - cellOffsetY) * halfWidth + 5 + offsetX;
    const centerY = (gridY + 1) * cellHeight + (cellOffsetX + cellOffsetY) * halfHeight + offsetY;
    return toPointString([
      { x: centerX, y: centerY - halfHeight },
      { x: centerX + halfWidth, y: centerY },
      { x: centerX, y: centerY + halfHeight },
      { x: centerX - halfWidth, y: centerY },
    ]);
  });
};
