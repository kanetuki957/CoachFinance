import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { Receipt } from 'lucide-react';

export const TransactionList = () => {
  const { transactions } = useFinance();

  // 日付の降順（新しい順）に並び替え
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  if (sortedTransactions.length === 0) {
    return (
      <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-6 text-center text-slate-500 text-sm">
        この月の記録はまだありません
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white space-y-3">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-slate-400 text-xs font-bold">
        <Receipt className="w-4 h-4 text-emerald-400" />
        <span>収益履歴・メモ</span>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {sortedTransactions.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 bg-slate-800/60 rounded-lg border border-slate-800"
          >
            <div className="space-y-0.5">
              <div className="text-xs text-slate-400 font-mono">{item.date}</div>
              <div className="text-sm font-medium text-slate-200">
                {item.note || <span className="text-slate-500 italic">メモなし</span>}
              </div>
            </div>
            <div className="text-sm font-bold text-emerald-400">
              +¥{item.amount.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

};