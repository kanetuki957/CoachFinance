/**
 * @typedef {Object} Transaction
 * @property {string} id - 一意のID
 * @property {number} amount - 金額（プラスは利益、マイナスは支出）
 * @property {string} date - 日付 (YYYY-MM-DD)
 * @property {string} [note] - メモ
 */

/**
 * @typedef {Object} FinanceState
 * @property {number} monthlyGoal - 今月の目標金額
 * @property {Transaction[]} transactions - トランザクション履歴
 */
export {};