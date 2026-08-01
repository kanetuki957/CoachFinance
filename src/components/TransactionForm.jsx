import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export const TransactionForm = () => {
  const { addTransaction, selectedMonth } = useFinance();
  const [isOpen, setIsOpen] = useState(false);
  
  // 新しく追加: 売上(revenue)かコスト(cost)かの種別ステート
  const [type, setType] = useState('revenue'); 
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  
  // デフォルトで選択中の月の今日（または1日）をセット
  const todayStr = `${selectedMonth}-${String(new Date().getDate()).padStart(2, '0')}`;
  const [date, setDate] = useState(todayStr);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount)) return;

    // 金額、メモ、種別(type)、日付をセットして追加
    addTransaction(Number(amount), note, type, date);

    // フォームリセット
    setAmount('');
    setNote('');
    setType('revenue');
    setIsOpen(false);
  };

  return (
    <>
      {/* 画面右下の＋ボタン */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-emerald-500 hover:bg-emerald-600 text-slate-950 p-4 rounded-full shadow-lg transition-transform hover:scale-105 z-40"
        aria-label="収支を記録"
      >
        <Plus className="w-6 h-6 stroke-[3]" />
      </button>

      {/* 入力モーダル */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl p-6 text-white shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold">収支の記録</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 【追加】売上 / コスト 切り替えタブ */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setType('revenue')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    type === 'revenue'
                      ? 'bg-emerald-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  売上 (+ revenue)
                </button>
                <button
                  type="button"
                  onClick={() => setType('cost')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    type === 'cost'
                      ? 'bg-rose-500 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  コスト (- cost)
                </button>
              </div>

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
                  placeholder={type === 'revenue' ? "例: 50000" : "例: 10000"}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                  required
                  autoFocus
                />
              </div>

              {/* メモ入力 */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">メモ (任意)</label>
                <input
                  type="text"
                  placeholder={type === 'revenue' ? "例: 個別指導コーチング代" : "例: ツール月額利用料"}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* ボタンの色も種別に応じて変化 */}
              <button
                type="submit"
                className={`w-full font-bold py-3 rounded-xl transition-colors mt-2 ${
                  type === 'revenue'
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
                    : 'bg-rose-500 hover:bg-rose-600 text-white'
                }`}
              >
                {type === 'revenue' ? '売上を追加する' : 'コストを追加する'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};