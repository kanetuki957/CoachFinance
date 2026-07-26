import React from 'react';
import { useFinance } from '../context/FinanceContext';

export const GoalProgressCircle = () => {
  const { currentMonthTotal, monthlyGoal, progressPercentage } = useFinance();

  // SVG円グラフの計算用
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  // 100%を超えても描画崩れを起こさないようクランプ（見た目用）
  const clampedProgress = Math.min(progressPercentage, 100);
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  // ±の符号判定
  const isPositive = currentMonthTotal >= 0;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900 text-white rounded-xl shadow-md">
      {/* 円形グラフSVG */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          {/* 背景の円 */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            className="stroke-slate-800"
            strokeWidth="12"
            fill="transparent"
          />
          {/* 進捗を示す円 */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            className={`${isPositive ? 'stroke-emerald-500' : 'stroke-rose-500'} transition-all duration-500 ease-out`}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* 中央のテキスト情報 */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-xs text-slate-400 font-bold tracking-wider uppercase">今月の達成度</span>
          <span className={`text-2xl font-black ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {progressPercentage.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* 数値詳細表示 */}
      <div className="mt-4 w-full grid grid-cols-2 gap-4 text-center border-t border-slate-800 pt-4">
        <div>
          <p className="text-xs text-slate-400">実績 (合計)</p>
          <p className="text-lg font-bold text-slate-100">
            ¥{currentMonthTotal.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400">目標利益</p>
          <p className="text-lg font-bold text-slate-100">
            ¥{monthlyGoal.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};