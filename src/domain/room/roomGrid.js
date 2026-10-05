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
export const getFootprintMarkerPolygons = ({ gridX, gridY, gridWidth, gridHeight, columns, rows }) => {
  const cellWidth = 100 / columns;
  const cellHeight = 100 / rows;
  const markerWidth = Math.min(ROOM_GRID_CONFIG.markerWidth, cellWidth * 0.9);
  const markerHeight = Math.min(ROOM_GRID_CONFIG.markerHeight, cellHeight * 0.65);

  return Array.from({ length: gridWidth * gridHeight }, (_, index) => {
    const offsetX = index % gridWidth;
    const offsetY = Math.floor(index / gridWidth);
    const centerX = (gridX + offsetX + 0.5) * cellWidth;
    const centerY = (gridY + offsetY + 1) * cellHeight;
    const halfWidth = markerWidth / 2;
    const halfHeight = markerHeight / 2;
    return toPointString([
      { x: centerX, y: centerY - halfHeight },
      { x: centerX + halfWidth, y: centerY },
      { x: centerX, y: centerY + halfHeight },
      { x: centerX - halfWidth, y: centerY },
    ]);
  });
};
