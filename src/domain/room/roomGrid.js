// The room image and SVG overlay share this 0–100 coordinate space.
// A bilinear projection is used because the floor is a slightly asymmetric quadrilateral.
export const ROOM_FLOOR_CORNERS = Object.freeze({
  back: { x: 50, y: 27 }, right: { x: 100, y: 62 }, front: { x: 50, y: 95 }, left: { x: 0.8, y: 59 },
});
export const ROOM_GRID_CONFIG = { columns: 10, rows: 10 };

const toPointString = (points) => points.map(({ x, y }) => `${x},${y}`).join(' ');

// gridX advances toward the right wall; gridY advances toward the left wall.
// The four logical grid corners map exactly to the visible floor corners.
export const gridToScreen = (gridX, gridY, columns = ROOM_GRID_CONFIG.columns, rows = ROOM_GRID_CONFIG.rows) => {
  const u = Number(gridX) / columns;
  const v = Number(gridY) / rows;
  const { back, right, front, left } = ROOM_FLOOR_CORNERS;
  return {
    x: back.x * (1 - u) * (1 - v) + right.x * u * (1 - v) + front.x * u * v + left.x * (1 - u) * v,
    y: back.y * (1 - u) * (1 - v) + right.y * u * (1 - v) + front.y * u * v + left.y * (1 - u) * v,
  };
};

// Inverse bilinear projection for pointer locations in the SVG/room coordinate space.
export const screenToGrid = (screenX, screenY, columns = ROOM_GRID_CONFIG.columns, rows = ROOM_GRID_CONFIG.rows) => {
  const { back, right, front, left } = ROOM_FLOOR_CORNERS;
  const b = { x: right.x - back.x, y: right.y - back.y };
  const c = { x: left.x - back.x, y: left.y - back.y };
  const d = { x: front.x - right.x - left.x + back.x, y: front.y - right.y - left.y + back.y };
  let u = 0.5;
  let v = 0.5;
  for (let index = 0; index < 8; index += 1) {
    const x = back.x + b.x * u + c.x * v + d.x * u * v;
    const y = back.y + b.y * u + c.y * v + d.y * u * v;
    const errorX = x - Number(screenX);
    const errorY = y - Number(screenY);
    const j00 = b.x + d.x * v;
    const j01 = c.x + d.x * u;
    const j10 = b.y + d.y * v;
    const j11 = c.y + d.y * u;
    const determinant = j00 * j11 - j01 * j10;
    if (Math.abs(determinant) < 0.000001) break;
    u -= (j11 * errorX - j01 * errorY) / determinant;
    v -= (-j10 * errorX + j00 * errorY) / determinant;
  }
  return { gridX: u * columns, gridY: v * rows };
};

export const getFootprintScreenPolygon = ({ gridX, gridY, gridWidth = 1, gridHeight = 1, columns, rows }) => [
  gridToScreen(gridX, gridY, columns, rows),
  gridToScreen(gridX + gridWidth, gridY, columns, rows),
  gridToScreen(gridX + gridWidth, gridY + gridHeight, columns, rows),
  gridToScreen(gridX, gridY + gridHeight, columns, rows),
];

export const getFurnitureScreenAnchor = ({ gridX, gridY, gridWidth, gridHeight, placementAnchor = { x: 0.5, y: 1 }, imageOffset }) => {
  const point = gridToScreen(gridX + gridWidth * placementAnchor.x, gridY + gridHeight * placementAnchor.y);
  return { x: point.x + (Number(imageOffset?.x) || 0), y: point.y + (Number(imageOffset?.y) || 0) };
};

// Each occupied cell uses the same projection as its furniture and drag target.
export const getFootprintMarkerPolygons = ({ gridX, gridY, gridWidth, gridHeight, columns, rows }) =>
  Array.from({ length: gridWidth * gridHeight }, (_, index) => {
    const cellX = gridX + index % gridWidth;
    const cellY = gridY + Math.floor(index / gridWidth);
    return toPointString(getFootprintScreenPolygon({ gridX: cellX, gridY: cellY, gridWidth: 1, gridHeight: 1, columns, rows }));
  });
