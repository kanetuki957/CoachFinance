import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export const MonthSelector = () => {
  const { selectedMonth, changeMonth, monthlyGoal, updateMonthlyGoal } = useFinance();
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(monthlyGoal);

  // 表示用に "2026年07月" 形式に整形
  const [year, month] = selectedMonth.split('-');

  const handleGoalSubmit = (e) => {
    e.preventDefault();
    updateMonthlyGoal(tempGoal);
    setIsEditingGoal(false);
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white flex flex-col gap-3">
      {/* 月選択ヘッダー */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => changeMonth(-1)}
          className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          aria-label="前月"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <span className="text-xl font-black tracking-widest">
            {year}年{month}月
          </span>
        </div>

        <button
          onClick={() => changeMonth(1)}
          className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          aria-label="次月"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* 今月の目標設定変更ボタン */}
      <div className="flex justify-between items-center border-t border-slate-800 pt-3 text-xs text-slate-400">
        <span>この月の設定目標: <strong className="text-white text-sm">¥{monthlyGoal.toLocaleString()}</strong></span>
        <button
          onClick={() => {
            setTempGoal(monthlyGoal);
            setIsEditingGoal(true);
          }}
          className="flex items-center gap-1 text-emerald-400 hover:underline"
        >
          <Settings className="w-3.5 h-3.5" />
          目標を変更
        </button>
      </div>

      {/* 目標変更モーダル */}
      {isEditingGoal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-xl p-5 text-white shadow-2xl">
            <h3 className="text-md font-bold mb-3">{year}年{month}月の目標設定</h3>
            <form onSubmit={handleGoalSubmit} className="space-y-3">
              <input
                type="number"
                value={tempGoal}
                onChange={(e) => setTempGoal(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                placeholder="目標金額を入力"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingGoal(false)}
                  className="w-1/2 bg-slate-800 hover:bg-slate-700 py-2 rounded-lg text-xs"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2 rounded-lg text-xs"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};