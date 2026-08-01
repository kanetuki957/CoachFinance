import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { Target, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

// ==========================================
// 💡 文字サイズ調整用定数
// ==========================================
const TEXT_SIZES = {
  currentProfit: "text-3xl sm:text-4xl font-extrabold", 
  subStatAmount: "text-lg sm:text-xl font-black",
  achievementPercent: "text-3xl font-black",
  label: "text-sm font-bold",
};

export const GoalProgressCircle = () => {
  const { totalRevenue = 0, totalCost = 0, currentProfit = 0, targetProfit = 0, achievementRate = 0 } = useFinance();

  // 0〜100%の範囲に制限（グラフ描画用）
  const clampedRate = Math.min(Math.max(Number(achievementRate) || 0, 0), 100);

  // SVG円グラフの計算
  const radius = 42;
  const circumference = 2 * Math.PI * radius; // 約 263.89
  // 達成率に応じたゲージの長さを計算
  const strokeDashoffset = circumference - (clampedRate / 100) * circumference;

{/* 表示用パーセント（100%を上限にする） */}
const displayRate = Math.min(Number(achievementRate) || 0, 100);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl space-y-6">
      {/* 1. 上段: 円グラフ ＋ 現在の利益 */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-800/40 p-5 rounded-xl border border-slate-800">
        
        {/* 円形プログレスバー */}
        <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            {/* 背景の円（グレー） */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="#1e293b" /* slate-800 */
              strokeWidth="10"
              fill="transparent"
            />
            {/* 進捗を示す動く円（エメラルドグリーン #34d399） */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="#34d399" /* emerald-400 */
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{
                transition: 'stroke-dashoffset 0.8s ease-in-out',
              }}
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
           <span className={`${TEXT_SIZES.achievementPercent} text-emerald-400`}>
    {displayRate}%
  </span>
  <span className="text-xs font-bold text-slate-300">達成度</span>
          </div>
        </div>

        {/* 現在の利益表示 */}
        <div className="flex-1 text-center sm:text-right space-y-1">
          <div className="flex items-center justify-center sm:justify-end gap-1.5 text-slate-300">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span className={TEXT_SIZES.label}>現在の利益</span>
          </div>
          <div className={`${TEXT_SIZES.currentProfit} ${currentProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ¥{Number(currentProfit).toLocaleString()}
          </div>
          <p className="text-xs text-slate-400 font-medium">
            (売上高 ¥{Number(totalRevenue).toLocaleString()} - コスト ¥{Number(totalCost).toLocaleString()})
          </p>
        </div>
      </div>

      {/* 2. 下段: 数値内訳グリッド */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 目標利益 */}
        <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Target className="w-4 h-4 text-emerald-400" />
            <span className={TEXT_SIZES.label}>目標利益</span>
          </div>
          <div className={`${TEXT_SIZES.subStatAmount} text-white`}>
            ¥{Number(targetProfit).toLocaleString()}
          </div>
        </div>

        {/* 売上高 */}
        <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-slate-300">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className={TEXT_SIZES.label}>売上高</span>
          </div>
          <div className={`${TEXT_SIZES.subStatAmount} text-emerald-400`}>
            ¥{Number(totalRevenue).toLocaleString()}
          </div>
        </div>

        {/* コスト */}
        <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-slate-300">
            <TrendingDown className="w-4 h-4 text-rose-400" />
            <span className={TEXT_SIZES.label}>コスト</span>
          </div>
          <div className={`${TEXT_SIZES.subStatAmount} text-rose-400`}>
            ¥{Number(totalCost).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};