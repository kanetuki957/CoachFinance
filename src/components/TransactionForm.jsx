import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export const TransactionForm = () => {
  const { addTransaction, selectedMonth } = useFinance();
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  // デフォルトで選択中の月の今日（または1日）をセット
  const todayStr = `${selectedMonth}-${String(new Date().getDate()).padStart(2, '0')}`;
  const [date, setDate] = useState(todayStr);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount)) return;

    // 金額、メモ、日付をセットして追加
    addTransaction(Number(amount), note, date);

    // フォームリセット
    setAmount('');
    setNote('');
    setIsOpen(false);
  };

  return (
    <>
      {/* 画面右下の＋ボタン */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-emerald-500 hover:bg-emerald-600 text-slate-950 p-4 rounded-full shadow-lg transition-transform hover:scale-105 z-40"
        aria-label="収益を追加"
      >
        <Plus className="w-6 h-6 stroke-[3]" />
      </button>

      {/* 入力モーダル */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl p-6 text-white shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold">収益の記録</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 日付入力 */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">日付</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* 金額入力 */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">金額 (円)</label>
                <input
                  type="number"
                  placeholder="例: 50000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                  required
                  autoFocus
                />
              </div>

              {/* メモ入力（お探しの部分） */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">メモ (任意)</label>
                <input
                  type="text"
                  placeholder="例: 個別指導コーチング代"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 rounded-xl transition-colors mt-2"
              >
                追加する
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};