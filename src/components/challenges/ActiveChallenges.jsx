import React, { useRef, useState } from 'react';
import { Check, ChevronDown, ChevronRight, CircleDollarSign, Gift, Package, Plus, Sparkles, Trophy, X } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { findChallengeTemplate } from '../../domain/challenges/challengeCatalog';
import { getActiveChallenges } from '../../domain/challenges/challengeManagement';
import { calculateChallengeProgress, getChallengeProgressPercent } from '../../domain/challenges/challengeProgress';
import { getProductById, isProductImagePath } from '../../domain/shop/productCatalog';

const unitLabels = { reps: '回', minutes: '分', pages: 'ページ', questions: '問', days: '日', times: '回' };
const difficultyLabels = { easy: 'EASY', normal: 'NORMAL', hard: 'HARD' };
const statusLabels = { completed: '達成', failed: '失敗', cancelled: '中断' };

const localToday = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const dateTime = (value) => value ? new Intl.DateTimeFormat('ja-JP', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—';
const errorText = (reason) => ({
  'max-per-day': '今日はすでに上限まで記録しています。',
  'invalid-numeric-value': '正の整数を入力してください。',
  'not-active': 'このチャレンジは進行中ではありません。',
  'outside-challenge-period': 'チャレンジ期間外です。',
  'invalid-record-date': '過去の日付は記録できません。',
}[reason] ?? '記録できませんでした。');

function ProductImage({ product, className = 'h-20 w-20' }) {
  if (!product) return null;
  return isProductImagePath(product.image)
    ? <img src={product.image} alt={product.name} className={`${className} object-contain`} />
    : <span className="text-5xl">{product.image}</span>;
}

function Reward({ reward, prefix = '' }) {
  const product = reward?.type === 'furniture' ? getProductById(reward.productId) : null;
  if (reward?.type === 'coins') return <span>{prefix}+{reward.amount}コイン</span>;
  return <span>{prefix}{product?.name ?? 'POCO家具'}</span>;
}

function ChallengeCard({ challenge, completions, onCompleted, onRequestCancel }) {
  const { recordChallengeActivity } = useFinance();
  const [value, setValue] = useState('');
  const [result, setResult] = useState(null);
  const [pending, setPending] = useState(false);
  const pendingRef = useRef(false);
  const template = findChallengeTemplate(challenge.goalId);
  const progress = calculateChallengeProgress(challenge, completions);
  const percent = getChallengeProgressPercent(challenge, completions);
  const recordedToday = completions.some((item) => item.challengeId === challenge.id && item.localDate === localToday());

  const submit = (rawValue) => {
    if (pendingRef.current) return;
    pendingRef.current = true;
    setPending(true);
    const response = recordChallengeActivity(challenge.id, challenge.recordType === 'numeric' ? Number(rawValue) : undefined);
    pendingRef.current = false;
    setPending(false);
    if (!response.ok) {
      setResult({ error: errorText(response.reason) });
      return;
    }
    setValue('');
    setResult({ normal: response.normalReward, completion: response.completionReward });
    if (response.achieved) onCompleted({ challenge: response.challenge, progress: response.progress, completionReward: response.completionReward });
  };

  return (
    <article className="rounded-3xl border border-white/10 bg-slate-900/75 p-4 shadow-xl shadow-slate-950/20">
      <div className="flex items-start gap-3">
        <span className={`rounded-xl px-2 py-1 text-[10px] font-black ${challenge.difficulty === 'hard' ? 'bg-rose-400/20 text-rose-200' : challenge.difficulty === 'normal' ? 'bg-sky-400/20 text-sky-200' : 'bg-emerald-400/20 text-emerald-200'}`}>{difficultyLabels[challenge.difficulty]}</span>
        <div className="min-w-0 flex-1">
          <h3 className="font-black leading-snug">{template?.title ?? challenge.goalId}</h3>
          <p className="mt-1 text-xs font-bold text-slate-400">終了日: {challenge.endDate} ・ 報酬: <Reward reward={challenge.selectedReward} /></p>
        </div>
      </div>
      <div className="mt-4 flex justify-between text-sm font-black"><span>{progress} / {challenge.targetValue}{unitLabels[challenge.unit] ?? ` ${challenge.unit}`}</span><span className="text-amber-200">{Math.round(percent)}%</span></div>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-200 transition-all" style={{ width: `${percent}%` }} /></div>
      {challenge.recordType === 'checkbox' ? (
        <button type="button" disabled={recordedToday || pending} onClick={() => submit()} className="mt-4 w-full rounded-2xl bg-amber-300 py-3 font-black text-slate-950 disabled:bg-slate-700 disabled:text-slate-400">
          {recordedToday ? <><Check className="mr-1 inline h-5 w-5" />今日の行動を記録済み</> : '今日の行動を完了'}
        </button>
      ) : (
        <div className="mt-4 flex gap-2"><input inputMode="numeric" value={value} onChange={(event) => setValue(event.target.value)} placeholder={`例: 20 ${unitLabels[challenge.unit] ?? ''}`} className="min-w-0 flex-1 rounded-2xl border border-white/15 bg-slate-800 px-4 py-3 font-bold outline-none focus:border-amber-300" /><button type="button" disabled={!value || pending} onClick={() => submit(value)} className="shrink-0 rounded-2xl bg-amber-300 px-4 py-3 font-black text-slate-950 disabled:bg-slate-700 disabled:text-slate-400">記録する</button></div>
      )}
      {result && <div className={`mt-3 rounded-2xl px-3 py-2 text-sm font-bold ${result.error ? 'bg-rose-400/10 text-rose-100' : 'bg-emerald-400/10 text-emerald-100'}`}>{result.error ? result.error : <><span>今回: +{result.normal?.coinsEarned ?? 0}コイン / ステータス+{result.normal?.statusEarned ?? 0}</span>{result.completion && <span className="ml-2 text-amber-200"><Sparkles className="inline h-4 w-4" />達成報酬を付与しました</span>}</>}</div>}
      <div className="mt-4 border-t border-white/10 pt-3 text-right"><button type="button" onClick={() => onRequestCancel(challenge)} className="rounded-xl px-3 py-2 text-xs font-bold text-slate-400 hover:bg-rose-400/10 hover:text-rose-200">中断する</button></div>
    </article>
  );
}

function CompletionModal({ outcome, onClose }) {
  if (!outcome) return null;
  const { challenge, progress, completionReward } = outcome;
  const template = findChallengeTemplate(challenge.goalId);
  const reward = completionReward?.reward;
  const product = reward?.type === 'furniture' ? getProductById(reward.productId) : null;
  return <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/80 p-4 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-label="チャレンジ達成">
    <div className="w-full max-w-sm overflow-hidden rounded-[2rem] border border-amber-200/40 bg-gradient-to-b from-amber-300/25 to-slate-900 p-6 text-center shadow-2xl">
      <Trophy className="mx-auto h-12 w-12 text-amber-200" /><p className="mt-3 text-xs font-black tracking-[.2em] text-amber-200">CHALLENGE COMPLETE</p><h2 className="mt-2 text-2xl font-black">チャレンジ達成！</h2><p className="mt-2 font-bold text-slate-200">{template?.title ?? challenge.goalId}</p>
      <div className="mt-5 rounded-2xl bg-slate-950/45 p-4 text-sm"><p>{difficultyLabels[challenge.difficulty]} ・ {progress} / {challenge.targetValue}{unitLabels[challenge.unit] ?? ''}</p><p className="mt-1 text-xs text-slate-300">達成日時: {dateTime(challenge.completedAt)}</p></div>
      {reward?.type === 'coins' && <p className="mt-5 text-lg font-black text-amber-200">達成報酬：<Reward reward={reward} /></p>}
      {reward?.type === 'furniture' && <div className="mt-5 rounded-2xl bg-white/10 p-4"><div className="flex justify-center"><ProductImage product={product} /></div><p className="mt-2 font-black">{product?.name ?? reward.productId}</p><p className="mt-1 text-sm text-amber-200">POCO家具を獲得しました</p></div>}
      {!reward && <p className="mt-5 text-sm font-bold text-rose-200">達成結果は保存しましたが、達成報酬の付与を確認できませんでした。</p>}
      <button type="button" onClick={onClose} className="mt-6 w-full rounded-2xl bg-amber-300 py-3 font-black text-slate-950">閉じる</button>
    </div>
  </div>;
}

function CancelModal({ challenge, stage, onClose, onContinue, onConfirm, message }) {
  if (!challenge) return null;
  return <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/80 p-4 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-label="チャレンジを中断">
    <div className="w-full max-w-sm rounded-[2rem] border border-white/10 bg-slate-900 p-6 shadow-2xl"><button type="button" onClick={onClose} className="float-right rounded-xl p-2 text-slate-400 hover:bg-white/10" aria-label="閉じる"><X className="h-5 w-5" /></button><p className="text-xs font-black tracking-[.18em] text-rose-200">CANCEL CHALLENGE</p><h2 className="mt-2 text-xl font-black">{stage === 1 ? 'このチャレンジを中断しますか？' : '本当に中断しますか？'}</h2>{stage === 1 ? <ul className="mt-5 space-y-2 text-sm leading-relaxed text-slate-300"><li>・現在の進捗は終了時の記録として残ります。</li><li>・獲得済みの通常コイン・ステータスは維持されます。</li><li>・達成報酬は受け取れません。</li><li>・中断後は再開できませんが、新しい挑戦は可能です。</li></ul> : <p className="mt-5 rounded-2xl bg-rose-400/10 p-4 text-sm font-bold text-rose-100">この操作は取り消せません。</p>}{message && <p className="mt-4 text-sm font-bold text-rose-200">{message}</p>}<div className="mt-6 flex gap-3"><button type="button" onClick={onClose} className="flex-1 rounded-2xl bg-white/10 py-3 font-black">戻る</button><button type="button" onClick={stage === 1 ? onContinue : onConfirm} className="flex-1 rounded-2xl bg-rose-400 py-3 font-black text-slate-950">{stage === 1 ? '次へ' : '中断する'}</button></div></div>
  </div>;
}

function ChallengeResults({ challenges, completions, claims, onRetry }) {
  const [open, setOpen] = useState(false);
  const terminal = challenges.filter((challenge) => ['completed', 'failed', 'cancelled'].includes(challenge.status)).slice().reverse();
  if (!terminal.length) return null;
  return <section className="mt-4 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70"><button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full items-center gap-3 p-4 text-left" aria-expanded={open}><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-300/10 text-sky-200"><Trophy className="h-5 w-5" /></span><span className="flex-1"><span className="block text-sm font-black">チャレンジ結果</span><span className="block text-xs font-bold text-slate-400">{terminal.length} 件の終了済みチャレンジ</span></span><ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} /></button>{open && <div className="space-y-3 border-t border-white/10 p-3">{terminal.map((challenge) => { const template = findChallengeTemplate(challenge.goalId); const progress = calculateChallengeProgress(challenge, completions); const percent = getChallengeProgressPercent(challenge, completions); const endedAt = challenge.completedAt ?? challenge.failedAt ?? challenge.cancelledAt; const claimed = challenge.rewardClaimed || claims.some((claim) => claim.challengeId === challenge.id); return <article key={challenge.id} className="rounded-2xl bg-slate-800/70 p-3"><div className="flex justify-between gap-2"><div><p className="font-black">{template?.title ?? challenge.goalId}</p><p className="mt-1 text-xs font-bold text-slate-400">{challenge.startDate} 〜 {challenge.endDate} ・ 終了: {dateTime(endedAt)}</p></div><span className={`h-fit rounded-full px-2 py-1 text-[10px] font-black ${challenge.status === 'completed' ? 'bg-emerald-400/15 text-emerald-200' : challenge.status === 'failed' ? 'bg-rose-400/15 text-rose-200' : 'bg-slate-600 text-slate-200'}`}>{statusLabels[challenge.status]}</span></div><p className="mt-3 text-sm font-bold">最終進捗: {progress} / {challenge.targetValue}{unitLabels[challenge.unit] ?? ''}（{Math.round(percent)}%）</p><p className="mt-1 text-xs font-bold text-slate-400">達成報酬: {claimed ? '獲得済み' : '未獲得'}</p>{['failed', 'cancelled'].includes(challenge.status) && <button type="button" onClick={() => onRetry(challenge)} className="mt-3 rounded-xl bg-sky-300 px-3 py-2 text-xs font-black text-slate-950">もう一度挑戦する</button>}</article>; })}</div>}</section>;
}

export function ActiveChallenges({ onCreate, onRetry }) {
  const { challenges, challengeCompletions, challengeRewardClaims, cancelChallenge } = useFinance();
  const [outcome, setOutcome] = useState(null);
  const [cancelState, setCancelState] = useState(null);
  const cancelLock = useRef(false);
  const active = getActiveChallenges(challenges).slice(0, 3);
  const confirmCancel = () => {
    if (!cancelState || cancelLock.current) return;
    cancelLock.current = true;
    const result = cancelChallenge(cancelState.challenge.id);
    cancelLock.current = false;
    if (result.ok) setCancelState(null);
    else setCancelState((current) => current ? { ...current, message: '状態が変更されたため中断できませんでした。' } : null);
  };
  return <><section className="mt-7"><div className="flex items-end justify-between"><div><p className="text-xs font-black uppercase tracking-[.18em] text-sky-300">Active challenges</p><h2 className="mt-1 text-xl font-black">進行中のチャレンジ</h2></div>{active.length < 3 && <button type="button" onClick={onCreate} className="flex items-center gap-1 rounded-xl bg-sky-300 px-3 py-2 text-xs font-black text-slate-950"><Plus className="h-4 w-4" />作成</button>}</div>{active.length ? <div className="mt-3 space-y-3">{active.map((challenge) => <ChallengeCard key={challenge.id} challenge={challenge} completions={challengeCompletions} onCompleted={setOutcome} onRequestCancel={(item) => setCancelState({ challenge: item, stage: 1, message: null })} />)}</div> : <div className="mt-3 rounded-3xl border border-dashed border-slate-600 bg-slate-900/70 p-6 text-center"><CircleDollarSign className="mx-auto h-7 w-7 text-sky-300" /><p className="mt-3 font-black">進行中のチャレンジはありません</p><p className="mt-1 text-sm font-bold text-slate-400">新しい行動をチャレンジとして始めましょう。</p><button type="button" onClick={onCreate} className="mt-4 rounded-2xl bg-sky-300 px-5 py-3 font-black text-slate-950">チャレンジを作成 <ChevronRight className="inline h-4 w-4" /></button></div>}</section><ChallengeResults challenges={challenges} completions={challengeCompletions} claims={challengeRewardClaims} onRetry={onRetry} /><CompletionModal outcome={outcome} onClose={() => setOutcome(null)} /><CancelModal challenge={cancelState?.challenge} stage={cancelState?.stage} message={cancelState?.message} onClose={() => setCancelState(null)} onContinue={() => setCancelState((current) => current ? { ...current, stage: 2 } : null)} onConfirm={confirmCancel} /></>;
}
