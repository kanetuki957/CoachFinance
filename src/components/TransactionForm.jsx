import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export const TransactionForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const { addTransaction } = useFinance();

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedAmount = Number(amount);
    
    if (!parsedAmount || isNaN(parsedAmount)) {
      alert('正しい金額を入力してください');
      return;
    }

    addTransaction(parsedAmount, note);
    setAmount('');
    setNote('');
    setIsOpen(false);
  };

  return (
    <>
      {/* 画面右下のフローティング「＋」ボタン */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 font-bold transition-all z-10"
        aria-label="利益を入力"
      >
        <Plus className="w-8 h-8 stroke-[3]" />
      </button>

      {/* モーダル表示 */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-xl p-5 text-white shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">利益の記録</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">金額 (円)</label>
                <input
                  type="number"
                  placeholder="例: 50000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white text-lg focus:outline-none focus:border-emerald-500"
                  required
                  autoFocus
                />
              </div>

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
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 rounded-lg transition-colors mt-2"
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