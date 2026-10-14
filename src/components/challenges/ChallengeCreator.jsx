import React, { useMemo, useRef, useState } from 'react';
import { ArrowLeft, Check, ChevronRight, CircleDollarSign, Gift, Lock, Package, Sparkles } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { CHALLENGE_DIFFICULTY_REWARDS, CHALLENGE_TEMPLATES, findChallengeTemplate } from '../../domain/challenges/challengeCatalog';
import { PRODUCT_CATALOG, isProductImagePath } from '../../domain/shop/productCatalog';
import { getFurnitureById } from '../../domain/furniture/furnitureCatalog';

const categoryLabels = { strength: '筋トレ・運動', knowledge: '勉強', wealth: '生活習慣' };
const difficultyLabels = { easy: 'EASY', normal: 'NORMAL', hard: 'HARD' };
const dateKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const endDateFor = (template) => { const date = new Date(`${dateKey()}T00:00:00`); date.setDate(date.getDate() + template.durationDays - 1); return dateKey(date); };
const conditionFor = (template) => `${template.progressType === 'sum' ? '合計' : template.progressType === 'streak' ? '連続' : '回数'} ${template.targetValue} ${template.unit}`;
const errorMessage = (reason) => ({ 'max-active-challenges': '進行中のチャレンジは最大3件です。', 'duplicate-active-goal': 'この目標はすでに進行中です。', 'invalid-reward': '報酬を選択してください。', 'invalid-furniture-product': 'この家具は報酬条件を満たしていません。', 'furniture-price-limit': 'この家具は価格上限を超えています。' }[reason] ?? '開始できませんでした。もう一度確認してください。');

const ProductImage = ({ product }) => isProductImagePath(product.image)
  ? <img src={product.image} alt={product.name} className="h-20 w-20 object-contain" />
  : <span className="text-5xl">{product.image}</span>;

export const ChallengeCreator = ({ onBack, retrySource = null }) => {
  const { challenges, startChallenge, retryChallenge } = useFinance();
  const retryTemplate = retrySource ? findChallengeTemplate(retrySource.goalId) : null;
  const initialFurniture = retrySource?.selectedReward?.type === 'furniture'
    ? PRODUCT_CATALOG.find((product) => product.id === retrySource.selectedReward.productId) ?? null
    : null;
  const [step, setStep] = useState(retryTemplate ? 3 : 1);
  const [category, setCategory] = useState('all');
  const [template, setTemplate] = useState(retryTemplate);
  const [rewardType, setRewardType] = useState(retrySource?.selectedReward?.type ?? 'coins');
  const [furniture, setFurniture] = useState(initialFurniture);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const startLock = useRef(false);
  const active = challenges.filter((item) => item.status === 'active');
  const activeGoalIds = new Set(active.map((item) => item.goalId));
  const templates = CHALLENGE_TEMPLATES.filter((item) => category === 'all' || item.category === category);
  const config = template ? CHALLENGE_DIFFICULTY_REWARDS[template.difficulty.toUpperCase()] : null;
  const furnitureOptions = useMemo(() => !config ? [] : PRODUCT_CATALOG.filter((product) => product.isFurniture && getFurnitureById(product.id) && product.price <= config.furniturePriceLimit), [config]);
  const selectedReward = !template ? null : rewardType === 'coins'
    ? { type: 'coins', amount: config.bonusCoins }
    : furniture ? { type: 'furniture', productId: furniture.id, quantity: 1, priceAtSelection: furniture.price } : null;
  const chooseTemplate = (item) => { if (active.length >= 3 || activeGoalIds.has(item.id)) return; setTemplate(item); setFurniture(null); setMessage(null); setStep(2); };
  const begin = () => {
    if (!template || !selectedReward || submitting || startLock.current) return;
    startLock.current = true;
    setSubmitting(true);
    const result = retrySource
      ? retryChallenge(retrySource.id, selectedReward)
      : startChallenge(template.id, selectedReward);
    setSubmitting(false);
    startLock.current = false;
    if (result.ok) setMessage({ success: true, text: 'チャレンジを開始しました！' });
    else setMessage({ success: false, text: errorMessage(result.reason) });
  };
  const back = () => { setMessage(null); setStep((current) => Math.max(1, current - 1)); };
  return <div className="min-h-[100dvh] bg-[#10182b] text-slate-100"><main className="mx-auto w-full max-w-md px-5 pb-10 pt-5">
    <header className="flex items-center gap-3"><button type="button" onClick={step === 1 || retryTemplate ? onBack : back} className="rounded-xl p-2 text-slate-200 hover:bg-white/10" aria-label="戻る"><ArrowLeft className="h-5 w-5" /></button><div className="flex-1"><p className="text-[10px] font-black tracking-[.2em] text-amber-300">CHALLENGE</p><h1 className="text-2xl font-black">{retryTemplate ? 'もう一度挑戦する' : '新しいチャレンジ'}</h1></div><span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black">{step} / 4</span></header>
    <div className="mt-5 flex gap-1">{[1, 2, 3, 4].map((value) => <span key={value} className={`h-1.5 flex-1 rounded-full ${value <= step ? 'bg-amber-300' : 'bg-slate-700'}`} />)}</div>
    {message && <section className={`mt-5 rounded-2xl border p-4 ${message.success ? 'border-emerald-300/40 bg-emerald-400/10 text-emerald-100' : 'border-rose-300/40 bg-rose-400/10 text-rose-100'}`}><p className="font-black">{message.text}</p>{message.success && <button type="button" onClick={onBack} className="mt-3 rounded-xl bg-emerald-300 px-4 py-2 text-sm font-black text-slate-950">ホームに戻る</button>}</section>}
    {step === 1 && <><p className="mt-6 text-sm font-bold text-slate-300">目標を選択してください。進行中は {active.length} / 3 件です。</p><div className="mt-4 flex gap-2 overflow-x-auto">{[['all', 'すべて'], ...Object.entries(categoryLabels)].map(([id, label]) => <button key={id} type="button" onClick={() => setCategory(id)} className={`shrink-0 rounded-full px-3 py-2 text-xs font-black ${category === id ? 'bg-amber-300 text-slate-950' : 'bg-white/10 text-slate-300'}`}>{label}</button>)}</div><div className="mt-4 space-y-3">{templates.map((item) => { const blocked = active.length >= 3 || activeGoalIds.has(item.id); return <button key={item.id} type="button" disabled={blocked} onClick={() => chooseTemplate(item)} className="w-full rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-left disabled:opacity-45"><div className="flex gap-3"><TargetBadge difficulty={item.difficulty} /><div className="min-w-0 flex-1"><h2 className="font-black leading-snug">{item.title}</h2><p className="mt-1 text-xs font-bold text-slate-400">{difficultyLabels[item.difficulty]} ・ {item.durationDays}日 ・ {conditionFor(item)}</p><p className="mt-1 text-xs text-slate-400">{item.recordType === 'checkbox' ? 'チェック式' : '数値入力式'}</p></div>{blocked ? <Lock className="h-5 w-5 text-slate-500" /> : <ChevronRight className="h-5 w-5 text-amber-300" />}</div></button>; })}</div></>}
    {step === 2 && template && <Detail template={template} config={config} onNext={() => setStep(3)} />}
    {step === 3 && template && <><section className="mt-6"><p className="text-xs font-black tracking-[.18em] text-amber-300">STEP 3</p><h2 className="mt-1 text-xl font-black">達成報酬を選択</h2><div className="mt-4 grid grid-cols-2 gap-3"><button type="button" onClick={() => { setRewardType('coins'); setFurniture(null); }} className={`rounded-2xl border p-4 text-left ${rewardType === 'coins' ? 'border-amber-300 bg-amber-300/10' : 'border-white/10 bg-slate-900'}`}><CircleDollarSign className="h-6 w-6 text-amber-300" /><p className="mt-3 font-black">コイン</p><p className="text-sm text-slate-300">{config.bonusCoins} コイン</p></button><button type="button" onClick={() => setRewardType('furniture')} className={`rounded-2xl border p-4 text-left ${rewardType === 'furniture' ? 'border-amber-300 bg-amber-300/10' : 'border-white/10 bg-slate-900'}`}><Gift className="h-6 w-6 text-amber-300" /><p className="mt-3 font-black">POCO家具</p><p className="text-sm text-slate-300">{config.furniturePriceLimit} コイン以下</p></button></div></section>{rewardType === 'furniture' && <section className="mt-5"><p className="text-sm font-black">家具を1点選択</p><div className="mt-3 grid grid-cols-2 gap-3">{furnitureOptions.map((product) => <button key={product.id} type="button" onClick={() => setFurniture(product)} className={`rounded-2xl border p-3 text-left ${furniture?.id === product.id ? 'border-amber-300 bg-amber-300/10' : 'border-white/10 bg-slate-900'}`}><div className="flex h-24 items-center justify-center"><ProductImage product={product} /></div><p className="mt-2 text-sm font-black">{product.name}</p><p className="text-xs text-amber-200">{product.price} コイン</p>{furniture?.id === product.id && <Check className="mt-2 h-4 w-4 text-amber-300" />}</button>)}</div></section>}<button type="button" disabled={!selectedReward} onClick={() => setStep(4)} className="mt-6 w-full rounded-2xl bg-amber-300 py-4 font-black text-slate-950 disabled:bg-slate-600 disabled:text-slate-300">確認へ進む <ChevronRight className="inline h-5 w-5" /></button></>}
    {step === 4 && template && <section className="mt-6 rounded-3xl border border-white/10 bg-slate-900/80 p-5"><p className="text-xs font-black tracking-[.18em] text-amber-300">FINAL CHECK</p><h2 className="mt-2 text-xl font-black">{template.title}</h2><dl className="mt-5 space-y-3 text-sm"><Row label="難易度" value={difficultyLabels[template.difficulty]} /><Row label="開始日" value={dateKey()} /><Row label="終了日" value={endDateFor(template)} /><Row label="達成条件" value={conditionFor(template)} /><Row label="報酬" value={rewardType === 'coins' ? `${config.bonusCoins} コイン` : furniture ? `${furniture.name}（${furniture.price} コイン）` : '未選択'} /></dl><button type="button" disabled={!selectedReward || submitting || message?.success} onClick={begin} className="mt-6 w-full rounded-2xl bg-amber-300 py-4 font-black text-slate-950 disabled:bg-slate-600">{submitting ? '開始中…' : 'チャレンジを開始する'} <Sparkles className="inline h-5 w-5" /></button></section>}
  </main></div>;
};

const TargetBadge = ({ difficulty }) => <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-[10px] font-black ${difficulty === 'hard' ? 'bg-rose-400/20 text-rose-200' : difficulty === 'normal' ? 'bg-sky-400/20 text-sky-200' : 'bg-emerald-400/20 text-emerald-200'}`}>{difficulty.toUpperCase().slice(0, 1)}</span>;
const Row = ({ label, value }) => <div className="flex justify-between gap-4 border-b border-white/10 pb-3"><dt className="font-bold text-slate-400">{label}</dt><dd className="text-right font-black">{value}</dd></div>;
const Detail = ({ template, config, onNext }) => <section className="mt-6 rounded-3xl border border-white/10 bg-slate-900/80 p-5"><p className="text-xs font-black tracking-[.18em] text-amber-300">STEP 2</p><h2 className="mt-2 text-xl font-black">{template.title}</h2><dl className="mt-5 space-y-3 text-sm"><Row label="難易度" value={difficultyLabels[template.difficulty]} /><Row label="期間" value={`${template.durationDays}日間`} /><Row label="達成条件" value={conditionFor(template)} /><Row label="記録方式" value={template.recordType === 'checkbox' ? 'チェック式' : '数値入力式'} /></dl><div className="mt-5 rounded-2xl bg-amber-300/10 p-4 text-sm"><p className="font-black text-amber-200">通常報酬</p><p className="mt-1 text-slate-200">同一目標につき1日1回、50コインとカテゴリステータス+5。</p><p className="mt-1 text-xs text-slate-400">達成時は {config.bonusCoins}コイン、または上限{config.furniturePriceLimit}コインの家具を選べます。</p></div><button type="button" onClick={onNext} className="mt-6 w-full rounded-2xl bg-amber-300 py-4 font-black text-slate-950">報酬を選ぶ <ChevronRight className="inline h-5 w-5" /></button></section>;
