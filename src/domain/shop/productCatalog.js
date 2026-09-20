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
];

// 旧ショップの表示互換用。POCO HOME では POCO_CATEGORIES を使用します。
export const SHOP_CATEGORIES = POCO_CATEGORIES;

const poco = (id, name, category, price, image, description, tags, width, height) => ({
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
  isFurniture: true, width, height,
  // Grid data keeps placement responsive while preserving the existing pixel dimensions for legacy room rendering.
  gridWidth: Math.max(1, Math.ceil(width / 32)), gridHeight: Math.max(1, Math.ceil(height / 32)),
});

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
  poco('poco_storage_001', 'リネン ボックスラック', 'storage', 350, '🗄️', '布の風合いがやさしい、見せても隠しても使える収納ラック。', ['new'], 72, 100),
  poco('poco_storage_002', 'スリム ウッドシェルフ', 'storage', 600, '📚', '小さなスペースにも置きやすい、軽やかな木製シェルフ。', ['popular'], 70, 105),
  poco('poco_storage_003', 'まるいバスケット', 'storage', 180, '🧺', 'ブランケットや小物を気軽にしまえる、毎日のかご。', ['recommended'], 52, 50),
  poco('poco_sofa_001', 'くもり空 ソファ', 'sofa', 850, '🛋️', 'どんな部屋にも馴染む、ゆったり2人掛けソファ。', ['popular'], 125, 72),
  poco('poco_sofa_002', 'ひとり時間チェア', 'sofa', 520, '💺', '読書にも休憩にもぴったりな、丸みのあるチェア。', ['new'], 65, 75),
  poco('poco_sofa_003', 'ふかふかオットマン', 'sofa', 260, '🟫', 'ソファの相棒にも、来客用の椅子にもなる一台。', ['recommended'], 58, 42),
  poco('poco_table_001', 'ナチュラル ダイニングテーブル', 'table-chair', 780, '🪵', '食事も作業も心地よく。明るい木目のコンパクトテーブル。', ['popular'], 112, 68),
  poco('poco_table_002', 'ウッドサイドテーブル', 'table-chair', 300, '🪑', '飲み物や本をそっと置ける、部屋に馴染む小さなテーブル。', ['recommended'], 58, 54),
  poco('poco_table_003', 'ナチュラルチェア', 'table-chair', 240, '🪑', '軽くて置きやすい、飽きのこない木製チェア。', ['new'], 56, 68),
  poco('poco_decor_001', '窓辺の観葉植物', 'decor', 120, '🪴', 'ひとつ置くだけで部屋の空気が変わる、育てやすいグリーン。', ['recommended', 'popular'], 52, 72),
  poco('poco_decor_002', '陶器のフラワーベース', 'decor', 160, '🏺', '季節の花も枝ものも似合う、素朴な白い花器。', ['new'], 40, 56),
  poco('poco_decor_003', 'アートブック スタック', 'decor', 140, '📖', '棚やテーブルの上を少し楽しくする、色の重なり。', ['recommended'], 48, 28),
  poco('poco_lighting_001', 'やわらかフロアランプ', 'lighting', 460, '💡', '夜の時間をあたためる、布シェードのフロアランプ。', ['popular'], 45, 88),
  poco('poco_lighting_002', 'ミニテーブルライト', 'lighting', 220, '🔆', 'ベッドサイドにもデスクにも合う、小さな明かり。', ['new'], 38, 50),
  poco('poco_rug_001', 'チェックコットンラグ', 'rug', 420, '🧶', '足元をやわらかく彩る、洗えるコットンラグ。', ['popular'], 115, 55),
  poco('poco_rug_002', 'まるい玄関マット', 'rug', 190, '⭕', '帰るたびに気分が少し上がる、丸いミニラグ。', ['recommended'], 62, 40),
  poco('poco_bed_001', 'ふかふかベッド', 'bed', 1200, '🛏', '心を落ち着ける、ふかふかの寝具。', ['popular'], 150, 100),
  poco('poco_TV_001', 'スマートテレビ５０型', 'tv', 1200, '📺', '家族で楽しめる、最新のスマートテレビ５０型。', ['popular'], 150, 100),

];

export const getProductById = (productId) => PRODUCT_CATALOG.find((product) => product.id === productId) ?? null;

export const isProductImagePath = (image) =>
  typeof image === 'string' &&
  (image.startsWith('/') || image.startsWith('http') || /\.(png|jpe?g|webp|gif|svg)$/i.test(image));
export const getProductsByBrand = (brand) => PRODUCT_CATALOG.filter((product) => product.brand === brand);
