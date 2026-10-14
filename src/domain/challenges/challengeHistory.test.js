import test from 'node:test';
import assert from 'node:assert/strict';
import { findChallengeTemplate } from './challengeCatalog.js';
import { startChallenge } from './challengeManagement.js';
import { getCategoryStatistics, getChallengeHistory, getChallengeHistoryDetail, getChallengeSummary, getDailyActivity } from './challengeHistory.js';

const now = new Date('2026-10-15T12:00:00');
const rewardFor = (goalId) => ({ type: 'coins', amount: ({ easy: 50, normal: 150, hard: 300 })[findChallengeTemplate(goalId).difficulty] });
const challengeFor = (goalId) => startChallenge([], findChallengeTemplate(goalId), rewardFor(goalId), { now }).challenge;
const completion = (challenge, id, date, value, coinsEarned = 0) => ({ id, challengeId: challenge.id, goalId: challenge.goalId, recordType: challenge.recordType, value, unit: challenge.unit, completedAt: `${date}T12:00:00.000+09:00`, localDate: date, coinsEarned, statusEarned: coinsEarned ? 5 : 0 });

const fixture = () => {
  const completed = { ...challengeFor('exercise-run'), status: 'completed', completedAt: '2026-10-14T12:00:00.000+09:00' };
  const failed = { ...challengeFor('study-pages'), status: 'failed', failedAt: '2026-10-13T00:00:00.000+09:00', previousChallengeId: completed.id };
  const cancelled = { ...challengeFor('life-cleaning'), status: 'cancelled', cancelledAt: '2026-10-12T00:00:00.000+09:00' };
  const active = challengeFor('exercise-training');
  const debug = { ...challengeFor('study-new'), status: 'completed', completedAt: '2026-10-15T12:00:00.000+09:00', completionSource: 'debug', completedProgress: 1, rewardClaimed: true };
  return {
    challenges: [completed, failed, cancelled, active, debug],
    completions: [completion(completed, 'record-1', '2026-10-14', 20, 50), completion(completed, 'record-2', '2026-10-14', 30), completion(failed, 'record-3', '2026-10-13', 5, 50)],
    claims: [
      { id: `challengeReward:${completed.id}`, challengeId: completed.id, reward: { type: 'coins', amount: 300 }, claimedAt: completed.completedAt },
      { id: `challengeReward:${debug.id}`, challengeId: debug.id, reward: { type: 'coins', amount: 50 }, claimedAt: debug.completedAt },
    ],
    completed,
    failed,
    debug,
  };
};

test('challenge summary counts retries as instances, excludes active from rate, and excludes debug rewards', () => {
  const { challenges, completions, claims } = fixture();
  const summary = getChallengeSummary(challenges, completions, claims, now);
  assert.equal(summary.totalChallenges, 4);
  assert.equal(summary.completed, 1);
  assert.equal(summary.failed, 1);
  assert.equal(summary.cancelled, 1);
  assert.equal(summary.endedChallenges, 3);
  assert.equal(Math.round(summary.completionRate), 33);
  assert.equal(summary.earnedCoins, 400);
  assert.equal(summary.activityDays, 2);
  assert.equal(getChallengeSummary([], [], [], now).completionRate, null);
});

test('category statistics use template categories and count activity events', () => {
  const { challenges, completions } = fixture();
  const statistics = getCategoryStatistics(challenges, completions, now);
  assert.deepEqual(statistics.map((item) => [item.id, item.challenges, item.completed, item.activityRecords]), [
    ['strength', 2, 1, 2],
    ['knowledge', 1, 0, 1],
    ['wealth', 1, 0, 0],
  ]);
});

test('daily activity preserves localDate, groups same-day events, and excludes future and debug data', () => {
  const { challenges, completions, debug } = fixture();
  const activity = getDailyActivity(challenges, [...completions, completion(debug, 'debug-record', '2026-10-15', 1, 0), completion(challenges[0], 'future-record', '2026-10-16', 1, 0)], now);
  assert.deepEqual(activity.map((item) => [item.date, item.count]), [['2026-10-13', 1], ['2026-10-14', 2]]);
  assert.equal(activity[1].challengeNames[0], findChallengeTemplate('exercise-run').title);
});

test('history filters terminal status and exposes records, claims, and retry relationships', () => {
  const { challenges, completions, claims, completed, failed, debug } = fixture();
  const failedHistory = getChallengeHistory(challenges, completions, claims, { status: 'failed', now });
  assert.equal(failedHistory.length, 1);
  assert.equal(failedHistory[0].challenge.id, failed.id);
  const detail = getChallengeHistoryDetail(failed.id, challenges, completions, claims, now);
  assert.equal(detail.records[0].value, 5);
  assert.equal(detail.previousChallenge.id, completed.id);
  assert.equal(getChallengeHistory(challenges, completions, claims, { now }).some((item) => item.challenge.id === debug.id), true);
  assert.equal(getChallengeHistory(challenges, completions, claims, { now, includeDebug: false }).some((item) => item.challenge.id === debug.id), false);
});

test('history aggregation safely ignores incomplete legacy or malformed data', () => {
  assert.deepEqual(getChallengeSummary([{ id: 'incomplete', goalId: 'exercise-run' }, null], [{ id: 'bad' }], [{ id: 'bad' }], now), {
    totalChallenges: 0,
    completed: 0,
    failed: 0,
    cancelled: 0,
    endedChallenges: 0,
    completionRate: null,
    earnedCoins: 0,
    activityDays: 0,
  });
  assert.deepEqual(getDailyActivity([{ id: 'incomplete', goalId: 'exercise-run' }], [], now), []);
});
