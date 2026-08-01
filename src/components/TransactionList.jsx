import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { Receipt, Trash2 } from 'lucide-react';

export const TransactionList = () => {
  const { transactions, deleteTransaction } = useFinance();

  // 日付の降順（新しい順）に並び替え
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  if (sortedTransactions.length === 0) {
    return (
      <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-6 text-center text-slate-400 text-base font-medium">
        この月の記録はまだありません
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white space-y-3">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-slate-300 text-sm font-bold">
        <Receipt className="w-4 h-4 text-emerald-400" />
        <span>収支履歴・メモ</span>
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {sortedTransactions.map((item) => {
          const isRevenue = item.type !== 'cost';

          return (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-slate-800/70 rounded-lg border border-slate-800 hover:bg-slate-800 transition"
            >
              {/* ① 日付を一番左端に小さく配置 ＆ メモ・バッジ */}
              <div className="flex items-center gap-3 min-w-0">
                {/* 画面左端の小さい月日付 */}
                <span className="text-[11px] text-slate-400 font-mono flex-shrink-0">
                  {item.date}
                </span>

                {/* 売上 / コスト バッジ */}
                <span
                  className={`text-xs px-2 py-0.5 rounded font-bold flex-shrink-0 ${
                    isRevenue
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {isRevenue ? '売上' : 'コスト'}
                </span>

                {/* ③ メモ表示（文字サイズを拡大） */}
                <span className="text-base font-medium text-slate-100 truncate">
                  {item.note || <span className="text-slate-500 italic text-sm">メモなし</span>}
                </span>
              </div>

              {/* ② 金額表示（文字サイズを大きく＆太字） ＆ 削除ボタン */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <div
                  className={`text-base sm:text-lg font-black ${
                    isRevenue ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isRevenue ? '+' : '-'}¥{item.amount.toLocaleString()}
                </div>

                {deleteTransaction && (
                  <button
                    onClick={() => deleteTransaction(item.id)}
                    className="text-slate-400 hover:text-rose-400 p-1 transition-colors"
                    title="削除"
                    aria-label="削除"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};