import { PRODUCT_CATALOG } from '../shop/productCatalog.js';

// category ではなく isFurniture を契約にすることで、ブランドごとの商品カテゴリを増やせます。
export const FURNITURE_CATALOG = PRODUCT_CATALOG.filter((product) => product.isFurniture);

export const getFurnitureById = (furnitureId) =>
  FURNITURE_CATALOG.find((furniture) => furniture.id === furnitureId) ?? null;

export const FURNITURE_DEFAULT_POSITIONS = {
  plant_01: { x: 250, y: 210 }, chair_01: { x: 72, y: 208 }, desk_01: { x: 42, y: 205 },
  sofa_01: { x: 100, y: 235 }, tv_01: { x: 210, y: 110 }, lamp_01: { x: 260, y: 190 }, shelf_01: { x: 230, y: 175 },
  poco_storage_001: { x: 234, y: 185 }, poco_storage_002: { x: 238, y: 150 }, poco_storage_003: { x: 260, y: 250 },
  poco_sofa_001: { x: 94, y: 238 }, poco_sofa_002: { x: 72, y: 215 }, poco_sofa_003: { x: 210, y: 252 },
  poco_table_001: { x: 42, y: 208 }, poco_table_002: { x: 205, y: 238 }, poco_table_003: { x: 165, y: 220 },
  poco_decor_001: { x: 250, y: 210 }, poco_decor_002: { x: 210, y: 175 }, poco_decor_003: { x: 190, y: 210 },
  poco_lighting_001: { x: 255, y: 190 }, poco_lighting_002: { x: 210, y: 210 },
  poco_rug_001: { x: 98, y: 260 }, poco_rug_002: { x: 40, y: 265 },
};
