import { CHALLENGE_DIFFICULTY_REWARDS } from './challengeCatalog.js';
import { getProductById } from '../shop/productCatalog.js';
import { getFurnitureById } from '../furniture/furnitureCatalog.js';

export const MAX_ACTIVE_CHALLENGES = 3;
const TERMINAL_STATUSES = new Set(['completed', 'failed', 'cancelled']);
const ACTIVE_STATUS = 'active';

const pad = (value) => String(value).padStart(2, '0');
export const getLocalDateKey = (date = new Date()) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const isDateKey = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
const addDays = (dateKey, days) => { const date = new Date(`${dateKey}T00:00:00`); date.setDate(date.getDate() + days); return getLocalDateKey(date); };
const idFor = () => `challenge-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
const rewardForDifficulty = (difficulty) => CHALLENGE_DIFFICULTY_REWARDS[String(difficulty).toUpperCase()] ?? null;
const result = (challenges, changes = {}) => ({ challenges, ...changes });

export const isChallengeExpired = (challenge, now = new Date()) =>
  challenge?.status === ACTIVE_STATUS && isDateKey(challenge.endDate) && getLocalDateKey(now) > challenge.endDate;

export const getActiveChallenges = (challenges = [], now = new Date()) =>
  (Array.isArray(challenges) ? challenges : []).filter((challenge) => challenge?.status === ACTIVE_STATUS && !isChallengeExpired(challenge, now));

export const canStartChallenge = (challenges, goalId, now = new Date()) => {
  const active = getActiveChallenges(challenges, now);
  if (active.length >= MAX_ACTIVE_CHALLENGES) return { ok: false, reason: 'max-active-challenges' };
  if (active.some((challenge) => challenge.goalId === goalId)) return { ok: false, reason: 'duplicate-active-goal' };
  return { ok: true };
};

export const validateSelectedReward = (template, selectedReward) => {
  const difficultyReward = rewardForDifficulty(template?.difficulty);
  if (!difficultyReward || !selectedReward || typeof selectedReward !== 'object') return { ok: false, reason: 'invalid-reward' };
  if (selectedReward.type === 'coins') return selectedReward.amount === difficultyReward.bonusCoins
    ? { ok: true, reward: { type: 'coins', amount: selectedReward.amount } }
    : { ok: false, reason: 'invalid-coin-reward' };
  if (selectedReward.type !== 'furniture' || selectedReward.quantity !== 1) return { ok: false, reason: 'invalid-furniture-reward' };
  const product = getProductById(selectedReward.productId);
  const furniture = getFurnitureById(selectedReward.productId);
  if (!product || !product.isFurniture || !furniture) return { ok: false, reason: 'invalid-furniture-product' };
  if (product.price > difficultyReward.furniturePriceLimit) return { ok: false, reason: 'furniture-price-limit' };
  if (selectedReward.priceAtSelection !== product.price) return { ok: false, reason: 'invalid-furniture-price' };
  return { ok: true, reward: { type: 'furniture', productId: product.id, quantity: 1, priceAtSelection: product.price } };
};

export const createChallenge = (template, selectedReward, options = {}) => {
  const startDate = options.startDate ?? getLocalDateKey(options.now ?? new Date());
  const reward = validateSelectedReward(template, selectedReward);
  if (!template?.id || !Number.isInteger(template.durationDays) || template.durationDays <= 0 || !isDateKey(startDate)) return { ok: false, reason: 'invalid-template' };
  if (!reward.ok) return reward;
  return { ok: true, challenge: {
    id: options.id ?? idFor(), goalId: template.id, difficulty: template.difficulty,
    durationDays: template.durationDays, recordType: template.recordType, progressType: template.progressType,
    targetValue: template.targetValue, unit: template.unit, maxPerDay: template.maxPerDay,
    startDate, endDate: addDays(startDate, template.durationDays - 1), status: ACTIVE_STATUS,
    selectedReward: reward.reward, rewardClaimed: false, previousChallengeId: options.previousChallengeId ?? null,
    completedAt: null, failedAt: null, cancelledAt: null, completionSource: null, completedProgress: null,
  }};
};

export const startChallenge = (challenges = [], template, selectedReward, options = {}) => {
  const normalized = normalizeChallenges(challenges, options.now);
  const allowed = canStartChallenge(normalized, template?.id, options.now);
  if (!allowed.ok) return result(normalized, allowed);
  const created = createChallenge(template, selectedReward, options);
  return created.ok ? result([...normalized, created.challenge], { ok: true, challenge: created.challenge }) : result(normalized, created);
};

const transition = (challenges = [], challengeId, status, now = new Date()) => {
  const normalized = normalizeChallenges(challenges, now);
  const current = normalized.find((challenge) => challenge.id === challengeId);
  if (!current) return result(normalized, { ok: false, reason: 'not-found' });
  if (current.status !== ACTIVE_STATUS) return result(normalized, { ok: false, reason: 'not-active', challenge: current });
  const field = `${status}At`;
  const changed = { ...current, status, [field]: now.toISOString() };
  return result(normalized.map((challenge) => challenge.id === challengeId ? changed : challenge), { ok: true, challenge: changed });
};

export const completeChallenge = (challenges, challengeId, now) => transition(challenges, challengeId, 'completed', now);
export const failChallenge = (challenges, challengeId, now) => transition(challenges, challengeId, 'failed', now);
export const cancelChallenge = (challenges, challengeId, now) => transition(challenges, challengeId, 'cancelled', now);

export const normalizeChallenges = (challenges, now = new Date()) => {
  if (!Array.isArray(challenges)) return [];
  const ids = new Set();
  return challenges.flatMap((item) => {
    if (!item || typeof item.id !== 'string' || ids.has(item.id) || !TERMINAL_STATUSES.has(item.status) && item.status !== ACTIVE_STATUS || !isDateKey(item.startDate) || !isDateKey(item.endDate) || !item.goalId) return [];
    ids.add(item.id);
    const selectedReward = item.selectedReward;
    if (!selectedReward || typeof selectedReward !== 'object') return [];
    const status = isChallengeExpired(item, now) ? 'failed' : item.status;
    const failedAt = status === 'failed' ? (item.failedAt ?? now.toISOString()) : null;
    return [{
      ...item,
      status,
      rewardClaimed: Boolean(item.rewardClaimed),
      previousChallengeId: typeof item.previousChallengeId === 'string' ? item.previousChallengeId : null,
      completedAt: item.completedAt ?? null,
      failedAt,
      cancelledAt: item.cancelledAt ?? null,
      completionSource: item.completionSource === 'debug' ? 'debug' : null,
      completedProgress: Number.isFinite(item.completedProgress) && item.completedProgress >= 0 ? item.completedProgress : null,
    }];
  });
};
