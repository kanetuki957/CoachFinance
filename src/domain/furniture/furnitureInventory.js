import { getFurnitureById } from './furnitureCatalog.js';

export const normalizeFurnitureState = (game) => {
  const quantities = new Map();
  (game?.ownedFurniture ?? []).forEach((item) => {
    const furnitureId = typeof item === 'string' ? item : item?.furnitureId;
    const quantity = typeof item === 'string' ? 1 : Number(item?.quantity) || 0;
    if (!getFurnitureById(furnitureId) || quantity <= 0) return;
    quantities.set(furnitureId, (quantities.get(furnitureId) ?? 0) + quantity);
  });
  const ownedFurniture = [...quantities].map(([furnitureId, quantity]) => ({ furnitureId, quantity }));
  const ownedIds = new Set(ownedFurniture.map((item) => item.furnitureId));
  return {
    ownedFurniture,
    placedFurniture: [...new Set((game?.placedFurniture ?? []).filter((id) => ownedIds.has(id)))],
  };
};

export const getOwnedFurnitureQuantity = (ownedFurniture, furnitureId) =>
  ownedFurniture.find((item) => item.furnitureId === furnitureId)?.quantity ?? 0;

export const purchaseFurniture = (game, furnitureId) => {
  const furniture = getFurnitureById(furnitureId);
  const state = normalizeFurnitureState(game);
  if (!furniture) return { game, result: { ok: false, reason: 'not-found' } };
  if (getOwnedFurnitureQuantity(state.ownedFurniture, furnitureId) > 0) return { game, result: { ok: false, reason: 'already-owned', furniture } };
  if (game.money < furniture.price) return { game, result: { ok: false, reason: 'insufficient-funds', furniture } };

  return {
    game: { ...game, money: game.money - furniture.price, ownedFurniture: [...state.ownedFurniture, { furnitureId, quantity: 1 }], placedFurniture: state.placedFurniture },
    result: { ok: true, furniture },
  };
};

export const placeFurniture = (game, furnitureId) => {
  const state = normalizeFurnitureState(game);
  if (getOwnedFurnitureQuantity(state.ownedFurniture, furnitureId) < 1) return { game, ok: false };
  return { game: { ...game, ...state, placedFurniture: [...new Set([...state.placedFurniture, furnitureId])] }, ok: true };
};

export const removeFurniture = (game, furnitureId) => {
  const state = normalizeFurnitureState(game);
  return { game: { ...game, ...state, placedFurniture: state.placedFurniture.filter((id) => id !== furnitureId) }, ok: true };
};
