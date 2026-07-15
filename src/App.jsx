import React from 'react';
import { FinanceProvider } from './context/FinanceContext';
import { GoalProgressCircle } from './components/GoalProgressCircle';
import { CharacterEvolution } from './components/CharacterEvolution';
import { TransactionForm } from './components/TransactionForm';

export default function App() {
  return (
    <FinanceProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-4 pb-24">
        {/* ヘッダー */}
        <header className="w-full max-w-md my-4 flex justify-between items-center border-b border-slate-800 pb-3">
          <h1 className="text-xl font-black tracking-wider text-emerald-400 uppercase">
            CoachFinance
          </h1>
          <span className="text-xs bg-slate-800 px-2.5 py-1 rounded-full text-slate-400 border border-slate-700">
            メンタル × 収益管理
          </span>
        </header>

        {/* メインコンテンツ（画面A: ホーム画面） */}
        <main className="w-full max-w-md space-y-4">
          {/* 機能1, 2: 目標と現在の実績グラフ */}
          <GoalProgressCircle />

          {/* 機能4, 5: 自分と目標の進化イラストコンポーネント */}
          <CharacterEvolution />
        </main>

        {/* 機能3: ＋ボタン＆利益入力用アクション */}
        <TransactionForm />
      </div>
    </FinanceProvider>
  );
}