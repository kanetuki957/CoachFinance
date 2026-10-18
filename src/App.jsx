import React, { useEffect, useRef, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import {
  ArrowLeft,
  Check,
  BarChart3,
  CircleDollarSign,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Home as HomeIcon,
  LockKeyhole,
  Package,
  RotateCw,
  Sparkles,
  Store,
  Target,
  Trophy,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { FinanceProvider, GOAL_CATEGORIES, getGoalTaskPlan, useFinance } from './context/FinanceContext';
import { TransactionForm } from './components/TransactionForm';
import { Onboarding } from './components/Onboarding';
import { PlayerStatusPanel } from './components/home/PlayerStatusPanel';
import { Shop } from './components/Shop';
import { RoomFurniture } from './components/room/RoomFurniture';
import { FurnitureInventory } from './components/room/FurnitureInventory';
import { ChallengeCreator } from './components/challenges/ChallengeCreator';
import { ActiveChallenges } from './components/challenges/ActiveChallenges';
import { GrowthHistory } from './components/challenges/GrowthHistory';
import { playCompletionSound } from './utils/playCompletionSound';
import { createGoalBgm } from './utils/createGoalBgm';
import { getCompletedTaskIds } from './domain/tasks/taskPlan';
import { getProductById, isProductImagePath } from './domain/shop/productCatalog';
import { getFurnitureOrientations, getGridFootprint, GRID_CELL_SIZE, isFurniturePlacementAvailable, isFurniturePlacementInAllowedZone, ROOM_GRID } from './domain/furniture/furnitureInventory';
import { getPlacementType } from './domain/room/placementZones';
import { getFootprintMarkerPolygons } from './domain/room/roomGrid';
import { getDepthOrder } from './domain/room/depthOrder';
import { resolveFurnitureSize } from './domain/room/furnitureSizing';
import companionRoom from './assets/rooms/companion-room.png';
import companionCharacter from './assets/characters/ChatGPT Image 2026年8月15日 10_43_54 (1).png';

const getDayNumber = (startedOn) => {
  const start = new Date(`${startedOn || new Date().toISOString().slice(0, 10)}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.min(Math.max(Math.floor((today - start) / 86400000) + 1, 1), 7);
};

const STATUS_LABELS = { knowledge: '知力', wealth: '運', strength: '体力' };

// Render-only lift for an actively positioned floor furniture item.
// Adjust this single value to change the apparent height above the floor.


const FURNITURE_FLOAT_OFFSET = 45;  //家具画像の浮く高さ調整
// These percentage values preserve the existing character position and make
// its floor contact available to the shared depth-order calculation.
const COMPANION_POSITION = { left: 47, bottom: 19, width: 10 };

const Companion = ({ isComplete, progress, placedFurniture = [], placement, onPlacementMove, onEditFurniture }) => {
  const roomRef = useRef(null);
  const drag = useRef(null);
  const pointInRoom = (event) => {
    const rect = roomRef.current.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * (320 / rect.width), y: (event.clientY - rect.top) * (320 / rect.height) };
  };
  const movePreview = (event) => {
    if (!drag.current || !placement) return;
    const point = pointInRoom(event);
    const footprint = getGridFootprint(placement.product, placement.orientation);
    onPlacementMove({ gridX: Math.min(Math.max(Math.round((point.x - drag.current.offsetX) / GRID_CELL_SIZE), 0), ROOM_GRID.columns - footprint.gridWidth), gridY: Math.min(Math.max(Math.round((point.y - drag.current.offsetY) / GRID_CELL_SIZE), 0), ROOM_GRID.rows - footprint.gridHeight) });
  };
  const startPreviewDrag = (event) => {
    if (!placement) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const point = pointInRoom(event);
    drag.current = { offsetX: point.x - placement.gridX * GRID_CELL_SIZE, offsetY: point.y - placement.gridY * GRID_CELL_SIZE };
  };
  const endPreviewDrag = (event) => {
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    drag.current = null;
  };
  const companionDepth = getDepthOrder({ floorContact: { x: COMPANION_POSITION.left, y: 100 - COMPANION_POSITION.bottom } });
  return (
  <div
    ref={roomRef}
    className="room-scene relative isolate z-0 mx-auto mt-3 aspect-square w-full max-w-[330px] overflow-hidden touch-manipulation"
    aria-label={isComplete ? '今日のクエストを達成したキャラクターの部屋' : 'キャラクターの部屋'}
  >
    <img src={companionRoom} alt="キャラクターの部屋" className="absolute inset-0 h-full w-full object-cover" />
      <RoomFurniture items={placement?.instanceId ? placedFurniture.filter((item) => item.instanceId !== placement.instanceId) : placedFurniture} onEdit={onEditFurniture} disabled={Boolean(placement)} />
    {placement && (() => {
      const footprint = getGridFootprint(placement.product, placement.orientation);
      const displaySize = resolveFurnitureSize(placement.product);
      const available = isFurniturePlacementAvailable(placedFurniture, placement.product.id, placement.gridX, placement.gridY, placement.orientation, placement.instanceId) && isFurniturePlacementInAllowedZone(placement.product.id, placement.gridX, placement.gridY, placement.orientation);
      const footprintMarkers = getPlacementType(placement.product) === 'floor'
        ? getFootprintMarkerPolygons({ gridX: placement.gridX, gridY: placement.gridY, gridWidth: footprint.gridWidth, gridHeight: footprint.gridHeight, columns: ROOM_GRID.columns, rows: ROOM_GRID.rows, footprintOffset: placement.product.footprintOffset })
        : [];
        const shouldFloat = getPlacementType(placement.product) === 'floor';
      return <>
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ zIndex: 2500 }}>
          {footprintMarkers.map((points, index) => <polygon key={index} points={points} fill={available ? 'rgba(125,211,252,.32)' : 'rgba(251,113,133,.40)'} stroke={available ? 'rgba(186,230,253,.60)' : 'rgba(251,113,133,.85)'} strokeWidth="0.35" />)}
        </svg>
        <div onPointerDown={startPreviewDrag} onPointerMove={movePreview} onPointerUp={endPreviewDrag} onPointerCancel={endPreviewDrag} className="absolute touch-none" style={{ left: `${(placement.gridX / ROOM_GRID.columns) * 100}%`, top: `${(placement.gridY / ROOM_GRID.rows) * 100}%`, width: `${(displaySize.width / 320) * 100}%`, height: `${(displaySize.height / 320) * 100}%`, zIndex: 3000 }}>
        <div className="h-full w-full transition-transform duration-150 ease-out" style={{ transform: shouldFloat ? `translateY(-${FURNITURE_FLOAT_OFFSET}px)` : undefined }}>
          {isProductImagePath(footprint.image) && <img src={footprint.image} alt="" className="h-full w-full object-contain opacity-80" />}
        </div>
    </div></>}
    )()}
    <img
      src={companionCharacter}
      alt="部屋にいるキャラクター"
      className={`pointer-events-none absolute -translate-x-1/2 transition-transform duration-700 ${isComplete ? 'scale-110' : 'animate-[pulse_3s_ease-in-out_infinite]'}`}
      style={{ left: `${COMPANION_POSITION.left}%`, bottom: `${COMPANION_POSITION.bottom}%`, width: `${COMPANION_POSITION.width}%`, zIndex: companionDepth }}
    />
    <div className="pointer-events-none absolute h-[3%] w-[18%] -translate-x-1/2 rounded-[100%] bg-slate-950/35 blur-sm" style={{ left: `${COMPANION_POSITION.left}%`, bottom: `${COMPANION_POSITION.bottom}%`, zIndex: companionDepth }} />
    <span className="absolute bottom-3 left-1/2 z-[2000] -translate-x-1/2 whitespace-nowrap rounded-full border border-white/15 bg-slate-950/70 px-3 py-1 text-[10px] font-black tracking-[0.18em] text-amber-200 backdrop-blur-sm">
      {isComplete ? 'QUEST CLEAR!' : `ENERGY ${progress}%`}
    </span>
  </div>
  );
};

const SelectedGoal = ({ goal }) => (
  <section className="mt-4 rounded-[1.75rem] border border-amber-300/20 bg-gradient-to-br from-amber-300/15 via-orange-400/5 to-slate-900 p-4 shadow-xl shadow-slate-950/30">
    <div className="flex items-center gap-2 text-xs font-bold text-amber-100">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-300/15 text-base">{goal.icon}</span>
      {goal.categoryName}
    </div>
    <div className="mt-3 flex gap-3">
      <Target className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
      <p className="text-base font-black leading-relaxed tracking-tight">{goal.title}</p>
    </div>
  </section>
);

const HomeOverview = ({ game, goal, onOpenQuest }) => (
  <>
  <section className="home-overview grid grid-cols-[minmax(0,1.4fr)_minmax(0,.9fr)]" aria-label="プレイヤーと現在の目標">
    <article className="home-status-panel min-w-0 rounded-2xl border border-white/10 bg-slate-900/80 shadow-xl shadow-slate-950/25">
      <div className="home-status-row">
        <div className="home-character-card flex shrink-0 flex-col items-center justify-end overflow-hidden rounded-xl border border-amber-300/25 bg-[#263c65]">
          <img src={companionCharacter} alt="現在のキャラクター" className="home-character-image w-auto object-contain" />
          <span className="home-character-level font-black text-amber-200">Lv.{game.level ?? 1}</span>
        </div>
        <dl className="home-stat-list min-w-0 text-center">
          {[['筋力', game.strength], ['知識', game.knowledge], ['財力', game.wealth]].map(([label, value]) => <div key={label} className="home-stat-card min-w-0 rounded-lg bg-slate-800/90"><dt className="home-stat-label truncate font-bold text-slate-400">{label}</dt><dd className="home-stat-value font-black text-amber-200">{value ?? 0}</dd></div>)}
        </dl>
      </div>
    </article>
    <article className="home-goal-card flex min-w-0 flex-col justify-between rounded-xl border border-amber-300/25 bg-gradient-to-br from-amber-300/15 to-slate-900 shadow-lg shadow-slate-950/20">
      <div><p className="text-[9px] font-black tracking-[.1em] text-amber-300 sm:text-[10px]">現在の目標</p>{goal ? <p className="mt-1 break-words text-xs font-black leading-snug text-slate-50 sm:text-sm">{goal.title}</p> : <p className="mt-2 text-xs font-black leading-snug text-slate-100">目標を設定しよう</p>}</div>
      {!goal && <button type="button" onClick={onOpenQuest} className="mt-2 rounded-lg bg-amber-300 px-2 py-1.5 text-[10px] font-black text-slate-950">クエストへ</button>}
    </article>
  </section>
  <section className="home-coin-balance" aria-label="所持コイン">
    <span className="flex min-w-0 items-center gap-2 text-slate-200"><CircleDollarSign className="home-coin-icon shrink-0 text-amber-300" aria-hidden="true" /><span className="truncate font-bold">所持コイン</span></span>
    <output className="home-coin-value">{Number(game.money ?? 0).toLocaleString()} <span className="home-coin-unit">C</span></output>
  </section>
  </>
);

const Home = ({
  section = 'home',
  openGoalSelector,
  onNavigate = () => {},
  // The former floating controls remain hidden while their JSX is retired.
  // Keep their callbacks defined so hidden JSX cannot abort the initial render.
  onOpenShop = () => {},
  onOpenChallenges = () => {},
  onOpenHistory = () => {},
}) => {
  const { activeGoal, completeTask, game, addDebugMoney, placeOwnedFurniture, saveFurniturePlacement, removePlacedFurniture } = useFinance();
  const [isMemoOpen, setIsMemoOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [memo, setMemo] = useState('');
  const [lastReward, setLastReward] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isBgmPlaying, setIsBgmPlaying] = useState(false);
  const [isFurnitureInventoryOpen, setIsFurnitureInventoryOpen] = useState(false);
  const [furniturePlacement, setFurniturePlacement] = useState(null);
  const bgmPlayer = useRef(null);
  const isQuest = section === 'quest';

  useEffect(() => () => bgmPlayer.current?.dispose(), []);

  const dayNumber = activeGoal ? getDayNumber(activeGoal.startedOn) : 1;
  const plan = activeGoal ? getGoalTaskPlan(activeGoal) ?? [] : [];
  const currentDay = plan[dayNumber - 1];
  const tasks = currentDay?.tasks ?? [];
  const completedTaskIds = getCompletedTaskIds(activeGoal, plan);
  const completedToday = tasks.filter((task) => completedTaskIds.has(task.id)).length;
  const remainingToday = Math.max(tasks.length - completedToday, 0);
  const todayProgress = tasks.length ? Math.round((completedToday / tasks.length) * 100) : 0;
  const allTasks = plan.flatMap((day) => day.tasks);
  const completedCount = completedTaskIds.size;
  const totalProgress = allTasks.length ? Math.min(Math.round((completedCount / allTasks.length) * 100), 100) : 0;
  const isTodayComplete = tasks.length > 0 && remainingToday === 0;

  const openMemo = (task) => {
    playCompletionSound();
    setMemo('');
    setSelectedTask(task);
    setIsMemoOpen(true);
  };

  const saveCompletion = () => {
    if (!selectedTask) return;
    const completion = completeTask(selectedTask.id, memo);
    if (completion?.reward) {
      setLastReward(completion.reward);
    }
    setIsMemoOpen(false);
    setSelectedTask(null);
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

  const startFurniturePlacement = (furnitureId) => {
    const product = getProductById(furnitureId);
    if (!product?.isFurniture) return { ok: false };
    const orientation = getFurnitureOrientations(product)[0].id;
    setFurniturePlacement({ product, gridX: 3, gridY: 5, orientation, instanceId: null });
    return { ok: true };
  };

  const confirmFurniturePlacement = () => {
    if (!furniturePlacement) return;
    const result = furniturePlacement.instanceId ? saveFurniturePlacement(furniturePlacement.instanceId, furniturePlacement) : placeOwnedFurniture(furniturePlacement.product.id, furniturePlacement);
    if (result.ok) setFurniturePlacement(null);
  };

  return (
    <div className={`home-screen home-screen-${section} min-h-[100dvh] overflow-x-hidden bg-[#10182b] text-slate-100`}>
      <main className="mx-auto w-full max-w-md px-5 pb-52 pt-5 sm:pb-36 lg:pb-28">
        {isQuest && <header className="mb-5 flex items-center justify-between gap-3">
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
        </header>}

        {!isQuest && <HomeOverview game={game} goal={activeGoal} onOpenQuest={() => onNavigate('quest')} />}
        {isQuest && <PlayerStatusPanel game={game} />}
        {isQuest && <div className="mt-4"><TransactionForm openOnMount={openGoalSelector} buttonClassName="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-emerald-950/30" buttonLabel="目標・今日のタスクを選ぶ" /></div>}

        {activeGoal ? (
          <>
            <section className="relative mt-4 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-[#263c65] to-[#172640] px-5 pb-5 pt-4 shadow-2xl shadow-slate-950/30" aria-label="キャラクターの部屋">
              <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-amber-300/10 blur-3xl" />
              {isQuest && <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-200">Today&apos;s adventure</p>
                  <p className="mt-1 text-sm font-bold text-slate-300">あと <span className="text-xl font-black text-amber-300">{remainingToday}</span> 個で今日のクエスト完了</p>
                </div>
                <Sparkles className="h-5 w-5 text-amber-300" />
              </div>}

              <Companion isComplete={isTodayComplete} progress={todayProgress} placedFurniture={game.placedFurniture} placement={furniturePlacement} onPlacementMove={(position) => setFurniturePlacement((current) => current ? { ...current, ...position } : current)} onEditFurniture={(item) => { const product = getProductById(item.furnitureId); if (product) setFurniturePlacement({ ...item, product }); }} />

              <div className="relative mt-2">
                <div className="flex items-center justify-between text-xs font-bold text-blue-100">
                  <span>今日の進捗</span>
                  <span>{completedToday} / {tasks.length} TASKS</span>
                </div>
                <div className="mt-2 h-4 overflow-hidden rounded-full border border-white/10 bg-slate-950/45 p-1">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-200 transition-all duration-700" style={{ width: `${todayProgress}%` }} />
                </div>
              </div>
            </section>

            {!isQuest && <button type="button" onClick={() => setIsFurnitureInventoryOpen(true)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-300/35 bg-amber-300 px-4 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-amber-950/30 transition hover:bg-amber-200"><Package className="h-5 w-5" />家具を配置・管理</button>}
            {isQuest && <SelectedGoal goal={activeGoal} />}

            {lastReward && (
              <div className="mt-3 rounded-2xl border border-emerald-300/25 bg-emerald-400/10 px-4 py-3 text-sm font-black text-emerald-100" role="status">
                <span>タスク完了！</span>
                {lastReward.statusType && <span className="ml-2">{STATUS_LABELS[lastReward.statusType]} +{lastReward.statusReward}</span>}
                <span className="ml-2 text-amber-200">¥{lastReward.moneyReward} GET</span>
              </div>
            )}

            <section className="mt-5">
              <div className="flex items-end justify-between">
                <div>
                  {/* <p className="text-xs font-black tracking-[0.18em] text-amber-300">今日やること</p> */}
                  <h2 className="mt-1 text-xl font-black">今日やること</h2>
                </div>
                <span className={`rounded-full px-3 py-1.5 text-xs font-black ${isTodayComplete ? 'bg-emerald-400/15 text-emerald-300' : 'bg-amber-300/15 text-amber-200'}`}>
                  {isTodayComplete ? 'すべて完了！' : `残り ${remainingToday} 個`}
                </span>
              </div>

              <div className="mt-3 space-y-3">
                {tasks.map((task, index) => {
                  const isDone = completedTaskIds.has(task.id);
                  const isCurrent = !isDone;
                  return (
                    <article key={task.id} className={`rounded-3xl border p-4 transition ${isDone ? 'border-emerald-400/20 bg-emerald-400/10' : 'border-amber-300/50 bg-slate-800 shadow-lg shadow-amber-950/20'}`}>
                      <div className="flex items-center gap-4">
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-black ${isDone ? 'bg-emerald-400 text-slate-950' : 'bg-amber-300 text-slate-950'}`}>
                          {isDone ? <Check className="h-5 w-5 stroke-[3]" /> : String(index + 1).padStart(2, '0')}
                        </span>
                        <div className="min-w-0 flex-1"><p className={`text-[15px] font-bold leading-relaxed ${isDone ? 'text-emerald-100 line-through decoration-emerald-400/60' : 'text-slate-50'}`}>{task.title}</p>{task.description && <p className="mt-1 text-xs font-medium text-slate-400">{task.description}</p>}</div>
                        {isCurrent ? (
                          <button onClick={() => openMemo(task)} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-300 text-slate-950 shadow-lg shadow-amber-400/15 transition hover:scale-105 hover:bg-amber-200" aria-label={`Complete ${task.title}`} title="Complete">
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
          <>
          {!isQuest && <section className="mt-4 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-[#263c65] to-[#172640] px-5 pb-5 pt-4 shadow-2xl shadow-slate-950/30">
            <Companion isComplete={false} progress={0} placedFurniture={game.placedFurniture} placement={furniturePlacement} onPlacementMove={(position) => setFurniturePlacement((current) => current ? { ...current, ...position } : current)} onEditFurniture={(item) => { const product = getProductById(item.furnitureId); if (product) setFurniturePlacement({ ...item, product }); }} />
          </section>}
          {!isQuest && <button type="button" onClick={() => setIsFurnitureInventoryOpen(true)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-300/35 bg-amber-300 px-4 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-amber-950/30 transition hover:bg-amber-200"><Package className="h-5 w-5" />家具を配置・管理</button>}
          {!isQuest && <section className="mt-5 rounded-3xl border border-dashed border-slate-600 bg-slate-900/70 p-5 text-center"><p className="text-xs font-black tracking-[.18em] text-amber-300">今日やること</p><p className="mt-2 text-sm font-bold text-slate-300">目標を設定すると、今日のタスクがここに表示されます。</p><button type="button" onClick={() => onNavigate('quest')} className="mt-4 rounded-xl bg-amber-300 px-4 py-2.5 text-sm font-black text-slate-950">クエストへ</button></section>}
          {isQuest && <section className="mt-16 rounded-[2rem] border border-dashed border-slate-600 bg-slate-900/70 p-8 text-center">
            <div className="text-5xl">🗺️</div>
            <h2 className="mt-4 text-xl font-black">冒険の目標を決めよう</h2>
            <p className="mt-3 text-sm font-bold leading-relaxed text-slate-400">右下の＋ボタンから目標を選ぶと、毎日のクエストが始まります。</p>
          </section>}
          </>
        )}
      </main>

      {import.meta.env.DEV && <button type="button" onClick={() => addDebugMoney(1000)} className="fixed right-4 top-4 z-40 rounded-lg border border-fuchsia-300/50 bg-fuchsia-500/20 px-3 py-2 text-xs font-black text-fuchsia-100 backdrop-blur" aria-label="デバッグ用に1000コインを追加">DEBUG +1,000</button>}
      <FurnitureInventory
        open={isFurnitureInventoryOpen}
        onClose={() => setIsFurnitureInventoryOpen(false)}
        ownedFurniture={game.ownedFurniture}
        placedFurniture={game.placedFurniture}
        onPlace={startFurniturePlacement}
      />
      {furniturePlacement && (() => {
        const orientations = getFurnitureOrientations(furniturePlacement.product);
        const available = isFurniturePlacementAvailable(game.placedFurniture, furniturePlacement.product.id, furniturePlacement.gridX, furniturePlacement.gridY, furniturePlacement.orientation, furniturePlacement.instanceId) && isFurniturePlacementInAllowedZone(furniturePlacement.product.id, furniturePlacement.gridX, furniturePlacement.gridY, furniturePlacement.orientation);
        const rotate = () => setFurniturePlacement((current) => {
          const list = getFurnitureOrientations(current.product);
          const index = list.findIndex((item) => item.id === current.orientation);
          return { ...current, orientation: list[(index + 1) % list.length].id };
        });
        return <div className="room-placement-actions fixed bottom-5 left-1/2 z-[60] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center gap-2 rounded-2xl border border-white/15 bg-slate-900/95 p-2 shadow-2xl backdrop-blur">
          {orientations.length > 1 && <button type="button" onClick={rotate} className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-amber-300" aria-label="向き変更"><RotateCw className="h-5 w-5" /></button>}
          <button type="button" onClick={() => furniturePlacement.instanceId ? removePlacedFurniture(furniturePlacement.instanceId) && setFurniturePlacement(null) : setFurniturePlacement(null)} className="rounded-xl px-3 py-3 text-xs font-black text-slate-200">{furniturePlacement.instanceId ? '収納' : 'キャンセル'}</button>
          <button type="button" disabled={!available} onClick={confirmFurniturePlacement} className="ml-auto rounded-xl bg-amber-300 px-5 py-3 text-xs font-black text-slate-950 disabled:bg-slate-600 disabled:text-slate-300">OK</button>
        </div>;
      })()}
      {isMemoOpen && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">Quest complete</p><h2 className="mt-1 text-xl font-black">完了を記録する</h2></div>
              <button onClick={() => setIsMemoOpen(false)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="閉じる"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-5 rounded-2xl bg-amber-300/10 p-4 text-sm font-bold leading-relaxed text-amber-50"><Check className="mr-2 inline h-5 w-5 text-amber-300" />{selectedTask.title}</div>
            <label className="mt-5 block text-sm font-bold" htmlFor="completion-memo">ひとことメモ（任意）</label>
            <textarea id="completion-memo" value={memo} onChange={(event) => setMemo(event.target.value)} placeholder="できたこと・気づいたことを残せます" className="mt-2 min-h-28 w-full resize-none rounded-2xl border border-slate-700 bg-slate-800 p-3 text-sm leading-relaxed text-white outline-none placeholder:text-slate-500 focus:border-amber-300" autoFocus />
            <button onClick={saveCompletion} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-300 py-3.5 font-black text-slate-950 transition hover:bg-amber-200"><Sparkles className="h-5 w-5" />完了して次のクエストへ<ChevronRight className="h-5 w-5" /></button>
          </div>
        </div>
      )}
      {false && <nav className="fixed bottom-5 left-4 right-4 z-40 flex flex-wrap items-center justify-between gap-2" aria-label="主要操作">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={onOpenShop} className="flex items-center gap-2 rounded-full bg-amber-300 px-4 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-amber-950/40 transition hover:scale-105 hover:bg-amber-200" aria-label="ショップを開く"><Store className="h-5 w-5" />SHOP</button>
          {activeGoal && <button type="button" onClick={() => setIsFurnitureInventoryOpen(true)} className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-slate-950/40 transition hover:scale-105 hover:bg-white" aria-label="家具インベントリを開く"><Package className="h-5 w-5" />家具</button>}
        </div>
        <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
          <TransactionForm openOnMount={openGoalSelector} buttonClassName="flex shrink-0 items-center gap-2 rounded-full bg-emerald-400 px-4 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-emerald-950/60 transition hover:scale-105 hover:bg-emerald-300" buttonLabel="今日のタスク" />
          <div className="flex shrink-0 items-center gap-2">
            <button onClick={onOpenHistory} className="flex items-center gap-2 rounded-full border border-white/15 bg-slate-900/95 px-4 py-3 text-sm font-black text-slate-100 shadow-lg shadow-slate-950/40 transition hover:scale-105 hover:bg-slate-800" aria-label="成長の記録を開く"><Trophy className="h-5 w-5 text-amber-300" />記録</button>
            <button onClick={onOpenChallenges} className="flex items-center gap-2 rounded-full bg-sky-300 px-4 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-slate-950/40 transition hover:scale-105 hover:bg-sky-200" aria-label="チャレンジを作成"><Target className="h-5 w-5" />CHALLENGE</button>
          </div>
        </div>
      </nav>}
      <Analytics />
    </div>
  );
};

export default function App() {
  return <FinanceProvider><AppContent /></FinanceProvider>;
}

const tabs = [
  { id: 'home', label: 'ホーム', Icon: HomeIcon },
  { id: 'quest', label: 'クエスト', Icon: ClipboardCheck },
  { id: 'challenge', label: 'チャレンジ', Icon: Target },
  { id: 'growth', label: '成長記録', Icon: BarChart3 },
  { id: 'shop', label: 'ショップ', Icon: Store },
];

function BottomNavigation({ active, onChange }) {
  return <nav className="app-bottom-nav" aria-label="メインナビゲーション">
    {tabs.map(({ id, label, Icon }) => <button key={id} type="button" onClick={() => onChange(id)} aria-current={active === id ? 'page' : undefined} className={`app-bottom-nav__item ${active === id ? 'is-active' : ''}`}>
      <Icon aria-hidden="true" className="h-5 w-5" />
      <span>{label}</span>
    </button>)}
  </nav>;
}

function QuestScreen({ onClose }) {
  const { selectGoal } = useFinance();
  const [selectedCategory, setSelectedCategory] = useState(null);

  const chooseGoal = (goal) => {
    if (!selectedCategory) return;
    selectGoal(selectedCategory, goal);
    onClose();
  };

  if (selectedCategory) return <div className="quest-screen min-h-[100dvh] bg-[#10182b] text-slate-100"><main className="mx-auto w-full max-w-md px-5 pb-28 pt-5">
    <header className="flex items-center gap-3"><button type="button" onClick={() => setSelectedCategory(null)} className="rounded-xl p-2 text-slate-300 transition hover:bg-white/10" aria-label="カテゴリー選択へ戻る"><ArrowLeft className="h-5 w-5" /></button><div className="min-w-0 flex-1"><p className="text-xs font-black tracking-[.18em] text-emerald-300">今回の目標</p><h1 className="mt-1 text-2xl font-black">{selectedCategory.name}</h1></div><button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-300 transition hover:bg-white/10" aria-label="閉じる"><X className="h-6 w-6" /></button></header>
    <section className="mt-6 space-y-2" aria-label={`${selectedCategory.name}の目標一覧`}>{selectedCategory.goals.map((goal) => <button key={goal.id} type="button" onClick={() => chooseGoal(goal)} className="w-full rounded-xl border border-slate-700 bg-slate-800/70 p-4 text-left text-sm font-bold leading-relaxed transition active:scale-[.98] hover:border-emerald-400 hover:bg-emerald-400/10">{goal.title}</button>)}</section>
  </main></div>;

  return <div className="quest-screen min-h-[100dvh] bg-[#10182b] text-slate-100"><main className="mx-auto w-full max-w-md px-5 pb-28 pt-5">
    <header className="flex items-start gap-3"><div className="min-w-0 flex-1"><p className="text-xs font-black tracking-[.18em] text-emerald-300">今回の目標</p><h1 className="mt-1 text-3xl font-black tracking-tight">カテゴリーを選ぶ</h1></div><button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-300 transition hover:bg-white/10" aria-label="閉じる"><X className="h-6 w-6" /></button></header>
    <section className="mt-7 space-y-3" aria-label="目標カテゴリー">{GOAL_CATEGORIES.map((category) => <button key={category.id} type="button" onClick={() => setSelectedCategory(category)} className="quest-category-card group flex w-full items-center gap-4 rounded-2xl border border-slate-700 bg-slate-800/80 p-4 text-left transition active:scale-[.98] hover:border-emerald-400/60 hover:bg-slate-800"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/10 text-2xl">{category.icon}</span><span className="min-w-0 flex-1 text-base font-black text-slate-50">{category.name}</span><ChevronRight className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-emerald-300" /></button>)}</section>
  </main></div>;
}

function ChallengeHub({ onCreate, onRetry }) {
  return <div className="min-h-[100dvh] bg-[#10182b] text-slate-100"><main className="mx-auto w-full max-w-md px-5 pb-28 pt-5">
    <header><h1 className="mt-1 text-2xl font-black">チャレンジ</h1><p className="mt-3 text-sm font-bold leading-relaxed text-slate-400">進行中の挑戦を記録し、達成・中断・再挑戦をここで管理できます。</p></header>
    <ActiveChallenges onCreate={onCreate} onRetry={onRetry} />
  </main></div>;
}

function AppContent() {
  const { profile, challenges } = useFinance();
  const [completedNow, setCompletedNow] = useState(false);
  const [screen, setScreen] = useState('home');
  const [retryChallengeId, setRetryChallengeId] = useState(null);
  const retrySource = challenges.find((challenge) => challenge.id === retryChallengeId) ?? null;
  if (!profile && !completedNow) return <Onboarding onComplete={() => setCompletedNow(true)} />;

  let page;
  if (screen === 'challenge-create') page = <ChallengeCreator onBack={() => setScreen('challenge')} />;
  else if (screen === 'challenge-retry' && retrySource) page = <ChallengeCreator retrySource={retrySource} onBack={() => setScreen('challenge')} />;
  else if (screen === 'quest') page = <QuestScreen onClose={() => setScreen('home')} />;
  else if (screen === 'growth') page = <GrowthHistory onBack={() => setScreen('home')} />;
  else if (screen === 'shop') page = <Shop onBack={() => setScreen('home')} />;
  else if (screen === 'challenge') page = <ChallengeHub onCreate={() => setScreen('challenge-create')} onRetry={(challenge) => { setRetryChallengeId(challenge.id); setScreen('challenge-retry'); }} />;
  else page = <Home
    section={screen}
    openGoalSelector={false}
    onNavigate={setScreen}
    onOpenShop={() => setScreen('shop')}
    onOpenChallenges={() => setScreen('challenge-create')}
    onOpenHistory={() => setScreen('growth')}
  />;

  return <div className="app-shell">{page}<BottomNavigation active={screen === 'challenge-create' || screen === 'challenge-retry' ? 'challenge' : screen} onChange={setScreen} /></div>;
}
