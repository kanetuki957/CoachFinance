import React, { useState } from 'react';
import { ChevronRight, Plus, X } from 'lucide-react';
import { GOAL_CATEGORIES, useFinance } from '../context/FinanceContext';

export const TransactionForm = () => {
  const { selectGoal } = useFinance();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const close = () => {
    setIsOpen(false);
    setSelectedCategory(null);
  };

  const chooseGoal = (goal) => {
    selectGoal(selectedCategory, goal);
    close();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 rounded-full bg-emerald-400 p-4 text-slate-950 shadow-lg shadow-emerald-950/60 transition hover:scale-105 hover:bg-emerald-300"
        aria-label="目標を追加"
      >
        <Plus className="h-6 w-6 stroke-[3]" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-5 text-white shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">New goal</p>
                <h2 className="mt-1 text-xl font-black">{selectedCategory ? selectedCategory.name : 'カテゴリを選ぶ'}</h2>
              </div>
              <button onClick={close} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="閉じる">
                <X className="h-5 w-5" />
              </button>
            </div>

            {!selectedCategory ? (
              <div className="space-y-3">
                {GOAL_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category)}
                    className="flex w-full items-center gap-4 rounded-xl border border-slate-700 bg-slate-800/70 p-4 text-left transition hover:border-emerald-400/60 hover:bg-slate-800"
                  >
                    <span className="text-3xl">{category.icon}</span>
                    <span className="flex-1 font-bold">{category.name}</span>
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  </button>
                ))}
              </div>
            ) : (
              <>
                <button onClick={() => setSelectedCategory(null)} className="mb-3 text-sm font-bold text-slate-400 hover:text-white">← カテゴリに戻る</button>
                <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-1">
                  {selectedCategory.goals.map((goal) => (
                    <button
                      key={goal}
                      onClick={() => chooseGoal(goal)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-800/70 p-4 text-left text-sm font-bold leading-relaxed transition hover:border-emerald-400 hover:bg-emerald-400/10"
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
