/**
 * @typedef {'revenue' | 'cost'} TransactionType - 取引種別（売上 または コスト）
 */

/**
 * @typedef {Object} Transaction
 * @property {string} id - 一意のID (UUID)
 * @property {TransactionType} type - 'revenue'(売上) または 'cost'(コスト)
 * @property {number} amount - 金額（常に正の数）
 * @property {string} date - 日付 (YYYY-MM-DD)
 * @property {string} [note] - メモ (任意)
 */

/**
 * @typedef {Object} FinanceState
 * @property {Record<string, number>} monthlyTargetProfits - 月ごとの目標利益 (例: { "2026-08": 500000 })
 * @property {Transaction[]} transactions - トランザクション履歴
 */

export {};