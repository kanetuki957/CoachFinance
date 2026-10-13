import test from 'node:test';
import assert from 'node:assert/strict';
import { findChallengeTemplate } from './challengeCatalog.js';
import { cancelChallenge, startChallenge } from './challengeManagement.js';
import { calculateChallengeProgress, getChallengeProgressPercent, getChallengeRemaining, recordChallengeActivity } from './challengeProgress.js';

const at = (day) => new Date(`2026-10-${String(day).padStart(2, '0')}T12:00:00`);
const reward = (goalId) => ({ type: 'coins', amount: ({ easy: 50, normal: 150, hard: 300 })[findChallengeTemplate(goalId).difficulty] });
const begin = (goalId, day = 14) => startChallenge([], findChallengeTemplate(goalId), reward(goalId), { now: at(day) }).challenge;
const record = (challenge, completions, value, day = 14, options = {}) => recordChallengeActivity([challenge], completions, challenge.id, value, { now: at(day), ...options });

test('checkbox records once per day and count completion is immediate', () => {
  const challenge = begin('study-new');
  const first = record(challenge, [], undefined, 14);
  assert.equal(first.ok, true);
  assert.equal(first.completion.value, 1);
  assert.equal(first.challenge.status, 'completed');
  assert.equal(record(first.challenge, first.challengeCompletions, undefined, 14).reason, 'not-active');
});

test('checkbox duplicate is rejected before the target is reached', () => {
  const challenge = begin('life-cleaning');
  const first = record(challenge, [], 1, 14);
  assert.equal(first.ok, true);
  assert.equal(record(challenge, first.challengeCompletions, 1, 14).reason, 'max-per-day');
});

test('numeric records sum actual activity, reject invalid input, and complete above target', () => {
  const challenge = begin('exercise-run');
  assert.equal(record(challenge, [], '20').reason, 'invalid-numeric-value');
  assert.equal(record(challenge, [], 1.5).reason, 'invalid-numeric-value');
  const first = record(challenge, [], 90);
  const second = record(first.challenge, first.challengeCompletions, 20);
  assert.equal(second.ok, true);
  assert.equal(second.challenge.status, 'completed');
  assert.equal(calculateChallengeProgress(challenge, second.challengeCompletions, at(14)), 110);
  assert.equal(getChallengeProgressPercent(challenge, second.challengeCompletions, at(14)), 100);
  assert.equal(getChallengeRemaining(challenge, second.challengeCompletions, at(14)), 0);
  const restarted = startChallenge(second.challenges, findChallengeTemplate('exercise-run'), reward('exercise-run'), { now: at(14) });
  assert.equal(restarted.ok, true);
});

test('numeric maxPerDay is enforced and date bounds reject records', () => {
  const challenge = begin('study-30-minutes');
  const first = record(challenge, [], 20);
  assert.equal(record(challenge, first.challengeCompletions, 20).reason, 'max-per-day');
  assert.equal(record(challenge, [], 10, 13).reason, 'outside-challenge-period');
});

test('streak counts only uninterrupted dates from start and detects a gap', () => {
  const challenge = begin('life-cleaning');
  const dayOne = record(challenge, [], 1, 14);
  const dayThree = record(challenge, dayOne.challengeCompletions, 1, 16);
  assert.equal(calculateChallengeProgress(challenge, dayThree.challengeCompletions, at(16)), 1);
  const continuous = begin('life-cleaning');
  const a = record(continuous, [], 1, 14);
  const b = record(continuous, a.challengeCompletions, 1, 15);
  assert.equal(calculateChallengeProgress(continuous, b.challengeCompletions, at(15)), 2);
});

test('cancelled and completed challenges reject additional records and source records cannot be reused', () => {
  const challenge = begin('exercise-run');
  const cancelled = cancelChallenge([challenge], challenge.id, at(14));
  assert.equal(record(cancelled.challenge, [], 10).reason, 'not-active');
  const first = begin('exercise-run');
  const saved = record(first, [], 10, 14, { sourceId: 'source-1' });
  const other = begin('exercise-training');
  assert.equal(record(other, saved.challengeCompletions, 10, 14, { sourceId: 'source-1' }).reason, 'duplicate-record');
});
