import React, { useMemo, useRef, useState } from 'react';
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, CircleDollarSign, ClipboardList, Flame, History, Target, Trophy } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { findChallengeTemplate } from '../../domain/challenges/challengeCatalog';
import { getCategoryStatistics, getChallengeHistory, getChallengeHistoryDetail, getChallengeSummary, getDailyActivity } from '../../domain/challenges/challengeHistory';

const categoryLabels = { strength: '筋トレ', knowledge: '勉強', wealth: '生活習慣' };
const difficultyLabels = { easy: 'EASY', normal: 'NORMAL', hard: 'HARD' };
const statusLabels = { completed: '達成', failed: '失敗', cancelled: '中断' };
const unitLabels = { reps: '回', minutes: '分', pages: 'ページ', questions: '問', days: '日', times: '回' };
const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const localToday = () => dateKey(new Date());
const displayDate = (value) => typeof value === 'string' ? value.replaceAll('-', '/') : '—';
const displayDateTime = (value) => value ? new Intl.DateTimeFormat('ja-JP', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—';

const StatusBadge = ({ status }) => <span className={`rounded-full px-2 py-1 text-[10px] font-black ${status === 'completed' ? 'bg-emerald-400/15 text-emerald-200' : status === 'failed' ? 'bg-rose-400/15 text-rose-200' : 'bg-slate-600 text-slate-200'}`}>{statusLabels[status]}</span>;

function Summary({ summary }) {
  const cards = [
    ['総挑戦', summary.totalChallenges, Target, 'text-sky-200'],
    ['達成', summary.completed, Trophy, 'text-emerald-200'],
    ['失敗', summary.failed, Flame, 'text-rose-200'],
    ['中断', summary.cancelled, ClipboardList, 'text-slate-200'],
  ];
  return <><section className="grid grid-cols-2 gap-3">{cards.map(([label, value, Icon, color]) => <article key={label} className="rounded-3xl border border-white/10 bg-slate-900/75 p-4"><Icon className={`h-5 w-5 ${color}`} /><p className="mt-3 text-3xl font-black">{value}</p><p className="mt-1 text-xs font-bold text-slate-400">{label}回</p></article>)}</section><section className="mt-3 grid grid-cols-3 gap-2 rounded-3xl border border-amber-300/20 bg-amber-300/10 p-4 text-center"><div><p className="text-xl font-black text-amber-200">{summary.completionRate === null ? '—' : `${Math.round(summary.completionRate)}%`}</p><p className="mt-1 text-[10px] font-bold text-slate-300">達成率</p></div><div><p className="text-xl font-black text-amber-200">{summary.earnedCoins}</p><p className="mt-1 text-[10px] font-bold text-slate-300">獲得コイン</p></div><div><p className="text-xl font-black text-amber-200">{summary.activityDays}</p><p className="mt-1 text-[10px] font-bold text-slate-300">行動日数</p></div></section></>;
}

function Categories({ statistics }) {
  return <section className="mt-7"><p className="text-xs font-black uppercase tracking-[.18em] text-sky-300">Category growth</p><h2 className="mt-1 text-xl font-black">カテゴリー別の成長</h2><div className="mt-3 space-y-3">{statistics.map((item) => <article key={item.id} className="rounded-3xl border border-white/10 bg-slate-900/75 p-4"><div className="flex items-baseline justify-between"><h3 className="font-black">{item.label}</h3><span className="text-sm font-black text-amber-200">{item.completionRate === null ? '—' : `${Math.round(item.completionRate)}%`}</span></div><div className="mt-3 grid grid-cols-3 text-center text-xs"><span><b className="block text-base text-slate-100">{item.challenges}</b>挑戦</span><span><b className="block text-base text-emerald-200">{item.completed}</b>達成</span><span><b className="block text-base text-sky-200">{item.activityRecords}</b>記録</span></div></article>)}</div></section>;
}

function ActivityCalendar({ activity }) {
  const [month, setMonth] = useState(() => { const now = new Date(); return new Date(now.getFullYear(), now.getMonth(), 1); });
  const [selectedDate, setSelectedDate] = useState(null);
  const activityByDate = useMemo(() => new Map(activity.map((item) => [item.date, item])), [activity]);
  const today = localToday();
  const startDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = [...Array(startDay).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];
  const selected = selectedDate ? activityByDate.get(selectedDate) : null;
  const nextMonth = new Date(month.getFullYear(), month.getMonth() + 1, 1);
  const canMoveNext = nextMonth <= new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const level = (count) => count >= 3 ? 'bg-emerald-300 text-slate-950' : count === 2 ? 'bg-emerald-400/55 text-emerald-50' : count === 1 ? 'bg-emerald-400/20 text-emerald-100' : 'bg-slate-800/70 text-slate-500';
  return <section className="mt-7"><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-300">Activity calendar</p><h2 className="mt-1 text-xl font-black">行動の積み重ね</h2><div className="mt-3 rounded-3xl border border-white/10 bg-slate-900/75 p-4"><div className="flex items-center justify-between"><button type="button" onClick={() => setMonth((value) => new Date(value.getFullYear(), value.getMonth() - 1, 1))} className="rounded-xl p-2 hover:bg-white/10" aria-label="前の月"><ChevronLeft className="h-5 w-5" /></button><p className="font-black">{month.getFullYear()}年{month.getMonth() + 1}月</p><button type="button" disabled={!canMoveNext} onClick={() => setMonth(nextMonth)} className="rounded-xl p-2 hover:bg-white/10 disabled:text-slate-600" aria-label="次の月"><ChevronRight className="h-5 w-5" /></button></div><div className="mt-4 grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-500">{'日月火水木金土'.split('').map((day) => <span key={day}>{day}</span>)}</div><div className="mt-2 grid grid-cols-7 gap-1">{cells.map((day, index) => { if (!day) return <span key={`blank-${index}`} />; const current = dateKey(new Date(month.getFullYear(), month.getMonth(), day)); const entry = activityByDate.get(current); const future = current > today; return <button key={current} type="button" disabled={future || !entry} onClick={() => setSelectedDate(current)} title={entry ? entry.challengeNames.join('、') : undefined} className={`aspect-square rounded-lg text-xs font-black transition ${future ? 'bg-slate-900/40 text-slate-700' : level(entry?.count ?? 0)} ${selectedDate === current ? 'ring-2 ring-amber-300' : ''}`}>{day}{entry && <small className="block text-[8px]">{entry.count}</small>}</button>; })}</div>{selected ? <div className="mt-4 rounded-2xl bg-slate-800 p-3 text-sm"><p className="font-black">{displayDate(selected.date)}：{selected.count}件の記録</p><p className="mt-1 text-xs font-bold text-slate-300">{selected.challengeNames.join('、')}</p></div> : <p className="mt-4 text-center text-xs font-bold text-slate-400">記録のある日を選ぶと、行動内容を確認できます。</p>}</div></section>;
}

function HistoryList({ history, status, onStatus, onSelect }) {
  const filters = [['all', 'すべて'], ['completed', '達成'], ['failed', '失敗'], ['cancelled', '中断']];
  return <section className="mt-7"><p className="text-xs font-black uppercase tracking-[.18em] text-amber-300">Challenge history</p><h2 className="mt-1 text-xl font-black">これまでの挑戦</h2><div className="mt-3 flex gap-2 overflow-x-auto">{filters.map(([id, label]) => <button key={id} type="button" onClick={() => onStatus(id)} className={`shrink-0 rounded-full px-3 py-2 text-xs font-black ${status === id ? 'bg-amber-300 text-slate-950' : 'bg-white/10 text-slate-300'}`}>{label}</button>)}</div>{history.length ? <div className="mt-3 space-y-3">{history.map((item) => <button type="button" key={item.challenge.id} onClick={() => onSelect(item.challenge.id)} className="w-full rounded-3xl border border-white/10 bg-slate-900/75 p-4 text-left transition hover:border-amber-300/50"><div className="flex justify-between gap-3"><div><p className="font-black">{item.template.title}</p><p className="mt-1 text-xs font-bold text-slate-400">{categoryLabels[item.category]} ・ {difficultyLabels[item.challenge.difficulty]} ・ {displayDate(item.challenge.startDate)}〜{displayDate(item.challenge.endDate)}</p></div><StatusBadge status={item.challenge.status} /></div><div className="mt-3 flex justify-between text-sm font-bold"><span>進捗 {item.progress} / {item.challenge.targetValue}{unitLabels[item.challenge.unit] ?? ''}</span><span className="text-amber-200">{Math.round(item.progressPercent)}%</span></div><p className="mt-2 text-xs font-bold text-slate-400">達成報酬: {item.rewardClaimed ? '獲得済み' : '未獲得'}{item.debug && ' ・ 開発用記録'}</p></button>)}</div> : <div className="mt-3 rounded-3xl border border-dashed border-slate-600 bg-slate-900/70 p-7 text-center"><History className="mx-auto h-7 w-7 text-amber-300" /><p className="mt-3 font-black">まだ履歴がありません</p><p className="mt-1 text-sm font-bold text-slate-400">最初のチャレンジを始めて、成長を記録しましょう。</p></div>}</section>;
}

function Detail({ detail, onBack }) {
  const reward = detail.rewardClaim?.reward;
  return <div className="min-h-[100dvh] bg-[#10182b] text-slate-100"><main className="mx-auto w-full max-w-md px-5 pb-10 pt-5"><header className="flex items-center gap-3"><button type="button" onClick={onBack} className="rounded-xl p-2 hover:bg-white/10" aria-label="戻る"><ArrowLeft className="h-5 w-5" /></button><div><p className="text-xs font-black tracking-[.18em] text-amber-300">CHALLENGE DETAIL</p><h1 className="text-xl font-black">挑戦の詳細</h1></div></header><section className="mt-6 rounded-3xl border border-white/10 bg-slate-900/75 p-5"><div className="flex justify-between gap-3"><div><h2 className="text-xl font-black">{detail.template.title}</h2><p className="mt-1 text-sm font-bold text-slate-400">{categoryLabels[detail.category]} ・ {difficultyLabels[detail.challenge.difficulty]}</p></div><StatusBadge status={detail.challenge.status} /></div><dl className="mt-5 space-y-3 text-sm"><div className="flex justify-between"><dt className="text-slate-400">期間</dt><dd>{displayDate(detail.challenge.startDate)}〜{displayDate(detail.challenge.endDate)}</dd></div><div className="flex justify-between"><dt className="text-slate-400">終了日時</dt><dd className="text-right">{displayDateTime(detail.endedAt)}</dd></div><div className="flex justify-between"><dt className="text-slate-400">最終進捗</dt><dd>{detail.progress} / {detail.challenge.targetValue}{unitLabels[detail.challenge.unit] ?? ''}（{Math.round(detail.progressPercent)}%）</dd></div><div className="flex justify-between"><dt className="text-slate-400">達成報酬</dt><dd>{detail.rewardClaimed ? reward?.type === 'coins' ? `+${reward.amount}コイン` : 'POCO家具を獲得' : '未獲得'}</dd></div></dl>{detail.debug && <p className="mt-4 rounded-xl bg-fuchsia-400/10 p-3 text-xs font-bold text-fuchsia-100">開発用の即達成記録です。通常の成長統計には含めません。</p>}</section><section className="mt-6"><h2 className="text-lg font-black">行動記録</h2>{detail.records.length ? <div className="mt-3 space-y-2">{detail.records.map((record) => <article key={record.id} className="rounded-2xl bg-slate-900/75 p-3"><div className="flex justify-between text-sm"><span className="font-black">{displayDate(record.localDate)}：{record.value}{unitLabels[record.unit] ?? ` ${record.unit}`}</span><span className="text-amber-200">+{record.coinsEarned ?? 0}コイン</span></div><p className="mt-1 text-xs font-bold text-slate-400">ステータス +{record.statusEarned ?? 0}</p></article>)}</div> : <p className="mt-3 rounded-2xl bg-slate-900/75 p-4 text-sm font-bold text-slate-400">行動記録はありません。</p>}</section><section className="mt-6 rounded-3xl border border-white/10 bg-slate-900/75 p-4 text-sm"><h2 className="font-black">再挑戦との関連</h2>{detail.previousChallenge && <p className="mt-2 text-slate-300">前回の挑戦: {findChallengeTemplate(detail.previousChallenge.goalId)?.title ?? detail.previousChallenge.goalId}</p>}{detail.retries.length > 0 && <p className="mt-2 text-slate-300">この挑戦からの再挑戦: {detail.retries.length}回</p>}{!detail.previousChallenge && !detail.retries.length && <p className="mt-2 text-slate-400">再挑戦との関連はありません。</p>}</section></main></div>;
}

export function GrowthHistory({ onBack }) {
  const { challenges, challengeCompletions, challengeRewardClaims } = useFinance();
  const [status, setStatus] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [page, setPage] = useState(0);
  const pagesRef = useRef(null);
  const summary = useMemo(() => getChallengeSummary(challenges, challengeCompletions, challengeRewardClaims), [challenges, challengeCompletions, challengeRewardClaims]);
  const categories = useMemo(() => getCategoryStatistics(challenges, challengeCompletions), [challenges, challengeCompletions]);
  const activity = useMemo(() => getDailyActivity(challenges, challengeCompletions), [challenges, challengeCompletions]);
  const history = useMemo(() => getChallengeHistory(challenges, challengeCompletions, challengeRewardClaims, { status, includeDebug: import.meta.env.DEV }), [challenges, challengeCompletions, challengeRewardClaims, status]);
  const detail = selectedId ? getChallengeHistoryDetail(selectedId, challenges, challengeCompletions, challengeRewardClaims) : null;
  const tabs = ['これまでの成長', 'カテゴリー別の成長', '行動の積み重ね', 'これまでの挑戦'];
  const goToPage = (index) => {
    setPage(index);
    const container = pagesRef.current;
    if (container) container.scrollTo({ left: container.clientWidth * index, behavior: 'smooth' });
  };
  const syncPageFromScroll = (event) => {
    const width = event.currentTarget.clientWidth;
    if (!width) return;
    const nextPage = Math.max(0, Math.min(tabs.length - 1, Math.round(event.currentTarget.scrollLeft / width)));
    setPage((current) => current === nextPage ? current : nextPage);
  };
  if (detail) return <Detail detail={detail} onBack={() => setSelectedId(null)} />;
  return <div className="min-h-[100dvh] overflow-x-hidden bg-[#10182b] text-slate-100"><main className="mx-auto w-full max-w-md px-5 pb-28 pt-5"><div className="flex items-center gap-2"><button type="button" onClick={onBack} className="rounded-xl p-2 text-slate-300 hover:bg-white/10" aria-label="ホームへ戻る"><ArrowLeft className="h-5 w-5" /></button><p className="flex-1 text-xs font-black tracking-[.2em] text-amber-300">GROWTH HISTORY</p><CalendarDays className="h-5 w-5 text-amber-300" /></div><nav className="growth-page-tabs mt-4 grid grid-cols-4" aria-label="成長記録ページ">{tabs.map((label, index) => <button key={label} type="button" onClick={() => goToPage(index)} aria-current={page === index ? 'page' : undefined} className={`growth-page-tab ${page === index ? 'is-active' : ''}`}>{label}</button>)}</nav><div ref={pagesRef} onScroll={syncPageFromScroll} className="growth-pages mt-5 flex snap-x snap-mandatory overflow-x-auto" aria-label="成長記録のページ"><section className="w-full min-w-full shrink-0 snap-start"><p className="text-xs font-black uppercase tracking-[.18em] text-amber-300">YOUR SUMMARY</p><h1 className="mt-1 text-2xl font-black">これまでの成長</h1><div className="mt-4"><Summary summary={summary} /></div></section><section className="w-full min-w-full shrink-0 snap-start"><Categories statistics={categories} /></section><section className="w-full min-w-full shrink-0 snap-start"><ActivityCalendar activity={activity} /></section><section className="w-full min-w-full shrink-0 snap-start"><HistoryList history={history} status={status} onStatus={setStatus} onSelect={setSelectedId} /></section></div></main></div>;
}
