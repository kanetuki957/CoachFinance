import React from 'react';
import { Trash2 } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export const IncomeList = ({ items }) => {
  const { transactions, deleteTransaction } = useFinance();

  // propsでitemsが渡された場合はそれを使用し、無ければContextのtransactionsを使用
  const displayItems = items || transactions || [];

  // 日付が新しい順（降順）にソート
  const sortedItems = [...displayItems].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="bg-slate-900 p-4 rounded-xl shadow-md border border-slate-800 text-white">
      <h2 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
        <span>📋</span> 取引・入出力履歴（最新順）
      </h2>

      {sortedItems.length === 0 ? (
        <p className="text-xs text-slate-500 text-center py-6">
          まだ入力されたデータがありません。
        </p>
      ) : (
        <ul className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
          {sortedItems.map((item) => {
            const isRevenue = item.type !== 'cost'; // typeがない既存データは売上扱い
            const noteText = item.note || item.memo || 'メモなし';

            return (
              <li
                key={item.id || `${item.date}-${item.amount}-${Math.random()}`}
                className="flex items-center justify-between p-3 bg-slate-800/60 rounded-lg border border-slate-800 hover:bg-slate-800 transition"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    {/* 日付 */}
                    <span className="text-[10px] font-semibold text-slate-400">
                      {item.date}
                    </span>
                    {/* 売上/コストのバッジ */}
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        isRevenue
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {isRevenue ? '売上' : 'コスト'}
                    </span>
                  </div>
                  {/* メモ */}
                  <span className="text-xs font-medium text-slate-200">
                    {noteText}
                  </span>
                </div>

                {/* 金額 & 削除ボタン */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span
                      className={`text-sm font-bold ${
                        isRevenue ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isRevenue ? '+' : '-'}¥{Number(item.amount).toLocaleString()}
                    </span>
                  </div>

                  {/* 削除ボタン（deleteTransactionが定義されている場合） */}
                  {deleteTransaction && (
                    <button
                      onClick={() => deleteTransaction(item.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                      aria-label="削除"
                      title="削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};