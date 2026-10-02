// All points use the room's normalized 0–1 coordinate space, so they scale with the room image.
export const ROOM_PLACEMENT_ZONES = {
  floor: [
    { x: 0.50, y: 0.27 },//奥
    { x: 1.0, y: 0.62 },//右 y数字を上げれば下に行く
    { x: 0.50, y: 0.95},//手前
    { x: 0.008, y: 0.59 },//左 x数字を下げれば下に行く y数字を上げれば下に行く
  ],
  wallLeft: [
    { x: 0.14, y: 0.18 },// 左壁の左上
    { x: 0.50, y: 0.00 },// 部屋の奥上（壁の頂点）
    { x: 0.50, y: 0.20 },// 部屋の奥下（床との境目）
    { x: 0.15, y: 0.40 },// 左壁の左下（床との境目）
  ],
  wallRight: [
    { x: 0.50, y: 0.00 },// 部屋の奥上（壁の頂点）
    { x: 0.87, y: 0.18 },// 右壁の右上
    { x: 0.85, y: 0.40 },// 右壁の右下（床との境目）
    { x: 0.50, y: 0.20 },// 部屋の奥下（床との境目）
  ],
};

export const isPointInPolygon = (point, polygon) => {
  let inside = false;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
    const currentPoint = polygon[index];
    const previousPoint = polygon[previous];
    const intersects = ((currentPoint.y > point.y) !== (previousPoint.y > point.y))
      && point.x < ((previousPoint.x - currentPoint.x) * (point.y - currentPoint.y)) / (previousPoint.y - currentPoint.y) + currentPoint.x;
    if (intersects) inside = !inside;
  }
  return inside;
};

export const getPlacementType = (product) => product?.placementType ?? 'floor';
export const getPlacementAnchor = (product) => product?.placementAnchor ?? { x: 0.5, y: 1 };
export const getPlacementZonePolygons = (product) => getPlacementType(product) === 'wall'
  ? [ROOM_PLACEMENT_ZONES.wallLeft, ROOM_PLACEMENT_ZONES.wallRight]
  : [ROOM_PLACEMENT_ZONES.floor];

export const isPlacementAnchorAllowed = ({ product, gridX, gridY, gridWidth, gridHeight, columns, rows }) => {
  const anchor = getPlacementAnchor(product);
  const point = { x: (gridX + gridWidth * anchor.x) / columns, y: (gridY + gridHeight * anchor.y) / rows };
  return getPlacementZonePolygons(product).some((polygon) => isPointInPolygon(point, polygon));
};
