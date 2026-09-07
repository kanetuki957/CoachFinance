export const STATUS_KEYS = ['knowledge', 'wealth', 'strength'];
export const STATUS_MAX = 100;
export const DEFAULT_GAME_STATE = Object.freeze({
  knowledge: 0,
  wealth: 0,
  strength: 0,
  money: 0,
  ownedFurniture: [],
  placedFurniture: [],
});

export const normalizeGameState = (game) => ({
  knowledge: Math.min(Math.max(Number(game?.knowledge) || 0, 0), STATUS_MAX),
  wealth: Math.min(Math.max(Number(game?.wealth) || 0, 0), STATUS_MAX),
  strength: Math.min(Math.max(Number(game?.strength) || 0, 0), STATUS_MAX),
  money: Math.max(Number(game?.money) || 0, 0),
  ...normalizeFurnitureState(game),
});

/**
 * Applies the reward from one already-validated task completion.
 * Keeping this pure prevents UI code from owning game rules and makes future
 * rewards (items, rooms, penalties) straightforward additions.
 */
export const applyTaskCompletionReward = (game, goal) => {
  const current = normalizeGameState(game);
  const statusType = STATUS_KEYS.includes(goal?.statusType) ? goal.statusType : null;
  const statusReward = statusType ? Number(goal?.statusReward) || 5 : 0;
  const moneyReward = Number(goal?.moneyReward) || 100;
  const nextGame = {
    ...current,
    ...(statusType ? { [statusType]: Math.min(current[statusType] + statusReward, STATUS_MAX) } : {}),
    money: current.money + moneyReward,
  };

  return {
    game: nextGame,
    reward: { statusType, statusReward, moneyReward },
  };
};
import { normalizeFurnitureState } from '../furniture/furnitureInventory.js';
