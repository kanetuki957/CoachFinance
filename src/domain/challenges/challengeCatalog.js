/** Challenge templates and static reward configuration (no React dependency). */
export const CHALLENGE_DIFFICULTY_REWARDS = Object.freeze({
  EASY: Object.freeze({ bonusCoins: 50, furniturePriceLimit: 100 }),
  NORMAL: Object.freeze({ bonusCoins: 150, furniturePriceLimit: 300 }),
  HARD: Object.freeze({ bonusCoins: 300, furniturePriceLimit: 500 }),
});

// Configuration only. Existing goal/task rewards remain unchanged.
export const STANDARD_TASK_REWARD = Object.freeze({ coins: 50, cadence: 'per-day', scope: 'same-goal' });

export const CHALLENGE_TEMPLATES = Object.freeze([
  Object.freeze({ id: 'exercise-10-minutes', title: '毎日10分だけ運動する', category: 'strength', difficulty: 'easy', durationDays: 7, recordType: 'checkbox', progressType: 'streak', targetValue: 7, unit: 'days', maxPerDay: 1 }),
  Object.freeze({ id: 'exercise-stretch', title: '1週間だけ筋トレする', category: 'strength', difficulty: 'normal', durationDays: 7, recordType: 'checkbox', progressType: 'streak', targetValue: 7, unit: 'days', maxPerDay: 1 }),
  Object.freeze({ id: 'exercise-run', title: '1週間で腕立て伏せを合計100回する', category: 'strength', difficulty: 'hard', durationDays: 7, recordType: 'numeric', progressType: 'sum', targetValue: 100, unit: 'reps', maxPerDay: null }),
  Object.freeze({ id: 'exercise-steps', title: '毎日5,000歩以上歩く', category: 'strength', difficulty: 'normal', durationDays: 7, recordType: 'checkbox', progressType: 'streak', targetValue: 7, unit: 'days', maxPerDay: 1 }),
  Object.freeze({ id: 'exercise-training', title: '1週間で腹筋を合計100回する', category: 'strength', difficulty: 'hard', durationDays: 7, recordType: 'numeric', progressType: 'sum', targetValue: 100, unit: 'reps', maxPerDay: null }),
  Object.freeze({ id: 'study-30-minutes', title: '毎日30分勉強して、1週間で3時間以上勉強する', category: 'knowledge', difficulty: 'normal', durationDays: 7, recordType: 'numeric', progressType: 'sum', targetValue: 150, unit: 'minutes', maxPerDay: 30 }),
  Object.freeze({ id: 'study-pages', title: '参考書を10ページ進める', category: 'knowledge', difficulty: 'easy', durationDays: 7, recordType: 'numeric', progressType: 'sum', targetValue: 10, unit: 'pages', maxPerDay: null }),
  Object.freeze({ id: 'study-programming', title: 'プログラミングを毎日30分、1週間続ける', category: 'knowledge', difficulty: 'normal', durationDays: 7, recordType: 'checkbox', progressType: 'streak', targetValue: 7, unit: 'days', maxPerDay: 1 }),
  Object.freeze({ id: 'study-vocabulary', title: '資格の問題を50問解く', category: 'knowledge', difficulty: 'hard', durationDays: 7, recordType: 'numeric', progressType: 'sum', targetValue: 50, unit: 'questions', maxPerDay: null }),
  Object.freeze({ id: 'study-new', title: '新しい知識を1つ身につける', category: 'knowledge', difficulty: 'easy', durationDays: 7, recordType: 'checkbox', progressType: 'count', targetValue: 1, unit: 'times', maxPerDay: 1 }),
  Object.freeze({ id: 'life-morning', title: '毎朝決めた時間に起きる', category: 'wealth', difficulty: 'normal', durationDays: 7, recordType: 'checkbox', progressType: 'streak', targetValue: 7, unit: 'days', maxPerDay: 1 }),
  Object.freeze({ id: 'life-cleaning', title: '寝る前に5分だけ部屋を片付ける', category: 'wealth', difficulty: 'easy', durationDays: 7, recordType: 'checkbox', progressType: 'streak', targetValue: 7, unit: 'days', maxPerDay: 1 }),
  Object.freeze({ id: 'life-gratitude', title: '1日1回、感謝したことを記録する', category: 'wealth', difficulty: 'easy', durationDays: 7, recordType: 'checkbox', progressType: 'streak', targetValue: 7, unit: 'days', maxPerDay: 1 }),
  Object.freeze({ id: 'life-water', title: '水を1日1.5リットル飲む', category: 'wealth', difficulty: 'normal', durationDays: 7, recordType: 'checkbox', progressType: 'streak', targetValue: 7, unit: 'days', maxPerDay: 1 }),
  Object.freeze({ id: 'life-sns', title: 'SNSを見ない時間を1時間つくる', category: 'wealth', difficulty: 'hard', durationDays: 7, recordType: 'checkbox', progressType: 'streak', targetValue: 7, unit: 'days', maxPerDay: 1 }),
]);

const VALID_DIFFICULTIES = new Set(['easy', 'normal', 'hard']);
const VALID_RECORD_TYPES = new Set(['checkbox', 'numeric']);
const VALID_PROGRESS_TYPES = new Set(['count', 'sum', 'streak']);

export const findChallengeTemplate = (goalId, templates = CHALLENGE_TEMPLATES) => templates.find((template) => template.id === goalId) ?? null;

/** Returns all catalogue errors; goalCategories is optional for isolated domain use. */
export const validateChallengeTemplates = (templates = CHALLENGE_TEMPLATES, goalCategories) => {
  const errors = [];
  const ids = new Set();
  const goals = goalCategories ? new Map(goalCategories.flatMap((category) => category.goals.map((goal) => [goal.id, { title: goal.title, category: category.statusType }]))) : null;
  templates.forEach((template, index) => {
    const label = `Challenge template at index ${index}`;
    if (!template?.id || typeof template.id !== 'string') errors.push(`${label} must have a string id.`);
    else if (ids.has(template.id)) errors.push(`Duplicate challenge template id: ${template.id}.`);
    else ids.add(template.id);
    if (!VALID_DIFFICULTIES.has(template?.difficulty)) errors.push(`${label} has an invalid difficulty.`);
    if (!Number.isInteger(template?.durationDays) || template.durationDays <= 0) errors.push(`${label} must have a positive integer durationDays.`);
    if (typeof template?.targetValue !== 'number' || !Number.isFinite(template.targetValue) || template.targetValue <= 0) errors.push(`${label} must have a positive numeric targetValue.`);
    if (!VALID_RECORD_TYPES.has(template?.recordType)) errors.push(`${label} has an invalid recordType.`);
    if (!VALID_PROGRESS_TYPES.has(template?.progressType)) errors.push(`${label} has an invalid progressType.`);
    if (template?.maxPerDay !== null && (typeof template?.maxPerDay !== 'number' || !Number.isFinite(template.maxPerDay) || template.maxPerDay <= 0)) errors.push(`${label} must have a null or positive numeric maxPerDay.`);
    if (goals) {
      const goal = goals.get(template?.id);
      if (!goal || template.title !== goal.title || template.category !== goal.category) errors.push(`${label} does not match goal ${template?.id}.`);
    }
  });
  return errors;
};

export const assertValidChallengeTemplates = (templates = CHALLENGE_TEMPLATES, goalCategories) => {
  const errors = validateChallengeTemplates(templates, goalCategories);
  if (errors.length) throw new Error(`Invalid challenge templates:\n${errors.join('\n')}`);
  return templates;
};

assertValidChallengeTemplates();
