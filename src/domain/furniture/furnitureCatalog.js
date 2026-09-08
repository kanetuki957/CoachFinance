// `image` intentionally uses a lightweight placeholder for now. Replace each
// value with an imported image URL later without changing shop or room logic.
export const FURNITURE_CATALOG = [
  { id: 'plant_01', name: '観葉植物', category: 'plant', price: 300, image: '🪴', width: 52, height: 72 },
  { id: 'chair_01', name: '木製チェア', category: 'chair', price: 500, image: '🪑', width: 58, height: 68 },
  { id: 'desk_01', name: 'シンプルデスク', category: 'desk', price: 800, image: '🪵', width: 112, height: 68 },
  { id: 'sofa_01', name: 'シンプルソファ', category: 'sofa', price: 1200, image: '🛋️', width: 120, height: 70 },
  { id: 'tv_01', name: 'テレビ', category: 'tv', price: 2000, image: '📺', width: 96, height: 70 },
];

export const getFurnitureById = (furnitureId) =>
  FURNITURE_CATALOG.find((furniture) => furniture.id === furnitureId) ?? null;

// Relative coordinates make placements responsive to the room card size.
export const FURNITURE_DEFAULT_POSITIONS = {
  plant_01: { x: 250, y: 210 },
  chair_01: { x: 72, y: 208 },
  desk_01: { x: 42, y: 205 },
  sofa_01: { x: 100, y: 235 },
  tv_01: { x: 210, y: 110 },
};
