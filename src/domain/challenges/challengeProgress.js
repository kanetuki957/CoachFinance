import { completeChallenge, normalizeChallenges } from './challengeManagement.js';

const pad = (value) => String(value).padStart(2, '0');
export const getLocalDateKey = (date = new Date()) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const isDateKey = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
const addDays = (dateKey, days) => { const date = new Date(`${dateKey}T00:00:00`); date.setDate(date.getDate() + days); return getLocalDateKey(date); };
const createId = () => `completion-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
const localIso = (date) => {
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const absoluteOffset = Math.abs(offset);
  return `${getLocalDateKey(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${String(date.getMilliseconds()).padStart(3, '0')}${sign}${pad(Math.floor(absoluteOffset / 60))}:${pad(absoluteOffset % 60)}`;
};
const challengeRecords = (challenge, completions = []) => (Array.isArray(completions) ? completions : [])
  .filter((completion) => completion?.challengeId === challenge?.id && completion.goalId === challenge?.goalId && completion.localDate >= challenge.startDate && completion.localDate <= challenge.endDate);

export const normalizeChallengeCompletions = (completions) => {
  if (!Array.isArray(completions)) return [];
  const ids = new Set();
  const sourceIds = new Set();
  return completions.flatMap((completion) => {
    if (!completion || typeof completion.id !== 'string' || ids.has(completion.id) || typeof completion.challengeId !== 'string' || typeof completion.goalId !== 'string' || !['checkbox', 'numeric'].includes(completion.recordType) || typeof completion.value !== 'number' || !Number.isFinite(completion.value) || completion.value <= 0 || !isDateKey(completion.localDate) || typeof completion.completedAt !== 'string') return [];
    if (completion.sourceId && (typeof completion.sourceId !== 'string' || sourceIds.has(completion.sourceId))) return [];
    ids.add(completion.id);
    if (completion.sourceId) sourceIds.add(completion.sourceId);
    return [{ ...completion, coinsEarned: Math.max(0, Number(completion.coinsEarned) || 0), statusEarned: Math.max(0, Number(completion.statusEarned) || 0), sourceId: completion.sourceId ?? null }];
  });
};

export const calculateCountProgress = (challenge, completions) => challengeRecords(challenge, completions).length;
export const calculateSumProgress = (challenge, completions) => challengeRecords(challenge, completions).reduce((total, completion) => total + completion.value, 0);
export const calculateStreakProgress = (challenge, completions, now = new Date()) => {
  const dates = new Set(challengeRecords(challenge, completions).map((completion) => completion.localDate));
  const lastEligibleDate = [challenge.endDate, getLocalDateKey(now)].sort()[0];
  let progress = 0;
  for (let date = challenge.startDate; date <= lastEligibleDate; date = addDays(date, 1)) {
    if (!dates.has(date)) break;
    progress += 1;
  }
  return progress;
};

export const calculateChallengeProgress = (challenge, completions, now = new Date()) => {
  if (!challenge) return 0;
  if (challenge.progressType === 'sum') return calculateSumProgress(challenge, completions);
  if (challenge.progressType === 'streak') return calculateStreakProgress(challenge, completions, now);
  return calculateCountProgress(challenge, completions);
};
export const getChallengeProgressPercent = (challenge, completions, now = new Date()) => {
  const target = Number(challenge?.targetValue) || 0;
  return target ? Math.min(100, Math.max(0, (calculateChallengeProgress(challenge, completions, now) / target) * 100)) : 0;
};
export const getChallengeRemaining = (challenge, completions, now = new Date()) => Math.max(0, (Number(challenge?.targetValue) || 0) - calculateChallengeProgress(challenge, completions, now));
export const isChallengeAchieved = (challenge, completions, now = new Date()) => calculateChallengeProgress(challenge, completions, now) >= (Number(challenge?.targetValue) || Infinity);

export const validateChallengeActivity = (challenge, completions, value, options = {}) => {
  const now = options.now ?? new Date();
  const localDate = options.localDate ?? getLocalDateKey(now);
  if (!challenge || challenge.status !== 'active') return { ok: false, reason: 'not-active' };
  if (!isDateKey(localDate) || localDate !== getLocalDateKey(now)) return { ok: false, reason: 'invalid-record-date' };
  if (localDate < challenge.startDate || localDate > challenge.endDate) return { ok: false, reason: 'outside-challenge-period' };
  if (options.id && normalizeChallengeCompletions(completions).some((completion) => completion.id === options.id)) return { ok: false, reason: 'duplicate-record' };
  if (options.sourceId && normalizeChallengeCompletions(completions).some((completion) => completion.sourceId === options.sourceId)) return { ok: false, reason: 'duplicate-record' };
  const today = challengeRecords(challenge, completions).filter((completion) => completion.localDate === localDate);
  if (challenge.recordType === 'checkbox') {
    if (value !== undefined && value !== null && value !== 1) return { ok: false, reason: 'invalid-checkbox-value' };
    if (today.length >= Math.min(challenge.maxPerDay ?? 1, 1)) return { ok: false, reason: 'max-per-day' };
    return { ok: true, value: 1, localDate, now };
  }
  if (challenge.recordType !== 'numeric' || typeof value !== 'number' || !Number.isFinite(value) || value <= 0 || !Number.isInteger(value)) return { ok: false, reason: 'invalid-numeric-value' };
  const todayTotal = today.reduce((total, completion) => total + completion.value, 0);
  if (challenge.maxPerDay !== null && todayTotal + value > challenge.maxPerDay) return { ok: false, reason: 'max-per-day' };
  return { ok: true, value, localDate, now };
};

export const createChallengeCompletion = (challenge, completions, value, options = {}) => {
  const validation = validateChallengeActivity(challenge, completions, value, options);
  if (!validation.ok) return validation;
  return { ok: true, completion: {
    id: options.id ?? createId(), challengeId: challenge.id, goalId: challenge.goalId,
    recordType: challenge.recordType, value: validation.value, unit: challenge.unit,
    completedAt: options.completedAt ?? localIso(validation.now), localDate: validation.localDate,
    coinsEarned: 0, statusEarned: 0, sourceId: options.sourceId ?? null,
  }};
};

/** Atomically returns the new record list and a completed challenge when eligible. */
export const recordChallengeActivity = (challenges, completions, challengeId, value, options = {}) => {
  const now = options.now ?? new Date();
  const normalizedChallenges = normalizeChallenges(challenges, now);
  const normalizedCompletions = normalizeChallengeCompletions(completions);
  const challenge = normalizedChallenges.find((item) => item.id === challengeId);
  const created = createChallengeCompletion(challenge, normalizedCompletions, value, { ...options, now });
  if (!created.ok) return { ok: false, reason: created.reason, challenges: normalizedChallenges, challengeCompletions: normalizedCompletions };
  const challengeCompletions = [...normalizedCompletions, created.completion];
  const progress = calculateChallengeProgress(challenge, challengeCompletions, now);
  const achieved = isChallengeAchieved(challenge, challengeCompletions, now);
  const transition = achieved ? completeChallenge(normalizedChallenges, challengeId, now) : { ok: true, challenges: normalizedChallenges, challenge };
  return { ok: true, challenges: transition.challenges, challengeCompletions, completion: created.completion, challenge: transition.challenge, progress, achieved };
};
