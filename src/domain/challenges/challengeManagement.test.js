import test from 'node:test';
import assert from 'node:assert/strict';
import { CHALLENGE_TEMPLATES, findChallengeTemplate } from './challengeCatalog.js';
import { MAX_ACTIVE_CHALLENGES, cancelChallenge, completeChallenge, failChallenge, normalizeChallenges, startChallenge } from './challengeManagement.js';

const now = new Date('2026-10-14T12:00:00');
const coinsFor = (goalId) => {
  const difficulty = findChallengeTemplate(goalId).difficulty;
  return { type: 'coins', amount: ({ easy: 50, normal: 150, hard: 300 })[difficulty] };
};
const start = (items, goalId) => startChallenge(items, findChallengeTemplate(goalId), coinsFor(goalId), { now });

test('starts a challenge and retains immutable reward selection', () => {
  const outcome = start([], 'exercise-run');
  assert.equal(outcome.ok, true);
  assert.equal(outcome.challenges.length, 1);
  assert.equal(outcome.challenge.endDate, '2026-10-20');
  assert.deepEqual(outcome.challenge.selectedReward, { type: 'coins', amount: 300 });
});

test('allows three active challenges, rejects a fourth and duplicate goals', () => {
  const first = start([], 'exercise-run');
  assert.equal(start(first.challenges, 'exercise-run').reason, 'duplicate-active-goal');
  const second = start(first.challenges, 'exercise-training');
  const third = start(second.challenges, 'study-vocabulary');
  assert.equal(third.challenges.length, MAX_ACTIVE_CHALLENGES);
  assert.equal(start(third.challenges, 'life-sns').reason, 'max-active-challenges');
});

test('cancelled and failed challenges free a slot, preserve history, and can be retried with a new id', () => {
  const initial = start([], 'exercise-run');
  const cancelled = cancelChallenge(initial.challenges, initial.challenge.id, now);
  assert.equal(cancelled.challenge.status, 'cancelled');
  const retry = startChallenge(cancelled.challenges, findChallengeTemplate('exercise-run'), coinsFor('exercise-run'), { now, previousChallengeId: cancelled.challenge.id });
  assert.equal(retry.ok, true);
  assert.notEqual(retry.challenge.id, cancelled.challenge.id);
  assert.equal(retry.challenge.previousChallengeId, cancelled.challenge.id);
  const failed = failChallenge(retry.challenges, retry.challenge.id, now);
  assert.equal(failed.challenge.status, 'failed');
  assert.equal(failed.challenges.length, 2);
});

test('terminal challenges cannot be resumed or changed', () => {
  const initial = start([], 'study-vocabulary');
  const completed = completeChallenge(initial.challenges, initial.challenge.id, now);
  const repeated = completeChallenge(completed.challenges, initial.challenge.id, now);
  assert.equal(completed.challenge.status, 'completed');
  assert.equal(repeated.ok, false);
  assert.equal(repeated.reason, 'not-active');
});

test('rejects invalid rewards and safely normalizes bad persisted data', () => {
  const template = findChallengeTemplate('exercise-run');
  assert.equal(startChallenge([], template, { type: 'coins', amount: 50 }, { now }).ok, false);
  const valid = start([], 'exercise-run').challenge;
  assert.deepEqual(normalizeChallenges([valid, { id: 'bad' }], now), [valid]);
});

test('catalogue still contains all supported challenge templates', () => {
  assert.equal(CHALLENGE_TEMPLATES.length, 15);
});

test('local calendar boundaries retain the end date and expire on the following day across year and leap-year boundaries', () => {
  const yearEnd = new Date(2026, 11, 31, 23, 59, 0);
  const yearChallenge = startChallenge([], findChallengeTemplate('exercise-run'), coinsFor('exercise-run'), { now: yearEnd }).challenge;
  assert.equal(yearChallenge.startDate, '2026-12-31');
  assert.equal(yearChallenge.endDate, '2027-01-06');
  assert.equal(normalizeChallenges([yearChallenge], new Date(2027, 0, 6, 23, 59, 59))[0].status, 'active');
  assert.equal(normalizeChallenges([yearChallenge], new Date(2027, 0, 7, 0, 0, 0))[0].status, 'failed');

  const leapStart = new Date(2028, 1, 27, 12, 0, 0);
  const leapChallenge = startChallenge([], findChallengeTemplate('life-cleaning'), coinsFor('life-cleaning'), { now: leapStart }).challenge;
  assert.equal(leapChallenge.endDate, '2028-03-04');
  assert.equal(normalizeChallenges([leapChallenge], new Date(2028, 2, 4, 23, 59, 59))[0].status, 'active');
  assert.equal(normalizeChallenges([leapChallenge], new Date(2028, 2, 5, 0, 0, 0))[0].status, 'failed');
});
