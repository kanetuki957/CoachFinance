import React, { useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Check, ChevronDown, X } from 'lucide-react';
import { Target } from 'lucide-react';
import { DAILY_TASKS, FinanceProvider, useFinance } from './context/FinanceContext';
import { TransactionForm } from './components/TransactionForm';

const getDayNumber = (startedOn) => {
  const start = new Date(`${startedOn || new Date().toISOString().slice(0, 10)}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.min(Math.max(Math.floor((today - start) / 86400000) + 1, 1), 7);
};

const GoalProgress = ({ completed, total }) => {
  const percentage = total ? Math.min(Math.round((completed / total) * 100), 100) : 0;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percentage / 100) * circumference;

  return (
    <section className="my-2 flex flex-col items-center rounded-3xl border border-slate-800 bg-slate-900/70 p-3">
      <p className="text-sm font-bold text-slate-300">7日間の進捗</p>
      <div className="relative mt-1 h-28 w-28">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 128 128" aria-label={`進捗 ${percentage}%`}>
          <circle cx="64" cy="64" r={radius} fill="none" stroke="#1e293b" strokeWidth="11" />
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="#34d399"
            strokeWidth="11"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 500ms ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center [&>span:last-child]:hidden">
          <span className="text-2xl font-black text-emerald-400">{percentage}%</span>
          <span className="mt-1 text-xs font-bold text-slate-400">{completed} / {total} タスク</span>
        </div>
      </div>
      <p className="mt-4 text-sm font-medium text-slate-400">{percentage === 100 ? '1週間の目標達成 🎉' : 'ひとつずつ、着実に進めよう。'}</p>
    </section>
  );
};

const Home = () => {
  const { activeGoal, completeTask } = useFinance();
  const [isMemoOpen, setIsMemoOpen] = useState(false);
  const [memo, setMemo] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const dayNumber = activeGoal ? getDayNumber(activeGoal.startedOn) : 1;
  const tasks = activeGoal ? (DAILY_TASKS[activeGoal.categoryId] ?? DAILY_TASKS.life)[dayNumber - 1] : [];
  const taskIndex = activeGoal?.taskDay === dayNumber ? activeGoal.taskIndex : 0;
  const currentTask = tasks[taskIndex];
  const allTasks = activeGoal ? (DAILY_TASKS[activeGoal.categoryId] ?? DAILY_TASKS.life).flat() : [];
  const completedCount = activeGoal?.completedTasks?.length ?? 0;

  const openMemo = () => {
    setMemo('');
    setIsMemoOpen(true);
  };

  const saveCompletion = () => {
    completeTask(dayNumber, tasks.length, currentTask, memo);
    setIsMemoOpen(false);
  };

  return (
    <div className={`${isHistoryOpen ? 'min-h-screen' : 'h-[100dvh] overflow-hidden'} bg-slate-950 text-slate-100`}>
      <main className={`mx-auto flex w-full max-w-md flex-col px-5 pb-4 pt-3 ${isHistoryOpen ? 'min-h-screen' : 'h-full overflow-hidden'}`}>
        <header className="mb-2 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Coach</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight">今日の目標</h1>
          </div>
        </header>

        {activeGoal ? (
          <>
            <div className="flex flex-1 flex-col justify-center">
            <section className="mx-3 rounded-3xl border border-emerald-400/30 bg-gradient-to-br from-emerald-400/15 to-slate-900 p-4 shadow-xl shadow-emerald-950/20">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold text-emerald-300">
              <span className="text-xl">{activeGoal.icon}</span>
              {activeGoal.categoryName}
            </div>
            <div className="flex gap-4">
              <Target className="mt-1 h-6 w-6 shrink-0 text-emerald-400" />
              <p className="text-lg font-black leading-snug tracking-tight">{activeGoal.title}</p>
            </div>
            <p className="mt-3 border-t border-white/10 pt-2 text-xs leading-relaxed text-slate-300">小さな一歩でも大丈夫。今日できることから始めよう。</p>
            </section>

            <GoalProgress completed={completedCount} total={allTasks.length} />

            <section className="mt-2 rounded-3xl border border-slate-800 bg-slate-900/80 p-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-black">今日のタスク</h2>
              <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-300">Day {dayNumber}</span>
            </div>
            {currentTask ? (
              <div className="mt-2 rounded-2xl border border-slate-700 bg-slate-800/70 p-3">
                <p className="text-xs font-bold text-slate-400">{taskIndex + 1} / {tasks.length}</p>
                <div className="mt-3 flex items-center gap-4">
                  <p className="flex-1 text-base font-bold leading-relaxed text-slate-100">{currentTask}</p>
                  <button
                    onClick={openMemo}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-slate-950 transition hover:scale-105 hover:bg-emerald-300"
                    aria-label="タスクを完了する"
                    title="完了して次へ"
                  >
                    <Check className="h-6 w-6 stroke-[3]" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-5 text-center">
                <div className="text-3xl">🎉</div>
                <p className="mt-2 font-black text-emerald-300">今日のタスクはすべて完了です！</p>
                <p className="mt-1 text-sm text-slate-400">明日も無理なく続けましょう。</p>
              </div>
            )}
            </section>
            </div>

            {(activeGoal.completedTasks?.length ?? 0) > 0 && (
              <section className="-mx-2 mt-2 rounded-3xl border border-slate-800 bg-slate-900/60 p-4">
                <button
                  onClick={() => setIsHistoryOpen((isOpen) => !isOpen)}
                  className="flex w-full items-center justify-between text-left"
                  aria-expanded={isHistoryOpen}
                >
                  <span className="text-lg font-black">完了したタスクとメモ</span>
                  <span className="flex items-center gap-2 text-sm font-bold text-emerald-300">
                    {activeGoal.completedTasks.length}件
                    <ChevronDown className={`h-5 w-5 transition-transform ${isHistoryOpen ? 'rotate-180' : ''}`} />
                  </span>
                </button>
                {isHistoryOpen && (
                  <div className="mt-3 space-y-3">
                    {[...activeGoal.completedTasks].reverse().map((item) => (
                      <article key={item.id} className="rounded-2xl border border-slate-800 bg-slate-800/60 p-4">
                        <div className="flex items-start gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-400">
                            <Check className="h-4 w-4 stroke-[3]" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-emerald-300">Day {item.day}</p>
                            <p className="mt-1 text-sm font-bold leading-relaxed text-slate-100">{item.task}</p>
                            {item.note && <p className="mt-3 border-t border-slate-700 pt-3 text-sm leading-relaxed text-slate-300">{item.note}</p>}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        ) : (
          <section className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/60 p-8 text-center">
            <div className="mb-4 text-5xl">🎯</div>
            <h2 className="text-xl font-black">まだ目標がありません</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">右下の＋ボタンからカテゴリを選んで、次に取り組む目標を設定しましょう。</p>
          </section>
        )}

        <section className="hidden mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="font-bold">目標の使い方</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">＋ボタンから「筋トレ・運動」「勉強・資格」などのカテゴリを開き、項目を選択してください。選んだ目標はこの画面の上部に表示されます。</p>
        </section>
      </main>
      <TransactionForm />
      {isMemoOpen && currentTask && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Task complete</p>
                <h2 className="mt-1 text-xl font-black">メモを残す</h2>
              </div>
              <button onClick={() => setIsMemoOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="閉じる">
                <X className="h-5 w-5" />
              </button>
            </div>

            <label className="mt-5 block text-sm font-bold text-slate-200" htmlFor="completion-memo">今日の気づき・できたこと</label>
            <textarea
              id="completion-memo"
              value={memo}
              onChange={(event) => setMemo(event.target.value)}
              placeholder="例：10分続けられた。明日は腕のトレーニングを増やしたい。"
              className="mt-2 min-h-28 w-full resize-none rounded-xl border border-slate-700 bg-slate-800 p-3 text-sm leading-relaxed text-white outline-none placeholder:text-slate-500 focus:border-emerald-400"
              autoFocus
            />

            <div className="mt-5 border-t border-slate-800 pt-4">
              <p className="text-xs font-bold text-slate-400">完了したタスク</p>
              <div className="mt-2 flex items-center gap-3 rounded-xl bg-emerald-400/10 p-3 text-sm font-bold text-emerald-100">
                <Check className="h-5 w-5 shrink-0 text-emerald-400" />
                {currentTask}
              </div>
            </div>

            <button onClick={saveCompletion} className="mt-5 w-full rounded-xl bg-emerald-400 py-3 font-black text-slate-950 transition hover:bg-emerald-300">
              保存して次のタスクへ
            </button>
          </div>
        </div>
      )}
      <Analytics />
    </div>
  );
};

export default function App() {
  return <FinanceProvider><Home /></FinanceProvider>;
}
