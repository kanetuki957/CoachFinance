import { FURNITURE_DEFAULT_POSITIONS, getFurnitureById } from './furnitureCatalog.js';
//家具の位置・大きさを計算するための、画面サイズに依存しない部屋の基準座標。
const ROOM_WIDTH = 320;
const ROOM_HEIGHT = 320;

// 同じ家具を複数置けるよう、配置する1個ごとに一意の ID を発行する。
const createInstanceId = (furnitureId) => `${furnitureId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
// 家具が部屋の外にはみ出さないよう、座標を部屋の範囲内に収める。

const clampPosition = (furniture, x, y) => ({
  x: Math.min(Math.max(Math.round(Number(x) || 0), 0), ROOM_WIDTH - furniture.width),
  y: Math.min(Math.max(Math.round(Number(y) || 0), 0), ROOM_HEIGHT - furniture.height),
});

// 保存済みデータを現在の形式へ整形する。
// 旧形式（家具IDだけの配列）にも対応し、未定義の家具や所持数を超える配置を除外する。

export const normalizeFurnitureState = (game) => {
  const quantities = new Map();
  (game?.ownedFurniture ?? []).forEach((item) => {
    const furnitureId = typeof item === 'string' ? item : item?.furnitureId;
    const quantity = typeof item === 'string' ? 1 : Number(item?.quantity) || 0;
    if (!getFurnitureById(furnitureId) || quantity <= 0) return;
    quantities.set(furnitureId, (quantities.get(furnitureId) ?? 0) + quantity);
  });
  const ownedFurniture = [...quantities].map(([furnitureId, quantity]) => ({ furnitureId, quantity }));
  const placedCount = new Map();
  const placedFurniture = (game?.placedFurniture ?? []).flatMap((item, index) => {
    const furnitureId = typeof item === 'string' ? item : item?.furnitureId;
    const furniture = getFurnitureById(furnitureId);
    const owned = quantities.get(furnitureId) ?? 0;
    const count = placedCount.get(furnitureId) ?? 0;
    if (!furniture || count >= owned) return [];
    placedCount.set(furnitureId, count + 1);
    const fallback = FURNITURE_DEFAULT_POSITIONS[furnitureId] ?? { x: 100, y: 180 };
    const position = clampPosition(furniture, item?.x ?? fallback.x, item?.y ?? fallback.y);
    return [{ instanceId: typeof item === 'string' ? `legacy-${furnitureId}-${index}` : item.instanceId ?? `legacy-${furnitureId}-${index}`, furnitureId, ...position, zIndex: Math.max(1, Number(item?.zIndex) || 1) }];
  });
  return { ownedFurniture, placedFurniture };
};
// 指定した家具の所持数を返す。
export const getOwnedFurnitureQuantity = (ownedFurniture, furnitureId) =>
  ownedFurniture.find((item) => item.furnitureId === furnitureId)?.quantity ?? 0;
// 所持金を消費して家具を購入し、更新後のゲーム状態と購入結果を返す。

export const purchaseFurniture = (game, furnitureId) => {
  // 購入前に保存データを正規化し、古い配列形式でも安全に数量を更新する。
  const furniture = getFurnitureById(furnitureId);
  const state = normalizeFurnitureState(game);
  if (!furniture) return { game, result: { ok: false, reason: 'not-found' } };
  if (game.money < furniture.price) return { game, result: { ok: false, reason: 'insufficient-funds', furniture } };

  // 同じ家具はレコードを重複させず quantity を加算し、初回だけ新規レコードを追加する。
  const quantity = getOwnedFurnitureQuantity(state.ownedFurniture, furnitureId);
  const ownedFurniture = quantity ? state.ownedFurniture.map((item) => item.furnitureId === furnitureId ? { ...item, quantity: item.quantity + 1 } : item) : [...state.ownedFurniture, { furnitureId, quantity: 1 }];
  // 購入では所持数のみを増やす。部屋への配置は placeFurniture の責務。
  return { game: { ...game, ...state, money: game.money - furniture.price, ownedFurniture }, result: { ok: true, furniture } };
};
// 所持していて、まだ部屋に置いていない家具を初期位置に配置する。

export const placeFurniture = (game, furnitureId, position = null) => {
  // 配置済み数と所持数を比べ、同一家具を購入数より多く置かない。
  const state = normalizeFurnitureState(game);
  const furniture = getFurnitureById(furnitureId);
  const ownedQuantity = getOwnedFurnitureQuantity(state.ownedFurniture, furnitureId);
  const placedQuantity = state.placedFurniture.filter((item) => item.furnitureId === furnitureId).length;
  if (!furniture || placedQuantity >= ownedQuantity) return { game, ok: false, reason: 'not-available' };
  const fallback = FURNITURE_DEFAULT_POSITIONS[furnitureId] ?? { x: 100, y: 180 };
  const placementPosition = clampPosition(furniture, position?.x ?? fallback.x, position?.y ?? fallback.y);
  return {
    // 新しい配置には固有 ID と重なり順を与え、初期座標も部屋の範囲内に収める。
    game: { ...game, ...state, placedFurniture: [...state.placedFurniture, { instanceId: createInstanceId(furnitureId), furnitureId, ...placementPosition, rotation: Number(position?.rotation) || 0, zIndex: state.placedFurniture.length + 1 }] },
    ok: true,
  };
};
// ドラッグ操作で指定した配置済み家具の座標を更新する。

export const updateFurniturePosition = (game, instanceId, x, y) => {
  const state = normalizeFurnitureState(game);
  const placedFurniture = state.placedFurniture.map((item) => item.instanceId !== instanceId ? item : { ...item, ...clampPosition(getFurnitureById(item.furnitureId), x, y) });
  return { game: { ...game, ...state, placedFurniture }, ok: state.placedFurniture.some((item) => item.instanceId === instanceId) };
};
// 家具を部屋から片付ける。所持データは残すため、再配置できる。

export const removeFurniture = (game, instanceId) => {
  const state = normalizeFurnitureState(game);
  const placedFurniture = state.placedFurniture.filter((item) => item.instanceId !== instanceId);
  return { game: { ...game, ...state, placedFurniture }, ok: placedFurniture.length !== state.placedFurniture.length };
};
// RoomFurniture コンポーネントが座標を表示用の割合へ変換する際に使う基準サイズ。

export const ROOM_SIZE = { width: ROOM_WIDTH, height: ROOM_HEIGHT };
