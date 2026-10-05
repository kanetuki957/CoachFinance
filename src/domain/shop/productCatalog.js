// ブランドを追加するときは、このカテゴリ配列と PRODUCT_CATALOG に同じ brand を足すだけで使えます。
//ここでカテゴリ別の商品を分けれる↓この型でカテゴリを自由に追加できる
export const POCO_CATEGORIES = [
  { id: 'storage', name: '収納', image: '🗄️', description: 'すっきり片づく、毎日の収納' },
  { id: 'sofa', name: 'ソファ', image: '🛋️', description: 'くつろぎの時間をつくる' },
  { id: 'table-chair', name: 'テーブル・チェア', image: '🪑', description: '食べる、働く、集まる' },
  { id: 'decor', name: '植物・雑貨', image: '🪴', description: '暮らしに小さな彩りを' },
  { id: 'lighting', name: '照明', image: '💡', description: '心地よい明かりを選ぶ' },
  { id: 'rug', name: 'ラグ', image: '🧶', description: '足元から部屋を整える' },
  { id: 'bed', name: 'ベッド', image: '🛏️', description: '眠る時間を心地よく' },
  { id: 'tv', name: 'テレビ', image: '📺', description: '家族で楽しむ映像体験' },
  { id: 'cushion', name: 'クッション', image: '🛋️', description: 'くつろぎの時間をつくる' },
  { id: 'openrack', name: 'オープンラック', image: '🗄️', description: 'すっきり片づく、毎日の収納' },
];

// 旧ショップの表示互換用。POCO HOME では POCO_CATEGORIES を使用します。
export const SHOP_CATEGORIES = POCO_CATEGORIES;

import { normalizeFurnitureSettings, resolveFurnitureSize } from '../room/furnitureSizing.js';

const poco = (id, name, category, price, image, description, tags, settingsOrWidth, legacyHeight) => {
  const settings = normalizeFurnitureSettings(settingsOrWidth, legacyHeight);
  const displaySize = resolveFurnitureSize(settings);
  return ({
  id,
  brand: 'poco',
  name,
  category,
  price,
  // A supplied /images path is kept as-is. Existing catalog entries use the
  // standard public-image convention until their individual paths are written.
  image: image?.startsWith('/') ? image : `/images/furniture/poco/${category}/${id}.png`,
  description,
  tags,
  isFurniture: true,
  ...settings,
  width: displaySize.width,
  height: displaySize.height,
  // Grid data keeps placement responsive while preserving the existing pixel dimensions for legacy room rendering.
  gridWidth: settings.footprint.width,
  gridHeight: settings.footprint.depth,
});
};

export const PRODUCT_CATALOG = [
  // 既存ユーザーの保存済み商品を正規化時に失わないための旧カタログ互換データ。
  { id: 'plant_01', name: '観葉植物', category: 'legacy', price: 300, image: '🪴', isFurniture: true, width: 52, height: 72 },
  { id: 'chair_01', name: '木製チェア', category: 'legacy', price: 500, image: '🪑', isFurniture: true, width: 58, height: 68 },
  { id: 'desk_01', name: 'シンプルデスク', category: 'legacy', price: 800, image: '🪵', isFurniture: true, width: 112, height: 68 },
  { id: 'sofa_01', name: 'シンプルソファ', category: 'legacy', price: 1200, image: '🛋️', isFurniture: true, width: 120, height: 70 },
  { id: 'tv_01', name: 'テレビ', category: 'legacy', price: 2000, image: '📺', isFurniture: true, width: 96, height: 70 },
  { id: 'lamp_01', name: 'フロアライト', category: 'legacy', price: 400, image: '💡', isFurniture: true, width: 44, height: 84 },
  { id: 'shelf_01', name: '収納ラック', category: 'legacy', price: 800, image: '📚', isFurniture: true, width: 72, height: 100 },
  { id: 'wall_white_01', name: 'ホワイトウォール', category: 'legacy', price: 500, image: '⬜', isFurniture: false },
  { id: 'wall_gray_01', name: 'グレーウォール', category: 'legacy', price: 600, image: '◻️', isFurniture: false },
  { id: 'wall_wood_01', name: '木目の壁', category: 'legacy', price: 900, image: '🪵', isFurniture: false },
  { id: 'wall_concrete_01', name: 'コンクリート壁', category: 'legacy', price: 1000, image: '◼️', isFurniture: false },
  { id: 'wall_brick_01', name: 'レンガ壁', category: 'legacy', price: 1200, image: '🧱', isFurniture: false },
  { id: 'floor_wood_01', name: 'フローリング', category: 'legacy', price: 700, image: '🟫', isFurniture: false },
  { id: 'floor_darkwood_01', name: 'ダークウッド', category: 'legacy', price: 900, image: '🟤', isFurniture: false },
  { id: 'floor_tile_01', name: 'タイル', category: 'legacy', price: 1100, image: '🔲', isFurniture: false },
  { id: 'floor_carpet_01', name: 'カーペット', category: 'legacy', price: 800, image: '🧶', isFurniture: false },
  { id: 'character_casual_01', name: 'カジュアル服', category: 'legacy', price: 1000, image: '👕', isFurniture: false },
  { id: 'character_formal_01', name: 'フォーマル服', category: 'legacy', price: 1500, image: '👔', isFurniture: false },
  { id: 'character_hair_short_01', name: 'ショートヘア', category: 'legacy', price: 1200, image: '✂️', isFurniture: false },
  { id: 'character_hair_long_01', name: 'ロングヘア', category: 'legacy', price: 1200, image: '👩', isFurniture: false },

  //POCOの商品：ここで商品を追加する/////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // ここから収納の追加商品
  poco('poco_storage_001', 'リネン ボックスラック', 'storage', 350, '🗄️', '布の風合いがやさしい、見せても隠しても使える収納ラック。', ['new'], {
    size: '',
    scale: 1,
    aspectRatio: 125 / 72,
    footprint: { width: 2, depth: 1 },    // 配置時に占めるグリッド数（横幅・奥行き）
    placementType: 'floor',               // 配置場所の種類（floor: 床、wall: 壁）
    placementAnchor: { x: 0.5, y: 0.95 }, // 配置判定に使う基準点（幅・奥行きに対する割合。0.5, 1 は中央下端）
  }),
  poco('poco_storage_002', 'スリム ウッドシェルフ', 'storage', 600, '📚', '小さなスペースにも置きやすい、軽やかな木製シェルフ。', ['popular'], {
    size: 'L',
    scale: 1,
    aspectRatio: 125 / 72,
    footprint: { width: 2, depth: 1 },    // 配置時に占めるグリッド数（横幅・奥行き）
    placementType: 'floor',               // 配置場所の種類（floor: 床、wall: 壁）
    placementAnchor: { x: 0.5, y: 0.95 }, // 配置判定に使う基準点（幅・奥行きに対する割合。0.5, 1 は中央下端）
  }),
  poco('poco_storage_003', 'まるいバスケット', 'storage', 180, '🧺', 'ブランケットや小物を気軽にしまえる、毎日のかご。', ['recommended'], {
    size: 'M',
    scale: 1,
    aspectRatio: 125 / 72, // 旧カタログ互換のため、サイズは M に固定
    footprint: { width: 0.8, depth: 0.8},    // 配置時に占めるグリッド数（横幅・奥行き）
    placementType: 'floor',               // 配置場所の種類（floor: 床、wall: 壁）
    placementAnchor: { x: 0.5, y: 0.95 }, // 配置判定に使う基準点（幅・奥行きに対する割合。0.5, 1 は中央下端）
  }),

  // ここからソファの追加商品
  poco('poco_sofa_001', 'くもり空 ソファ', 'sofa', 850, '🛋️', 'どんな部屋にも馴染む、ゆったり2人掛けソファ。', ['popular'], {
    size: 'L',
    scale: 1,
    aspectRatio: 125 / 72,
    footprint: { width: 2, depth: 1 },    // 配置時に占めるグリッド数（横幅・奥行き）
    placementType: 'floor',               // 配置場所の種類（floor: 床、wall: 壁）
    placementAnchor: { x: 0.5, y: 0.95 }, // 配置判定に使う基準点（幅・奥行きに対する割合。0.5, 1 は中央下端）
  }),
  poco('poco_sofa_002', 'ひとり時間チェア', 'sofa', 520, '💺', '読書にも休憩にもぴったりな、丸みのあるチェア。', ['new'], {
    size: 'L',
    scale: 1,
    aspectRatio: 125 / 72,
    footprint: { width: 2, depth: 1 },    // 配置時に占めるグリッド数（横幅・奥行き）
    placementType: 'floor',               // 配置場所の種類（floor: 床、wall: 壁）
    placementAnchor: { x: 0.5, y: 0.95 }, // 配置判定に使う基準点（幅・奥行きに対する割合。0.5, 1 は中央下端）
  }),
  poco('poco_sofa_003', 'ふかふかオットマン', 'sofa', 260, '🟫', 'ソファの相棒にも、来客用の椅子にもなる一台。', ['recommended'], {
    size: 'L',
    scale: 1,
    aspectRatio: 125 / 72,
    footprint: { width: 2, depth: 1 },    // 配置時に占めるグリッド数（横幅・奥行き）
    placementType: 'floor',               // 配置場所の種類（floor: 床、wall: 壁）
    placementAnchor: { x: 0.5, y: 0.95 }, // 配置判定に使う基準点（幅・奥行きに対する割合。0.5, 1 は中央下端）
  }),

  // ここからテーブル・チェアの追加商品
  //椅子
  poco('poco_chair_001', 'ナチュラル ダイニングチェア', 'table-chair', 480, '🪑', '食事も作業も心地よく。明るい木目のコンパクトチェア。', ['popular'], {
    size: 'L',
    scale: 1,
    aspectRatio: 125 / 72,
    footprint: { width: 2, depth: 1 },    // 配置時に占めるグリッド数（横幅・奥行き）
    placementType: 'floor',               // 配置場所の種類（floor: 床、wall: 壁）
    placementAnchor: { x: 0.5, y: 0.95 }, // 配置判定に使う基準点（幅・奥行きに対する割合。0.5, 1 は中央下端）
  }),
  poco('poco_chair_002', 'ナチュラル ダイニングチェア', 'table-chair', 480, '🪑', '食事も作業も心地よく。明るい木目のコンパクトチェア。', ['popular'], {
    size: 'L',
    scale: 1,
    aspectRatio: 125 / 72,
    footprint: { width: 2, depth: 1 },    // 配置時に占めるグリッド数（横幅・奥行き）
    placementType: 'floor',               // 配置場所の種類（floor: 床、wall: 壁）
    placementAnchor: { x: 0.5, y: 0.95 }, // 配置判定に使う基準点（幅・奥行きに対する割合。0.5, 1 は中央下端）
  }),
  poco('poco_chair_003', 'ナチュラル ダイニングチェア', 'table-chair', 480, '🪑', '食事も作業も心地よく。明るい木目のコンパクトチェア。', ['popular'], {
    size: 'L',
    scale: 1,
    aspectRatio: 125 / 72,
    footprint: { width: 2, depth: 1 },    // 配置時に占めるグリッド数（横幅・奥行き）
    placementType: 'floor',               // 配置場所の種類（floor: 床、wall: 壁）
    placementAnchor: { x: 0.5, y: 0.95 }, // 配置判定に使う基準点（幅・奥行きに対する割合。0.5, 1 は中央下端）
  }),

  //テーブル
  poco('poco_table_001', 'ナチュラル ダイニングテーブル', 'table-chair', 780, '🪵', '食事も作業も心地よく。明るい木目のコンパクトテーブル。', ['popular'], {
    size: 'L',
    scale: 1,
    aspectRatio: 125 / 72,
    footprint: { width: 5, depth: 1 },    // 配置時に占めるグリッド数（横幅・奥行き）
    placementType: 'floor',               // 配置場所の種類（floor: 床、wall: 壁）
    placementAnchor: { x: 0.5, y: 0.95 }, // 配置判定に使う基準点（幅・奥行きに対する割合。0.5, 1 は中央下端）
  }),
   poco('poco_table_002', 'ナチュラル ダイニングテーブル', 'table-chair', 780, '🪵', '食事も作業も心地よく。明るい木目のコンパクトテーブル。', ['popular'], {
    size: 'L',
    scale: 1,
    aspectRatio: 125 / 72,
    footprint: { width: 5, depth: 1 },    // 配置時に占めるグリッド数（横幅・奥行き）
    placementType: 'floor',               // 配置場所の種類（floor: 床、wall: 壁）
    placementAnchor: { x: 0.5, y: 0.95 }, // 配置判定に使う基準点（幅・奥行きに対する割合。0.5, 1 は中央下端）
  }),
   poco('poco_table_003', 'ナチュラル ダイニングテーブル', 'table-chair', 780, '🪵', '食事も作業も心地よく。明るい木目のコンパクトテーブル。', ['popular'], {
    size: 'L',
    scale: 1,
    aspectRatio: 125 / 72,
    footprint: { width: 5, depth: 1 },    // 配置時に占めるグリッド数（横幅・奥行き）
    placementType: 'floor',               // 配置場所の種類（floor: 床、wall: 壁）
    placementAnchor: { x: 0.5, y: 0.95 }, // 配置判定に使う基準点（幅・奥行きに対する割合。0.5, 1 は中央下端）
  }),

  // ここから観葉植物の追加商品
  poco('poco_decor_001', '陶器のフラワーベース', 'decor', 160, '🏺', '季節の花も枝ものも似合う、素朴な白い花器。', ['new'], {
    size: 'L',
    scale: 1,
    aspectRatio: 125 / 72,
    footprint: { width: 2, depth: 1 },    // 配置時に占めるグリッド数（横幅・奥行き）
    placementType: 'floor',               // 配置場所の種類（floor: 床、wall: 壁）
    placementAnchor: { x: 0.5, y: 0.95 }, // 配置判定に使う基準点（幅・奥行きに対する割合。0.5, 1 は中央下端）
  }),
  poco('poco_decor_002', '陶器のフラワーベース', 'decor', 160, '🏺', '季節の花も枝ものも似合う、素朴な白い花器。', ['new'], {
    size: 'L',
    scale: 1,
    aspectRatio: 125 / 72,
    footprint: { width: 2, depth: 1 },    // 配置時に占めるグリッド数（横幅・奥行き）
    placementType: 'floor',               // 配置場所の種類（floor: 床、wall: 壁）
    placementAnchor: { x: 0.5, y: 0.95 }, // 配置判定に使う基準点（幅・奥行きに対する割合。0.5, 1 は中央下端）
  }),
  poco('poco_decor_003', 'アートブック スタック', 'decor', 140, '📖', '棚やテーブルの上を少し楽しくする、色の重なり。', ['recommended'], {
    size: 'L',
    scale: 1,
    aspectRatio: 125 / 72,
    footprint: { width: 2, depth: 1 },    // 配置時に占めるグリッド数（横幅・奥行き）
    placementType: 'floor',               // 配置場所の種類（floor: 床、wall: 壁）
    placementAnchor: { x: 0.5, y: 0.95 }, // 配置判定に使う基準点（幅・奥行きに対する割合。0.5, 1 は中央下端）
  }),

  // ここから照明の追加商品
  poco('poco_lighting_001', 'やわらかフロアランプ', 'lighting', 460, '💡', '夜の時間をあたためる、布シェードのフロアランプ。', ['popular'], {
    size: 'L',
    scale: 1,
    aspectRatio: 125 / 72,
    footprint: { width: 2, depth: 1 },    // 配置時に占めるグリッド数（横幅・奥行き）
    placementType: 'floor',               // 配置場所の種類（floor: 床、wall: 壁）
    placementAnchor: { x: 0.5, y: 0.95 }, // 配置判定に使う基準点（幅・奥行きに対する割合。0.5, 1 は中央下端）
  }),
  poco('poco_lighting_002', 'ミニテーブルライト', 'lighting', 220, '🔆', 'ベッドサイドにもデスクにも合う、小さな明かり。', ['new'], {
    size: 'L',
    scale: 1,
    aspectRatio: 125 / 72,
    footprint: { width: 2, depth: 1 },    // 配置時に占めるグリッド数（横幅・奥行き）
    placementType: 'floor',               // 配置場所の種類（floor: 床、wall: 壁）
    placementAnchor: { x: 0.5, y: 0.95 }, // 配置判定に使う基準点（幅・奥行きに対する割合。0.5, 1 は中央下端）
  }),
  poco('poco_lighting_003', 'ペンダントライト', 'lighting', 380, '💡', '食卓やリビングに、やさしい光を届けるペンダントライト。', ['recommended'], {
    size: 'L',
    scale: 1,
    aspectRatio: 125 / 72,
    footprint: { width: 2, depth: 1 },    // 配置時に占めるグリッド数（横幅・奥行き）
    placementType: 'floor',               // 配置場所の種類（floor: 床、wall: 壁）
    placementAnchor: { x: 0.5, y: 0.95 }, // 配置判定に使う基準点（幅・奥行きに対する割合。0.5, 1 は中央下端）
  }),
  
  // ここからラグの追加商品
  poco('poco_rug_001', 'チェックコットンラグ', 'rug', 420, '🧶', '足元をやわらかく彩る、洗えるコットンラグ。', ['popular'], {
    size: 'L',
    scale: 1,
    aspectRatio: 125 / 72,
    footprint: { width: 2, depth: 1 },    // 配置時に占めるグリッド数（横幅・奥行き）
    placementType: 'floor',               // 配置場所の種類（floor: 床、wall: 壁）
    placementAnchor: { x: 0.5, y: 0.95 }, // 配置判定に使う基準点（幅・奥行きに対する割合。0.5, 1 は中央下端）
  }),
  poco('poco_rug_002', 'チェックコットンラグ', 'rug', 420, '🧶', '足元をやわらかく彩る、洗えるコットンラグ。', ['popular'], {
    size: 'L',
    scale: 1,
    aspectRatio: 125 / 72,
    footprint: { width: 2, depth: 1 },    // 配置時に占めるグリッド数（横幅・奥行き）
    placementType: 'floor',               // 配置場所の種類（floor: 床、wall: 壁）
    placementAnchor: { x: 0.5, y: 0.95 }, // 配置判定に使う基準点（幅・奥行きに対する割合。0.5, 1 は中央下端）
  }),
  poco('poco_rug_003', 'チェックコットンラグ', 'rug', 420, '🧶', '足元をやわらかく彩る、洗えるコットンラグ。', ['popular'], {
    size: 'L',
    scale: 1,
    aspectRatio: 125 / 72,
    footprint: { width: 2, depth: 1 },    // 配置時に占めるグリッド数（横幅・奥行き）
    placementType: 'floor',               // 配置場所の種類（floor: 床、wall: 壁）
    placementAnchor: { x: 0.5, y: 0.95 }, // 配置判定に使う基準点（幅・奥行きに対する割合。0.5, 1 は中央下端）
  }),
  poco('poco_rug_004', 'チェックコットンラグ', 'rug', 420, '🧶', '足元をやわらかく彩る、洗えるコットンラグ。', ['popular'], {
    size: 'L',
    scale: 1,
    aspectRatio: 125 / 72,
    footprint: { width: 2, depth: 1 },    // 配置時に占めるグリッド数（横幅・奥行き）
    placementType: 'floor',               // 配置場所の種類（floor: 床、wall: 壁）
    placementAnchor: { x: 0.5, y: 0.95 }, // 配置判定に使う基準点（幅・奥行きに対する割合。0.5, 1 は中央下端）
  }),
  poco('poco_rug_005', 'チェックコットンラグ', 'rug', 420, '🧶', '足元をやわらかく彩る、洗えるコットンラグ。', ['popular'], {
    size: 'L',
    scale: 1,
    aspectRatio: 125 / 72,
    footprint: { width: 2, depth: 1 },    // 配置時に占めるグリッド数（横幅・奥行き）
    placementType: 'floor',               // 配置場所の種類（floor: 床、wall: 壁）
    placementAnchor: { x: 0.5, y: 0.95 }, // 配置判定に使う基準点（幅・奥行きに対する割合。0.5, 1 は中央下端）
  }),
  poco('poco_rug_001', 'チェックコットンラグ', 'rug', 420, '🧶', '足元をやわらかく彩る、洗えるコットンラグ。', ['popular'], {
    size: 'L',
    scale: 1,
    aspectRatio: 125 / 72,
    footprint: { width: 2, depth: 1 },    // 配置時に占めるグリッド数（横幅・奥行き）
    placementType: 'floor',               // 配置場所の種類（floor: 床、wall: 壁）
    placementAnchor: { x: 0.5, y: 0.95 }, // 配置判定に使う基準点（幅・奥行きに対する割合。0.5, 1 は中央下端）
  }),
  // ここからテレビの追加商品
  poco('poco_TV_001', 'スマートテレビ５０型', 'tv', 1200, '📺', '家族で楽しめる、最新のスマートテレビ５０型。', ['popular'], {
    size: 'L',
    scale: 1,
    aspectRatio: 125 / 72,
    footprint: { width: 2, depth: 1 },    // 配置時に占めるグリッド数（横幅・奥行き）
    placementType: 'floor',               // 配置場所の種類（floor: 床、wall: 壁）
    placementAnchor: { x: 0.5, y: 0.95 }, // 配置判定に使う基準点（幅・奥行きに対する割合。0.5, 1 は中央下端）
  }),
  poco('poco_TV_002', 'スマートテレビ４０型', 'tv', 1000, '📺', 'コンパクトで使いやすい、最新のスマートテレビ４０型。', ['recommended'], {
    size: 'L',
    scale: 1,
    aspectRatio: 125 / 72,
    footprint: { width: 2, depth: 1 },    // 配置時に占めるグリッド数（横幅・奥行き）
    placementType: 'floor',               // 配置場所の種類（floor: 床、wall: 壁）
    placementAnchor: { x: 0.5, y: 0.95 }, // 配置判定に使う基準点（幅・奥行きに対する割合。0.5, 1 は中央下端）
  }),
  poco('poco_TV_003', 'スマートテレビ６０型', 'tv', 1500, '📺', '大画面で迫力のある、最新のスマートテレビ６０型。', ['new'], {
    size: 'L',
    scale: 1,
    aspectRatio: 125 / 72,
    footprint: { width: 2, depth: 1 },    // 配置時に占めるグリッド数（横幅・奥行き）
    placementType: 'floor',               // 配置場所の種類（floor: 床、wall: 壁）
    placementAnchor: { x: 0.5, y: 0.95 }, // 配置判定に使う基準点（幅・奥行きに対する割合。0.5, 1 は中央下端）
  }),

  // ここからクッションの追加商品
  poco('poco_cushion_001', 'やわらかクッション', 'cushion', 80, '🛋️', '座り心地の良い、やわらかいクッション。', ['new'], {
    size: 'L',
    scale: 1,
    aspectRatio: 125 / 72,
    footprint: { width: 2, depth: 1 },    // 配置時に占めるグリッド数（横幅・奥行き）
    placementType: 'floor',               // 配置場所の種類（floor: 床、wall: 壁）
    placementAnchor: { x: 0.5, y: 0.95 }, // 配置判定に使う基準点（幅・奥行きに対する割合。0.5, 1 は中央下端）
  }),
  poco('poco_cushion_002', 'ふかふかクッション', 'cushion', 120, '🛋️', 'より快適な座り心地を。', ['recommended'], {
    size: 'L',
    scale: 1,
    aspectRatio: 125 / 72,
    footprint: { width: 2, depth: 1 },    // 配置時に占めるグリッド数（横幅・奥行き）
    placementType: 'floor',               // 配置場所の種類（floor: 床、wall: 壁）
    placementAnchor: { x: 0.5, y: 0.95 }, // 配置判定に使う基準点（幅・奥行きに対する割合。0.5, 1 は中央下端）
  }),
  poco('poco_cushion_003', 'ふわふわクッション', 'cushion', 80, '🛋️', 'かわいげのあるデザインで、部屋を彩ります。', ['new'], {
    size: 'L',
    scale: 1,
    aspectRatio: 125 / 72,
    footprint: { width: 2, depth: 1 },    // 配置時に占めるグリッド数（横幅・奥行き）
    placementType: 'floor',               // 配置場所の種類（floor: 床、wall: 壁）
    placementAnchor: { x: 0.5, y: 0.95 }, // 配置判定に使う基準点（幅・奥行きに対する割合。0.5, 1 は中央下端）
  }),

  // ここからオープンラックの追加商品
  poco('poco_openrack_001', 'オープンラック', 'openrack', 600, '🗄️', '見せる収納にぴったりな、シンプルなオープンラック。', ['recommended'], {
   size: 'L',
    scale: 1,
    aspectRatio: 125 / 72,
    footprint: { width: 2, depth: 1 },    // 配置時に占めるグリッド数（横幅・奥行き）
    placementType: 'floor',               // 配置場所の種類（floor: 床、wall: 壁）
    placementAnchor: { x: 0.5, y: 0.95 }, // 配置判定に使う基準点（幅・奥行きに対する割合。0.5, 1 は中央下端）
  }),

  poco('poco_openrack_002', 'オープンラック', 'openrack', 600, '🗄️', '見せる収納にぴったりな、シンプルなオープンラック。', ['recommended'], {
   size: 'L',
    scale: 1,
    aspectRatio: 125 / 72,
    footprint: { width: 2, depth: 1 },    // 配置時に占めるグリッド数（横幅・奥行き）
    placementType: 'floor',               // 配置場所の種類（floor: 床、wall: 壁）
    placementAnchor: { x: 0.5, y: 0.95 }, // 配置判定に使う基準点（幅・奥行きに対する割合。0.5, 1 は中央下端）
  }),

   poco('poco_openrack_003', 'オープンラック', 'openrack', 600, '🗄️', '見せる収納にぴったりな、シンプルなオープンラック。', ['recommended'], {
   size: 'L',
    scale: 1,
    aspectRatio: 125 / 72,
    footprint: { width: 2, depth: 1 },    // 配置時に占めるグリッド数（横幅・奥行き）
    placementType: 'floor',               // 配置場所の種類（floor: 床、wall: 壁）
    placementAnchor: { x: 0.5, y: 0.95 }, // 配置判定に使う基準点（幅・奥行きに対する割合。0.5, 1 は中央下端）
  }),

  //ベッド追加
  poco('poco_bed_001', 'シングルベッド', 'bed', 1000, '🛏️', '快適な眠りをサポートする、シンプルなシングルベッド。', ['popular'], 
    { size: 'L',
    scale: 1,
    aspectRatio: 125 / 72,
    footprint: { width: 2, depth: 1 },    // 配置時に占めるグリッド数（横幅・奥行き）
    placementType: 'floor',               // 配置場所の種類（floor: 床、wall: 壁）
    placementAnchor: { x: 0.5, y: 0.95 }, // 配置判定に使う基準点（幅・奥行きに対する割合。0.5, 1 は中央下端）
  }),
  poco('poco_bed_002', 'シングルベッド', 'bed', 1000, '🛏️', '快適な眠りをサポートする、シンプルなシングルベッド。', ['popular'], 
    { size: 'L',
    scale: 1,
    aspectRatio: 125 / 72,
    footprint: { width: 2, depth: 1 },    // 配置時に占めるグリッド数（横幅・奥行き）
    placementType: 'floor',               // 配置場所の種類（floor: 床、wall: 壁）
    placementAnchor: { x: 0.5, y: 0.95 }, // 配置判定に使う基準点（幅・奥行きに対する割合。0.5, 1 は中央下端）
  }),
  poco('poco_bed_003', 'シングルベッド', 'bed', 1000, '🛏️', '快適な眠りをサポートする、シンプルなシングルベッド。', ['popular'], 
    { size: 'L',
    scale: 1,
    aspectRatio: 125 / 72,
    footprint: { width: 2, depth: 1 },    // 配置時に占めるグリッド数（横幅・奥行き）
    placementType: 'floor',               // 配置場所の種類（floor: 床、wall: 壁）
    placementAnchor: { x: 0.5, y: 0.95 }, // 配置判定に使う基準点（幅・奥行きに対する割合。0.5, 1 は中央下端）
  }),

// ここまで////////////////////////////////////////////////////////////////////////////////////////////////////////////




];

export const getProductById = (productId) => PRODUCT_CATALOG.find((product) => product.id === productId) ?? null;

export const isProductImagePath = (image) =>
  typeof image === 'string' &&
  (image.startsWith('/') || image.startsWith('http') || /\.(png|jpe?g|webp|gif|svg)$/i.test(image));
export const getProductsByBrand = (brand) => PRODUCT_CATALOG.filter((product) => product.brand === brand);
