import { FURNITURE_DEFAULT_POSITIONS, getFurnitureById } from './furnitureCatalog.js';

export const ROOM_SIZE = { width: 320, height: 320 };
export const GRID_CELL_SIZE = 32;
export const ROOM_GRID = { columns: 10, rows: 10 };
const createInstanceId = (id) => `${id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const clamp = (value, maximum) => Math.min(Math.max(Math.round(Number(value) || 0), 0), maximum);

// Products may supply directional PNGs through `orientations`; the existing single image is a safe fallback.
export const getFurnitureOrientations = (product) => product.orientations?.length ? product.orientations : [{ id: 'default', image: product.image, gridWidth: product.gridWidth ?? Math.max(1, Math.ceil(product.width / GRID_CELL_SIZE)), gridHeight: product.gridHeight ?? Math.max(1, Math.ceil(product.height / GRID_CELL_SIZE)) }];
export const getFurnitureOrientation = (product, id) => getFurnitureOrientations(product).find((item) => item.id === id) ?? getFurnitureOrientations(product)[0];
export const getGridFootprint = (product, orientation) => {
  const value = getFurnitureOrientation(product, orientation);
  return { orientation: value.id, image: value.image, gridWidth: value.gridWidth, gridHeight: value.gridHeight };
};

const normalizePlacement = (product, item, index) => {
  const fallback = FURNITURE_DEFAULT_POSITIONS[product.id] ?? { x: 96, y: 160 };
  const footprint = getGridFootprint(product, item?.orientation);
  const gridX = clamp(item?.gridX ?? Math.round((item?.x ?? fallback.x) / GRID_CELL_SIZE), ROOM_GRID.columns - footprint.gridWidth);
  const gridY = clamp(item?.gridY ?? Math.round((item?.y ?? fallback.y) / GRID_CELL_SIZE), ROOM_GRID.rows - footprint.gridHeight);
  return { instanceId: typeof item === 'string' ? `legacy-${product.id}-${index}` : item.instanceId ?? `legacy-${product.id}-${index}`, furnitureId: product.id, productId: product.id, gridX, gridY, orientation: footprint.orientation, x: gridX * GRID_CELL_SIZE, y: gridY * GRID_CELL_SIZE, zIndex: Math.max(1, Number(item?.zIndex) || 1), placedAt: item?.placedAt };
};

export const normalizeFurnitureState = (game) => {
  const quantities = new Map();
  (game?.ownedFurniture ?? []).forEach((item) => {
    const id = typeof item === 'string' ? item : item?.furnitureId;
    const quantity = typeof item === 'string' ? 1 : Number(item?.quantity) || 0;
    if (getFurnitureById(id) && quantity > 0) quantities.set(id, (quantities.get(id) ?? 0) + quantity);
  });
  const ownedFurniture = [...quantities].map(([furnitureId, quantity]) => ({ furnitureId, quantity }));
  const placedCount = new Map();
  const placedFurniture = (game?.placedFurniture ?? []).flatMap((item, index) => {
    const id = typeof item === 'string' ? item : item?.furnitureId ?? item?.productId;
    const product = getFurnitureById(id);
    if (!product || (placedCount.get(id) ?? 0) >= (quantities.get(id) ?? 0)) return [];
    placedCount.set(id, (placedCount.get(id) ?? 0) + 1);
    return [normalizePlacement(product, item, index)];
  });
  return { ownedFurniture, placedFurniture };
};

export const getOwnedFurnitureQuantity = (items, id) => items.find((item) => item.furnitureId === id)?.quantity ?? 0;
const overlaps = (a, b) => a.gridX < b.gridX + b.gridWidth && a.gridX + a.gridWidth > b.gridX && a.gridY < b.gridY + b.gridHeight && a.gridY + a.gridHeight > b.gridY;

export const isFurniturePlacementAvailable = (items, furnitureId, gridX, gridY, orientation, ignoredInstanceId) => {
  const product = getFurnitureById(furnitureId);
  if (!product) return false;
  const candidate = { gridX, gridY, ...getGridFootprint(product, orientation) };
  if (gridX < 0 || gridY < 0 || gridX + candidate.gridWidth > ROOM_GRID.columns || gridY + candidate.gridHeight > ROOM_GRID.rows) return false;
  return !items.some((item) => {
    if (item.instanceId === ignoredInstanceId) return false;
    const placed = getFurnitureById(item.furnitureId);
    return placed && overlaps(candidate, { gridX: item.gridX, gridY: item.gridY, ...getGridFootprint(placed, item.orientation) });
  });
};

export const purchaseFurniture = (game, furnitureId) => {
  const product = getFurnitureById(furnitureId); const state = normalizeFurnitureState(game);
  if (!product) return { game, result: { ok: false, reason: 'not-found' } };
  if (game.money < product.price) return { game, result: { ok: false, reason: 'insufficient-funds', furniture: product } };
  const quantity = getOwnedFurnitureQuantity(state.ownedFurniture, furnitureId);
  const ownedFurniture = quantity ? state.ownedFurniture.map((item) => item.furnitureId === furnitureId ? { ...item, quantity: item.quantity + 1 } : item) : [...state.ownedFurniture, { furnitureId, quantity: 1 }];
  return { game: { ...game, ...state, money: game.money - product.price, ownedFurniture }, result: { ok: true, furniture: product } };
};

export const placeFurniture = (game, furnitureId, placement = {}) => {
  const state = normalizeFurnitureState(game); const product = getFurnitureById(furnitureId);
  if (!product || state.placedFurniture.filter((item) => item.furnitureId === furnitureId).length >= getOwnedFurnitureQuantity(state.ownedFurniture, furnitureId)) return { game, ok: false, reason: 'not-available' };
  let item = normalizePlacement(product, { ...placement, instanceId: createInstanceId(furnitureId), placedAt: Date.now() }, state.placedFurniture.length);
  if (!isFurniturePlacementAvailable(state.placedFurniture, furnitureId, item.gridX, item.gridY, item.orientation)) {
    // The legacy shop's "place now" action has no chosen grid. Find a free cell instead of failing silently.
    if (placement.gridX !== undefined || placement.gridY !== undefined) return { game, ok: false, reason: 'occupied' };
    const footprint = getGridFootprint(product, item.orientation);
    let alternative = null;
    for (let y = 0; y <= ROOM_GRID.rows - footprint.gridHeight && !alternative; y += 1) for (let x = 0; x <= ROOM_GRID.columns - footprint.gridWidth; x += 1) if (isFurniturePlacementAvailable(state.placedFurniture, furnitureId, x, y, item.orientation)) { alternative = { x, y }; break; }
    if (!alternative) return { game, ok: false, reason: 'occupied' };
    item = normalizePlacement(product, { ...item, gridX: alternative.x, gridY: alternative.y }, state.placedFurniture.length);
  }
  return { game: { ...game, ...state, placedFurniture: [...state.placedFurniture, { ...item, zIndex: state.placedFurniture.length + 1 }] }, ok: true };
};

export const updateFurniturePlacement = (game, instanceId, placement) => {
  const state = normalizeFurnitureState(game); const current = state.placedFurniture.find((item) => item.instanceId === instanceId); const product = current && getFurnitureById(current.furnitureId);
  if (!current || !product) return { game, ok: false, reason: 'not-found' };
  const item = normalizePlacement(product, { ...current, ...placement, placedAt: Date.now() }, 0);
  if (!isFurniturePlacementAvailable(state.placedFurniture, product.id, item.gridX, item.gridY, item.orientation, instanceId)) return { game, ok: false, reason: 'occupied' };
  return { game: { ...game, ...state, placedFurniture: state.placedFurniture.map((entry) => entry.instanceId === instanceId ? { ...item, zIndex: state.placedFurniture.length + 1 } : entry) }, ok: true };
};
export const updateFurniturePosition = (game, id, x, y) => updateFurniturePlacement(game, id, { gridX: Math.round(x / GRID_CELL_SIZE), gridY: Math.round(y / GRID_CELL_SIZE) });
export const removeFurniture = (game, instanceId) => { const state = normalizeFurnitureState(game); const placedFurniture = state.placedFurniture.filter((item) => item.instanceId !== instanceId); return { game: { ...game, ...state, placedFurniture }, ok: placedFurniture.length !== state.placedFurniture.length }; };
