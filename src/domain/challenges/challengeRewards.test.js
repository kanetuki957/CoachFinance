import test from 'node:test';
import assert from 'node:assert/strict';
import { findChallengeTemplate } from './challengeCatalog.js';
import { startChallenge } from './challengeManagement.js';
import { applyChallengeActivityReward, claimChallengeCompletionReward, completeAndClaimChallengeReward, reconcileChallengeRewardClaims } from './challengeRewards.js';

const now = new Date('2026-10-14T12:00:00');
const moneyReward = (goalId) => ({ type: 'coins', amount: ({ easy: 50, normal: 150, hard: 300 })[findChallengeTemplate(goalId).difficulty] });
const makeChallenge = (goalId, selectedReward = moneyReward(goalId)) => startChallenge([], findChallengeTemplate(goalId), selectedReward, { now }).challenge;
const completion = (challenge, id, date = '2026-10-14') => ({ id, challengeId: challenge.id, goalId: challenge.goalId, recordType: challenge.recordType, value: 1, unit: challenge.unit, completedAt: now.toISOString(), localDate: date, coinsEarned: 0, statusEarned: 0 });

test('normal activity reward pays 50 coins and category status once per goal per day', () => {
  const challenge = makeChallenge('exercise-run');
  const first = applyChallengeActivityReward({ money: 0, strength: 0 }, challenge, [], completion(challenge, 'a'));
  assert.equal(first.game.money, 50);
  assert.equal(first.game.strength, 5);
  const second = applyChallengeActivityReward(first.game, challenge, [first.completion], completion(challenge, 'b'));
  assert.equal(second.completion.coinsEarned, 0);
  assert.equal(second.game.money, 50);
  const tomorrow = applyChallengeActivityReward(second.game, challenge, [first.completion, second.completion], completion(challenge, 'c', '2026-10-15'));
  assert.equal(tomorrow.game.money, 100);
});

test('normal activity status reward respects the 100 cap and survives another challenge id', () => {
  const challenge = makeChallenge('study-pages');
  const first = applyChallengeActivityReward({ money: 0, knowledge: 98 }, challenge, [], completion(challenge, 'a'));
  assert.equal(first.game.knowledge, 100);
  const retry = { ...challenge, id: 'retry-id' };
  const retryReward = applyChallengeActivityReward(first.game, retry, [first.completion], completion(retry, 'b'));
  assert.equal(retryReward.game.money, 50);
  assert.equal(retryReward.completion.coinsEarned, 0);
});

test('coin completion reward is claimed once and never grants furniture', () => {
  const base = makeChallenge('exercise-run');
  const challenge = { ...base, status: 'completed' };
  const first = claimChallengeCompletionReward({ money: 20 }, [challenge], [], challenge.id, now);
  assert.equal(first.ok, true);
  assert.equal(first.game.money, 320);
  assert.equal(first.challenges[0].rewardClaimed, true);
  assert.equal(first.claims[0].id, `challengeReward:${challenge.id}`);
  assert.equal(claimChallengeCompletionReward(first.game, first.challenges, first.claims, challenge.id, now).reason, 'already-claimed');
});

test('furniture completion reward grants one item for free and preserves placed furniture', () => {
  const base = makeChallenge('study-new', { type: 'furniture', productId: 'poco_cushion_001', quantity: 1, priceAtSelection: 80 });
  const challenge = { ...base, status: 'completed' };
  const game = { money: 999, ownedFurniture: [{ furnitureId: 'poco_cushion_001', quantity: 1 }], ownedProducts: [{ productId: 'poco_cushion_001', quantity: 1 }], placedFurniture: [{ instanceId: 'placed', furnitureId: 'poco_cushion_001', gridX: 0, gridY: 0 }] };
  const claimed = claimChallengeCompletionReward(game, [challenge], [], challenge.id, now);
  assert.equal(claimed.ok, true);
  assert.equal(claimed.game.money, 999);
  assert.equal(claimed.game.ownedFurniture[0].quantity, 2);
  assert.equal(claimed.game.ownedProducts[0].quantity, 2);
  assert.equal(claimed.game.placedFurniture.length, 1);
});

test('invalid furniture rewards and non-completed challenges cannot claim rewards', () => {
  const active = { ...makeChallenge('study-new'), selectedReward: { type: 'furniture', productId: 'missing', quantity: 1, priceAtSelection: 1 } };
  assert.equal(claimChallengeCompletionReward({}, [active], [], active.id, now).reason, 'not-completed');
  const invalidCompleted = { ...active, status: 'completed' };
  assert.equal(claimChallengeCompletionReward({}, [invalidCompleted], [], invalidCompleted.id, now).ok, false);
});

test('debug completion claims only the selected reward without creating activity rewards or records', () => {
  const challenge = makeChallenge('exercise-run');
  const completed = completeAndClaimChallengeReward(
    { money: 20, strength: 10 },
    [challenge],
    [],
    challenge.id,
    { now, completionSource: 'debug', completedProgress: challenge.targetValue },
  );
  assert.equal(completed.ok, true);
  assert.equal(completed.game.money, 320);
  assert.equal(completed.game.strength, 10);
  assert.equal(completed.challenge.status, 'completed');
  assert.equal(completed.challenge.completionSource, 'debug');
  assert.equal(completed.challenge.completedProgress, challenge.targetValue);
  assert.equal(completed.claims.length, 1);
  const repeat = completeAndClaimChallengeReward(completed.game, completed.challenges, completed.claims, challenge.id, { now, completionSource: 'debug' });
  assert.equal(repeat.ok, false);
  assert.equal(repeat.game.money, 320);
});

test('debug completion grants the selected furniture once without changing placed furniture', () => {
  const challenge = makeChallenge('study-new', { type: 'furniture', productId: 'poco_cushion_001', quantity: 1, priceAtSelection: 80 });
  const game = { money: 10, ownedFurniture: [{ furnitureId: 'poco_cushion_001', quantity: 1 }], ownedProducts: [{ productId: 'poco_cushion_001', quantity: 1 }], placedFurniture: [{ instanceId: 'placed', furnitureId: 'poco_cushion_001', gridX: 0, gridY: 0 }] };
  const completed = completeAndClaimChallengeReward(game, [challenge], [], challenge.id, { now, completionSource: 'debug', completedProgress: challenge.targetValue });
  assert.equal(completed.ok, true);
  assert.equal(completed.game.money, 10);
  assert.equal(completed.game.ownedFurniture.find((item) => item.furnitureId === 'poco_cushion_001')?.quantity, 2);
  assert.equal(completed.game.placedFurniture.length, 1);
});

test('debug completion handles a streak template without inserting dated activity records', () => {
  const challenge = makeChallenge('life-cleaning');
  const completed = completeAndClaimChallengeReward({}, [challenge], [], challenge.id, {
    now,
    completionSource: 'debug',
    completedProgress: challenge.targetValue,
  });
  assert.equal(challenge.progressType, 'streak');
  assert.equal(completed.ok, true);
  assert.equal(completed.challenge.status, 'completed');
  assert.equal(completed.challenge.completedProgress, 7);
  assert.equal(completed.claims.length, 1);
});

test('a durable reward claim repairs only a missing rewardClaimed flag and never grants again', () => {
  const challenge = { ...makeChallenge('exercise-run'), status: 'completed', rewardClaimed: false };
  const claims = [{ id: `challengeReward:${challenge.id}`, challengeId: challenge.id, reward: { type: 'coins', amount: 300 }, claimedAt: now.toISOString() }];
  const reconciled = reconcileChallengeRewardClaims([challenge], claims);
  assert.equal(reconciled[0].rewardClaimed, true);
  const repeated = claimChallengeCompletionReward({ money: 100 }, reconciled, claims, challenge.id, now);
  assert.equal(repeated.reason, 'already-claimed');
  assert.equal(repeated.game.money, 100);
  const missingClaim = reconcileChallengeRewardClaims([{ ...challenge, rewardClaimed: true }], []);
  assert.equal(missingClaim[0].rewardClaimed, true);
});
