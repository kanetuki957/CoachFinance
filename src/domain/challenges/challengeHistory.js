import { findChallengeTemplate } from './challengeCatalog.js';
import { calculateChallengeProgress, getChallengeProgressPercent } from './challengeProgress.js';

export const HISTORY_CATEGORIES = Object.freeze([
  Object.freeze({ id: 'strength', label: '筋トレ' }),
  Object.freeze({ id: 'knowledge', label: '勉強' }),
  Object.freeze({ id: 'wealth', label: '生活習慣' }),
]);

const terminalStatuses = new Set(['completed', 'failed', 'cancelled']);
const isDateKey = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
const todayKey = (now = new Date()) => `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
const asArray = (value) => Array.isArray(value) ? value : [];
const isChallenge = (challenge) => typeof challenge?.id === 'string'
  && typeof challenge?.goalId === 'string'
  && isDateKey(challenge.startDate)
  && isDateKey(challenge.endDate)
  && Boolean(findChallengeTemplate(challenge.goalId));
const validChallenges = (challenges, { includeDebug = false } = {}) => asArray(challenges)
  .filter(isChallenge)
  .filter((challenge) => includeDebug || challenge.completionSource !== 'debug');
const uniqueRecords = (completions) => {
  const ids = new Set();
  return asArray(completions).filter((record) => {
    if (!record || typeof record.id !== 'string' || ids.has(record.id) || typeof record.challengeId !== 'string' || !isDateKey(record.localDate)) return false;
    ids.add(record.id);
    return true;
  });
};
const recordsFor = (challengeId, completions) => uniqueRecords(completions).filter((record) => record.challengeId === challengeId);
const endedAt = (challenge) => challenge.completedAt ?? challenge.failedAt ?? challenge.cancelledAt ?? null;
const numeric = (value) => Number.isFinite(value) ? value : 0;

const historyItem = (challenge, completions, claims, now) => {
  const template = findChallengeTemplate(challenge.goalId);
  const records = recordsFor(challenge.id, completions);
  const actualProgress = calculateChallengeProgress(challenge, records, now);
  const debug = challenge.completionSource === 'debug';
  const progress = debug && Number.isFinite(challenge.completedProgress) ? challenge.completedProgress : actualProgress;
  const progressPercent = debug ? 100 : getChallengeProgressPercent(challenge, records, now);
  const claim = asArray(claims).find((item) => item?.challengeId === challenge.id && item?.id === `challengeReward:${challenge.id}`) ?? null;
  return {
    challenge,
    template,
    category: template.category,
    records,
    progress,
    progressPercent,
    endedAt: endedAt(challenge),
    rewardClaim: claim,
    rewardClaimed: Boolean(claim),
    debug,
  };
};

export const getChallengeSummary = (challenges, completions, claims, now = new Date()) => {
  const visibleChallenges = validChallenges(challenges);
  const challengeMap = new Map(visibleChallenges.map((challenge) => [challenge.id, challenge]));
  const ended = visibleChallenges.filter((challenge) => terminalStatuses.has(challenge.status));
  const counts = Object.fromEntries(['completed', 'failed', 'cancelled'].map((status) => [status, ended.filter((challenge) => challenge.status === status).length]));
  const records = uniqueRecords(completions).filter((record) => challengeMap.has(record.challengeId));
  const recordCoins = records.reduce((total, record) => total + Math.max(0, numeric(record.coinsEarned)), 0);
  const claimedChallengeIds = new Set();
  const rewardCoins = asArray(claims).reduce((total, claim) => {
    const challenge = challengeMap.get(claim?.challengeId);
    if (!challenge || claimedChallengeIds.has(challenge.id) || claim?.id !== `challengeReward:${challenge.id}` || claim?.reward?.type !== 'coins') return total;
    claimedChallengeIds.add(challenge.id);
    return total + Math.max(0, numeric(claim.reward.amount));
  }, 0);
  return {
    totalChallenges: visibleChallenges.length,
    completed: counts.completed,
    failed: counts.failed,
    cancelled: counts.cancelled,
    endedChallenges: ended.length,
    completionRate: ended.length ? (counts.completed / ended.length) * 100 : null,
    earnedCoins: recordCoins + rewardCoins,
    activityDays: new Set(records.map((record) => record.localDate)).size,
  };
};

export const getCategoryStatistics = (challenges, completions, now = new Date()) => {
  const visibleChallenges = validChallenges(challenges);
  return HISTORY_CATEGORIES.map(({ id, label }) => {
    const categoryChallenges = visibleChallenges.filter((challenge) => findChallengeTemplate(challenge.goalId)?.category === id);
    const ids = new Set(categoryChallenges.map((challenge) => challenge.id));
    const ended = categoryChallenges.filter((challenge) => terminalStatuses.has(challenge.status));
    const completed = ended.filter((challenge) => challenge.status === 'completed').length;
    return {
      id,
      label,
      challenges: categoryChallenges.length,
      completed,
      completionRate: ended.length ? (completed / ended.length) * 100 : null,
      activityRecords: uniqueRecords(completions).filter((record) => ids.has(record.challengeId)).length,
      active: categoryChallenges.filter((challenge) => challenge.status === 'active').length,
      now,
    };
  });
};

export const getDailyActivity = (challenges, completions, now = new Date()) => {
  const challengeMap = new Map(validChallenges(challenges).map((challenge) => [challenge.id, challenge]));
  const latest = todayKey(now);
  const activity = new Map();
  uniqueRecords(completions).forEach((record) => {
    const challenge = challengeMap.get(record.challengeId);
    if (!challenge || record.localDate > latest) return;
    const template = findChallengeTemplate(challenge.goalId);
    const current = activity.get(record.localDate) ?? { date: record.localDate, count: 0, challengeNames: [], records: [] };
    current.count += 1;
    if (template && !current.challengeNames.includes(template.title)) current.challengeNames.push(template.title);
    current.records.push(record);
    activity.set(record.localDate, current);
  });
  return [...activity.values()].sort((left, right) => left.date.localeCompare(right.date));
};

export const getChallengeHistory = (challenges, completions, claims, options = {}) => {
  const { status = 'all', now = new Date(), includeDebug = true } = options;
  return validChallenges(challenges, { includeDebug })
    .filter((challenge) => terminalStatuses.has(challenge.status))
    .filter((challenge) => status === 'all' || challenge.status === status)
    .map((challenge) => historyItem(challenge, completions, claims, now))
    .sort((left, right) => String(right.endedAt ?? right.challenge.endDate).localeCompare(String(left.endedAt ?? left.challenge.endDate)));
};

export const getChallengeHistoryDetail = (challengeId, challenges, completions, claims, now = new Date()) => {
  const challenge = validChallenges(challenges, { includeDebug: true }).find((item) => item.id === challengeId);
  if (!challenge) return null;
  const detail = historyItem(challenge, completions, claims, now);
  const previousChallenge = challenge.previousChallengeId
    ? validChallenges(challenges, { includeDebug: true }).find((item) => item.id === challenge.previousChallengeId) ?? null
    : null;
  const retries = validChallenges(challenges, { includeDebug: true }).filter((item) => item.previousChallengeId === challenge.id);
  return {
    ...detail,
    records: [...detail.records].sort((left, right) => `${right.localDate}${right.completedAt}`.localeCompare(`${left.localDate}${left.completedAt}`)),
    previousChallenge,
    retries,
  };
};
