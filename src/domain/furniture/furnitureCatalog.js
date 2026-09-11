import { PRODUCT_CATALOG } from '../shop/productCatalog.js';

// 既存の部屋・家具ロジック向けに、商品マスターから配置可能な item だけを公開する。
export const FURNITURE_CATALOG = PRODUCT_CATALOG.filter((product) => product.category === 'item');

// ID から家具マスターを取得する。見つからない場合は null を返す。
export const getFurnitureById = (furnitureId) =>
  FURNITURE_CATALOG.find((furniture) => furniture.id === furnitureId) ?? null;

// 家具を新しく配置したときの初期座標（320 × 320 の仮想的な部屋座標）。
// 描画時には部屋カードのサイズに合わせて相対位置に換算される。
export const FURNITURE_DEFAULT_POSITIONS = {
  plant_01: { x: 250, y: 210 },
  chair_01: { x: 72, y: 208 },
  desk_01: { x: 42, y: 205 },
  sofa_01: { x: 100, y: 235 },
  tv_01: { x: 210, y: 110 },
};
