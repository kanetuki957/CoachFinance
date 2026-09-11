// ショップで扱う全商品のマスターデータ。
// item だけは部屋への配置に必要な width / height も持ち、他カテゴリは将来の適用用に購入情報だけを保存する。
export const SHOP_CATEGORIES = [
  { id: 'item', name: 'アイテム', icon: '🪴', description: '家具・雑貨' },
  { id: 'wall', name: '壁', icon: '🧱', description: '壁紙' },
  { id: 'floor', name: '床', icon: '🪵', description: '床材' },
  { id: 'character', name: 'キャラ', icon: '🧑', description: '外見' },
];

export const PRODUCT_CATALOG = [
  { id: 'plant_01', name: '観葉植物', category: 'item', price: 300, image: '🪴', width: 52, height: 72 },
  { id: 'chair_01', name: '木製チェア', category: 'item', price: 500, image: '🪑', width: 58, height: 68 },
  { id: 'desk_01', name: 'シンプルデスク', category: 'item', price: 800, image: '🪵', width: 112, height: 68 },
  { id: 'sofa_01', name: 'シンプルソファ', category: 'item', price: 1200, image: '🛋️', width: 120, height: 70 },
  { id: 'tv_01', name: 'テレビ', category: 'item', price: 2000, image: '📺', width: 96, height: 70 },
  { id: 'lamp_01', name: 'フロアライト', category: 'item', price: 400, image: '💡', width: 44, height: 84 },
  { id: 'shelf_01', name: '収納ラック', category: 'item', price: 800, image: '🗄️', width: 72, height: 100 },

  { id: 'wall_white_01', name: 'ホワイトウォール', category: 'wall', price: 500, image: '⬜' },
  { id: 'wall_gray_01', name: 'グレーウォール', category: 'wall', price: 600, image: '◻️' },
  { id: 'wall_wood_01', name: '木目の壁', category: 'wall', price: 900, image: '🪵' },
  { id: 'wall_concrete_01', name: 'コンクリート壁', category: 'wall', price: 1000, image: '🧱' },
  { id: 'wall_brick_01', name: 'レンガ壁', category: 'wall', price: 1200, image: '🧱' },

  { id: 'floor_wood_01', name: 'フローリング', category: 'floor', price: 700, image: '🟫' },
  { id: 'floor_darkwood_01', name: 'ダークウッド', category: 'floor', price: 900, image: '🪵' },
  { id: 'floor_tile_01', name: 'タイル', category: 'floor', price: 1100, image: '🔲' },
  { id: 'floor_carpet_01', name: 'カーペット', category: 'floor', price: 800, image: '🟦' },

  { id: 'character_casual_01', name: 'カジュアル服', category: 'character', price: 1000, image: '👕' },
  { id: 'character_formal_01', name: 'フォーマル服', category: 'character', price: 1500, image: '👔' },
  { id: 'character_hair_short_01', name: 'ショートヘア', category: 'character', price: 1200, image: '✂️' },
  { id: 'character_hair_long_01', name: 'ロングヘア', category: 'character', price: 1200, image: '💇' },
];

// ID からカテゴリを問わず商品を取得する。
export const getProductById = (productId) =>
  PRODUCT_CATALOG.find((product) => product.id === productId) ?? null;
