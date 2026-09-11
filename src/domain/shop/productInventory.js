import { purchaseFurniture } from '../furniture/furnitureInventory.js';
import { getProductById } from './productCatalog.js';

// 旧 ownedFurniture と新しい ownedProducts を統合し、保存データを安全な形式にそろえる。
export const normalizeProductInventory = (game) => {
  const quantities = new Map();

  (game?.ownedProducts ?? []).forEach((item) => {
    const productId = typeof item === 'string' ? item : item?.productId;
    const quantity = typeof item === 'string' ? 1 : Number(item?.quantity) || 0;
    if (getProductById(productId) && quantity > 0) quantities.set(productId, quantity);
  });

  // 既存ユーザーの家具所持データを、商品全体の所持データへ自動移行する。
  (game?.ownedFurniture ?? []).forEach((item) => {
    const productId = typeof item === 'string' ? item : item?.furnitureId;
    const quantity = typeof item === 'string' ? 1 : Number(item?.quantity) || 0;
    if (getProductById(productId)?.category === 'item' && quantity > 0) {
      quantities.set(productId, Math.max(quantities.get(productId) ?? 0, quantity));
    }
  });

  return { ownedProducts: [...quantities].map(([productId, quantity]) => ({ productId, quantity })) };
};

// 商品 ID の所持数を返す。全カテゴリ共通で使用する。
export const getOwnedProductQuantity = (ownedProducts, productId) =>
  ownedProducts.find((item) => item.productId === productId)?.quantity ?? 0;

// 商品を購入する共通処理。item は既存の家具在庫も同時に更新し、将来の配置機能を維持する。
export const purchaseProduct = (game, productId) => {
  const product = getProductById(productId);
  if (!product) return { game, result: { ok: false, reason: 'not-found' } };
  if (game.money < product.price) return { game, result: { ok: false, reason: 'insufficient-funds', product } };

  const furniturePurchase = product.category === 'item' ? purchaseFurniture(game, productId) : null;
  const sourceGame = furniturePurchase?.game ?? { ...game, money: game.money - product.price };
  const inventory = normalizeProductInventory(sourceGame);
  // item は purchaseFurniture 済みの所持数を移行するだけ。ここで増やすと二重加算になる。
  const ownedProducts = product.category === 'item'
    ? inventory.ownedProducts
    : (() => {
      const quantity = getOwnedProductQuantity(inventory.ownedProducts, productId);
      return quantity
        ? inventory.ownedProducts.map((item) => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item)
        : [...inventory.ownedProducts, { productId, quantity: 1 }];
    })();

  return { game: { ...sourceGame, ownedProducts }, result: { ok: true, product } };
};
