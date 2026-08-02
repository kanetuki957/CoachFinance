import React from 'react';
import { FinanceProvider } from './context/FinanceContext';
import { MonthSelector } from './components/MonthSelector';
import { GoalProgressCircle } from './components/GoalProgressCircle';
import { CharacterEvolution } from './components/CharacterEvolution';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { Analytics } from "@vercel/analytics/next"
//import { IncomeList } from './components/IncomeList';

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

        {/* メインコンテンツ */}
        <main className="w-full max-w-md space-y-4">
          {/* 月選択コンポーネント */}
          <MonthSelector />

          {/* 機能1, 2: 選択月の目標と実績グラフ */}
          <GoalProgressCircle />

          {/* 機能4, 5: 選択月の達成度に応じた進化イラスト */}
          <CharacterEvolution />

          {/* 日付ごとのメモ・金額履歴表示 */}
          <TransactionList />
        </main>
        

        {/* 機能3: 利益入力フォームボタン */}
        <TransactionForm />
      </div>
    </FinanceProvider>
  );
}