import { CHALLENGE_DIFFICULTY_REWARDS, STANDARD_TASK_REWARD, findChallengeTemplate } from './challengeCatalog.js';
import { normalizeGameState, STATUS_MAX } from '../game/gameProgress.js';
import { grantFurnitureReward } from '../shop/productInventory.js';
import { validateSelectedReward } from './challengeManagement.js';

const claimIdFor = (challengeId) => `challengeReward:${challengeId}`;
const isClaim = (claim) => claim && typeof claim.id === 'string' && typeof claim.challengeId === 'string';

export const normalizeChallengeRewardClaims = (claims) => {
  if (!Array.isArray(claims)) return [];
  const ids = new Set();
  return claims.flatMap((claim) => {
    if (!isClaim(claim) || ids.has(claim.id)) return [];
    ids.add(claim.id);
    return [{ ...claim }];
  });
};

const rewardAlreadyEarnedToday = (completions, goalId, localDate) =>
  completions.some((completion) => completion.goalId === goalId && completion.localDate === localDate && (completion.coinsEarned > 0 || completion.statusEarned > 0));

/** Applies at most one normal activity reward for a goal on a local calendar day. */
export const applyChallengeActivityReward = (game, challenge, completions, completion) => {
  const current = normalizeGameState(game);
  const template = findChallengeTemplate(challenge?.goalId);
  if (!template || !completion || rewardAlreadyEarnedToday(completions, challenge.goalId, completion.localDate)) {
    return { game: current, completion: { ...completion, coinsEarned: 0, statusEarned: 0 }, rewarded: false };
  }
  const statusType = template.category;
  const statusEarned = Math.min(STANDARD_TASK_REWARD.statusReward ?? 5, Math.max(0, STATUS_MAX - current[statusType]));
  const coinsEarned = STANDARD_TASK_REWARD.coins;
  return {
    game: { ...current, money: current.money + coinsEarned, [statusType]: current[statusType] + statusEarned },
    completion: { ...completion, coinsEarned, statusEarned },
    rewarded: true,
  };
};

/** Claims exactly one already-selected completion reward without shop spending. */
export const claimChallengeCompletionReward = (game, challenges, claims, challengeId, now = new Date()) => {
  const challenge = challenges.find((item) => item.id === challengeId);
  const normalizedClaims = normalizeChallengeRewardClaims(claims);
  const claimId = claimIdFor(challengeId);
  if (!challenge || challenge.status !== 'completed') return { ok: false, reason: 'not-completed', game, challenges, claims: normalizedClaims };
  if (challenge.rewardClaimed || normalizedClaims.some((claim) => claim.id === claimId)) return { ok: false, reason: 'already-claimed', game, challenges, claims: normalizedClaims };
  const template = findChallengeTemplate(challenge.goalId);
  const reward = validateSelectedReward(template, challenge.selectedReward);
  if (!reward.ok) return { ok: false, reason: reward.reason, game, challenges, claims: normalizedClaims };
  let nextGame = normalizeGameState(game);
  if (reward.reward.type === 'coins') nextGame = { ...nextGame, money: nextGame.money + reward.reward.amount };
  else {
    const furniture = grantFurnitureReward(nextGame, reward.reward.productId, reward.reward.quantity);
    if (!furniture.ok) return { ok: false, reason: furniture.reason, game, challenges, claims: normalizedClaims };
    nextGame = normalizeGameState(furniture.game);
  }
  const claimedChallenge = { ...challenge, rewardClaimed: true };
  const claim = { id: claimId, challengeId, reward: reward.reward, claimedAt: now.toISOString() };
  return {
    ok: true,
    game: nextGame,
    challenges: challenges.map((item) => item.id === challengeId ? claimedChallenge : item),
    claims: [...normalizedClaims, claim],
    claim,
  };
};

export const getChallengeRewardClaimId = claimIdFor;
