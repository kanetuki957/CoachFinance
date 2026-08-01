import React from 'react';
import { useFinance } from '../context/FinanceContext';

// 進化段階（レベル）の定義ロジック
const getEvolutionStage = (percentage) => {
  if (percentage >= 100) {
    return { level: 4, title: '最強のメンズコーチ', icon: '👑', desc: '圧倒的実績。理想の自分に到達！' };
  } else if (percentage >= 60) {
    return { level: 3, title: '洗練された起業家', icon: '👔', desc: '結果が出始め、自信に満ちている。' };
  } else if (percentage >= 20) {
    return { level: 2, title: 'ストイック挑戦者', icon: '🥊', desc: '日々の努力が芽吹き始めた状態。' };
  } else {
    return { level: 1, title: '覚醒前夜', icon: '🐣', desc: 'ここからすべてが始まる。行動あるのみ。' };
  }
};

export const CharacterEvolution = () => {
  const { progressPercentage } = useFinance();
  const currentStage = getEvolutionStage(progressPercentage);
  const targetStage = getEvolutionStage(100); // 目標の姿 (100%達成時)

  return (
    <div className="grid grid-cols-2 gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl text-white">
      {/* 機能5: 今の自分のイラスト/ステータス */}
      <div className="flex flex-col items-center p-3 bg-slate-800/50 rounded-lg text-center">
        <span className="text-xs text-slate-400 mb-1 font-semibold">現在のあなた (Lv.{currentStage.level})</span>
        <div className="text-5xl my-2 p-3 bg-slate-700/40 rounded-full border border-slate-600">
          {currentStage.icon}
        </div>
        <span className="text-sm font-bold text-emerald-400">{currentStage.title}</span>
        <p className="text-[10px] text-slate-400 mt-1">{currentStage.desc}</p>
      </div>

      {/* 機能4: 自分の目標のイラスト/ステータス */}
      <div className="flex flex-col items-center p-3 bg-slate-800/50 rounded-lg text-center border border-amber-500/30">
        <span className="text-xs text-amber-400 mb-1 font-semibold">理想の目標像</span>
        <div className="text-5xl my-2 p-3 bg-amber-500/10 rounded-full border border-amber-500/40">
          {targetStage.icon}
        </div>
        <span className="text-sm font-bold text-amber-400">{targetStage.title}</span>
        <p className="text-[10px] text-slate-400 mt-1">目標達成時の真の姿</p>
      </div>
    </div>
  );
};