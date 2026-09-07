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
export const FURNITURE_PLACEMENTS = {
  plant_01: { left: '78%', bottom: '15%' },
  chair_01: { left: '27%', bottom: '18%' },
  desk_01: { left: '22%', bottom: '18%' },
  sofa_01: { left: '50%', bottom: '14%' },
  tv_01: { left: '73%', bottom: '28%' },
};
