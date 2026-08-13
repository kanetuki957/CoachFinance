import React, { useEffect, useRef, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import {
  Check,
  ChevronDown,
  ChevronRight,
  LockKeyhole,
  Sparkles,
  Target,
  Trophy,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { FinanceProvider, getGoalTaskPlan, useFinance } from './context/FinanceContext';
import { TransactionForm } from './components/TransactionForm';
import { playCompletionSound } from './utils/playCompletionSound';
import { createGoalBgm } from './utils/createGoalBgm';

const getDayNumber = (startedOn) => {
  const start = new Date(`${startedOn || new Date().toISOString().slice(0, 10)}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.min(Math.max(Math.floor((today - start) / 86400000) + 1, 1), 7);
};

const Companion = ({ isComplete, progress }) => (
  <div className="relative mx-auto flex h-40 w-44 items-end justify-center" aria-label={isComplete ? '今日のクエストを達成したキャラクター' : '応援するキャラクター'}>
    <span className="companion-spark companion-spark-one">✦</span>
    <span className="companion-spark companion-spark-two">✦</span>
    <span className="companion-spark companion-spark-three">✦</span>
    <div className={`companion ${isComplete ? 'companion-celebrate' : ''}`}>
      <div className="companion-hair" />
      <div className="companion-head"><i /><i /></div>
      <div className="companion-body"><span className="companion-heart">♥</span></div>
      <div className="companion-arm companion-arm-left" />
      <div className="companion-arm companion-arm-right" />
      <div className="companion-leg companion-leg-left" />
      <div className="companion-leg companion-leg-right" />
    </div>
    <div className="absolute bottom-1 h-3 w-32 rounded-[100%] bg-slate-950/40 blur-sm" />
    <span className="absolute bottom-0 rounded-full border border-white/10 bg-slate-950/65 px-3 py-1 text-[10px] font-black tracking-[0.18em] text-amber-200">
      {isComplete ? 'QUEST CLEAR!' : `ENERGY ${progress}%`}
    </span>
  </div>
);

const Home = () => {
  const { activeGoal, completeTask } = useFinance();
  const [isMemoOpen, setIsMemoOpen] = useState(false);
  const [memo, setMemo] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isBgmPlaying, setIsBgmPlaying] = useState(false);
  const bgmPlayer = useRef(null);

  useEffect(() => () => bgmPlayer.current?.dispose(), []);

  const dayNumber = activeGoal ? getDayNumber(activeGoal.startedOn) : 1;
  const plan = activeGoal ? getGoalTaskPlan(activeGoal) ?? [] : [];
  const currentDay = plan[dayNumber - 1];
  const tasks = currentDay?.tasks ?? [];
  const taskIndex = activeGoal?.taskDay === dayNumber ? Math.min(activeGoal.taskIndex, tasks.length) : 0;
  const currentTask = tasks[taskIndex];
  const completedToday = taskIndex;
  const remainingToday = Math.max(tasks.length - completedToday, 0);
  const todayProgress = tasks.length ? Math.round((completedToday / tasks.length) * 100) : 0;
  const allTasks = plan.flatMap((day) => day.tasks);
  const completedCount = activeGoal?.completedTasks?.length ?? 0;
  const totalProgress = allTasks.length ? Math.min(Math.round((completedCount / allTasks.length) * 100), 100) : 0;
  const isTodayComplete = tasks.length > 0 && remainingToday === 0;

  const openMemo = () => {
    playCompletionSound();
    setMemo('');
    setIsMemoOpen(true);
  };

  const saveCompletion = () => {
    if (!currentTask) return;
    completeTask(dayNumber, tasks.length, currentTask, memo);
    setIsMemoOpen(false);
  };

  const toggleBgm = async () => {
    if (isBgmPlaying) {
      bgmPlayer.current?.stop();
      setIsBgmPlaying(false);
      return;
    }

    bgmPlayer.current ??= createGoalBgm();
    const didStart = await bgmPlayer.current.start();
    setIsBgmPlaying(didStart);
  };

  return (
    <div className="min-h-[100dvh] overflow-x-hidden bg-[#10182b] text-slate-100">
      <main className="mx-auto w-full max-w-md px-5 pb-28 pt-5">
        <header className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-amber-300">Daily quest</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight">今回の目標</h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {activeGoal && <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300">Day {dayNumber} / 7</span>}
            <button
              type="button"
              onClick={toggleBgm}
              aria-pressed={isBgmPlaying}
              aria-label={isBgmPlaying ? 'BGMをオフにする' : 'BGMをオンにする'}
              title={isBgmPlaying ? 'BGM オン' : 'BGM オフ'}
              className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${isBgmPlaying ? 'border-amber-300/50 bg-amber-300/15 text-amber-200' : 'border-white/10 bg-white/5 text-slate-400 hover:text-slate-100'}`}
            >
              {isBgmPlaying ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
          </div>
        </header>

        {activeGoal ? (
          <>
            <section className="rounded-[1.75rem] border border-amber-300/20 bg-gradient-to-br from-amber-300/15 via-orange-400/5 to-slate-900 p-4 shadow-xl shadow-slate-950/30">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-100">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-300/15 text-base">{activeGoal.icon}</span>
                {activeGoal.categoryName}
              </div>
              <div className="mt-3 flex gap-3">
                <Target className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
                <p className="text-base font-black leading-relaxed tracking-tight">{activeGoal.title}</p>
              </div>
            </section>

            <section className="relative mt-4 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-[#263c65] to-[#172640] px-5 pb-5 pt-4 shadow-2xl shadow-slate-950/30">
              <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-amber-300/10 blur-3xl" />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-200">Today&apos;s adventure</p>
                  <p className="mt-1 text-sm font-bold text-slate-300">あと <span className="text-xl font-black text-amber-300">{remainingToday}</span> 個で今日のクエスト完了</p>
                </div>
                <Sparkles className="h-5 w-5 text-amber-300" />
              </div>

              <Companion isComplete={isTodayComplete} progress={todayProgress} />

              <div className="relative mt-2">
                <div className="flex items-center justify-between text-xs font-bold text-blue-100">
                  <span>今日の進捗</span>
                  <span>{completedCount} / {allTasks.length} TASKS</span>
                </div>
                <div className="mt-2 h-4 overflow-hidden rounded-full border border-white/10 bg-slate-950/45 p-1">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-200 transition-all duration-700" style={{ width: `${totalProgress}%` }} />
                </div>
              </div>
            </section>

            <section className="mt-5">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">Today&apos;s tasks</p>
                  <h2 className="mt-1 text-xl font-black">今日やること</h2>
                </div>
                <span className={`rounded-full px-3 py-1.5 text-xs font-black ${isTodayComplete ? 'bg-emerald-400/15 text-emerald-300' : 'bg-amber-300/15 text-amber-200'}`}>
                  {isTodayComplete ? 'すべて完了！' : `残り ${remainingToday} 個`}
                </span>
              </div>

              <div className="mt-3 space-y-3">
                {tasks.map((task, index) => {
                  const isDone = index < completedToday;
                  const isCurrent = index === completedToday && !isTodayComplete;
                  return (
                    <article key={`${task}-${index}`} className={`rounded-3xl border p-4 transition ${isDone ? 'border-emerald-400/20 bg-emerald-400/10' : isCurrent ? 'border-amber-300/50 bg-slate-800 shadow-lg shadow-amber-950/20' : 'border-white/5 bg-slate-900/60 opacity-65'}`}>
                      <div className="flex items-center gap-4">
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-black ${isDone ? 'bg-emerald-400 text-slate-950' : isCurrent ? 'bg-amber-300 text-slate-950' : 'bg-slate-700 text-slate-300'}`}>
                          {isDone ? <Check className="h-5 w-5 stroke-[3]" /> : String(index + 1).padStart(2, '0')}
                        </span>
                        <p className={`flex-1 text-[15px] font-bold leading-relaxed ${isDone ? 'text-emerald-100 line-through decoration-emerald-400/60' : 'text-slate-50'}`}>{task}</p>
                        {isCurrent ? (
                          <button onClick={openMemo} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-300 text-slate-950 shadow-lg shadow-amber-400/15 transition hover:scale-105 hover:bg-amber-200" aria-label={`「${task}」を完了する`} title="完了する">
                            <Check className="h-6 w-6 stroke-[3]" />
                          </button>
                        ) : !isDone && <LockKeyhole className="h-4 w-4 shrink-0 text-slate-500" />}
                      </div>
                      {isCurrent && <p className="ml-12 mt-3 text-xs font-bold text-amber-200">チェックを押してクエストを完了</p>}
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70">
              <button onClick={() => setIsHistoryOpen((open) => !open)} className="flex w-full items-center gap-3 p-4 text-left" aria-expanded={isHistoryOpen}>
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-300/10 text-amber-300"><Trophy className="h-5 w-5" /></span>
                <span className="flex-1"><span className="block text-sm font-black">達成のきろく</span><span className="mt-0.5 block text-xs font-bold text-slate-400">全 {completedCount} / {allTasks.length} クエスト完了</span></span>
                <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${isHistoryOpen ? 'rotate-180' : ''}`} />
              </button>
              {isHistoryOpen && (
                <div className="space-y-2 border-t border-white/10 p-3">
                  {completedCount ? [...activeGoal.completedTasks].reverse().map((item) => (
                    <article key={item.id} className="rounded-2xl bg-slate-800/70 p-3">
                      <p className="text-xs font-black text-emerald-300">Day {item.day}</p>
                      <p className="mt-1 text-sm font-bold">{item.task}</p>
                      {item.note && <p className="mt-2 border-t border-white/10 pt-2 text-sm leading-relaxed text-slate-300">{item.note}</p>}
                    </article>
                  )) : <p className="p-3 text-center text-sm font-bold text-slate-400">最初のクエストを達成しよう！</p>}
                </div>
              )}
            </section>
          </>
        ) : (
          <section className="mt-16 rounded-[2rem] border border-dashed border-slate-600 bg-slate-900/70 p-8 text-center">
            <div className="text-5xl">🗺️</div>
            <h2 className="mt-4 text-xl font-black">冒険の目標を決めよう</h2>
            <p className="mt-3 text-sm font-bold leading-relaxed text-slate-400">右下の＋ボタンから目標を選ぶと、毎日のクエストが始まります。</p>
          </section>
        )}
      </main>

      <TransactionForm />
      {isMemoOpen && currentTask && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">Quest complete</p><h2 className="mt-1 text-xl font-black">完了を記録する</h2></div>
              <button onClick={() => setIsMemoOpen(false)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="閉じる"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-5 rounded-2xl bg-amber-300/10 p-4 text-sm font-bold leading-relaxed text-amber-50"><Check className="mr-2 inline h-5 w-5 text-amber-300" />{currentTask}</div>
            <label className="mt-5 block text-sm font-bold" htmlFor="completion-memo">ひとことメモ（任意）</label>
            <textarea id="completion-memo" value={memo} onChange={(event) => setMemo(event.target.value)} placeholder="できたこと・気づいたことを残せます" className="mt-2 min-h-28 w-full resize-none rounded-2xl border border-slate-700 bg-slate-800 p-3 text-sm leading-relaxed text-white outline-none placeholder:text-slate-500 focus:border-amber-300" autoFocus />
            <button onClick={saveCompletion} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-300 py-3.5 font-black text-slate-950 transition hover:bg-amber-200"><Sparkles className="h-5 w-5" />完了して次のクエストへ<ChevronRight className="h-5 w-5" /></button>
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
