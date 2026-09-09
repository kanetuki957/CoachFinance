// 家具の種類・価格・表示用アイコン・部屋内サイズをまとめたマスターデータ。
// image は現在絵文字の仮画像。画像 URL に差し替えても、ショップや部屋の処理は変更不要。
export const FURNITURE_CATALOG = [
  { id: 'plant_01', name: '観葉植物', category: 'plant', price: 300, image: '🪴', width: 52, height: 72 },
  { id: 'chair_01', name: '木製チェア', category: 'chair', price: 500, image: '🪑', width: 58, height: 68 },
  { id: 'desk_01', name: 'シンプルデスク', category: 'desk', price: 800, image: '🪵', width: 112, height: 68 },
  { id: 'sofa_01', name: 'シンプルソファ', category: 'sofa', price: 1200, image: '🛋️', width: 120, height: 70 },
  { id: 'tv_01', name: 'テレビ', category: 'tv', price: 2000, image: '📺', width: 96, height: 70 },
];

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
