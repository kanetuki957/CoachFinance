import React, { useState } from 'react';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { FURNITURE_CATALOG } from '../domain/furniture/furnitureCatalog';
import { getOwnedFurnitureQuantity } from '../domain/furniture/furnitureInventory';
import { useFinance } from '../context/FinanceContext';

const RESULT_MESSAGES = {
  'insufficient-funds': '所持金が足りません',
  'not-available': '配置できる家具がありません',
};

export const Shop = ({ onBack }) => {
  const { game, buyFurniture, placeOwnedFurniture } = useFinance();
  const [message, setMessage] = useState('');
  const placedQuantity = (furnitureId) => game.placedFurniture.filter((item) => item.furnitureId === furnitureId).length;

  const purchase = (furnitureId) => {
    const result = buyFurniture(furnitureId);
    setMessage(result.ok ? `${result.furniture.name}を購入しました` : RESULT_MESSAGES[result.reason] ?? '購入できません');
  };

  const place = (furnitureId) => {
    const result = placeOwnedFurniture(furnitureId);
    setMessage(result.ok ? '部屋に配置しました。ホーム画面でドラッグして位置を変えられます。' : RESULT_MESSAGES[result.reason]);
  };

  return (
    <div className="min-h-[100dvh] bg-[#10182b] text-slate-100">
      <main className="mx-auto w-full max-w-md px-5 pb-10 pt-5">
        <header className="flex items-center gap-3">
          <button onClick={onBack} className="rounded-xl p-2 text-slate-300 transition hover:bg-white/10" aria-label="ホームに戻る"><ArrowLeft className="h-5 w-5" /></button>
          <div className="flex-1"><p className="text-[11px] font-black tracking-[0.22em] text-amber-300">FURNITURE SHOP</p><h1 className="mt-1 text-2xl font-black">ショップ</h1></div>
          <div className="rounded-2xl border border-amber-300/25 bg-amber-300/10 px-3 py-2 text-right"><span className="block text-[10px] font-black text-amber-200">所持金</span><span className="font-black text-amber-300">¥{game.money.toLocaleString()}</span></div>
        </header>

        {message && <p className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-3 text-sm font-bold text-emerald-100" role="status">{message}</p>}

        <section className="mt-5 space-y-3" aria-label="家具一覧">
          {FURNITURE_CATALOG.map((furniture) => (
            <article key={furniture.id} className="flex items-center gap-4 rounded-3xl border border-white/10 bg-slate-900/75 p-4 shadow-lg shadow-slate-950/20">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-800 text-4xl" aria-label={`${furniture.name}の画像`}>{furniture.image}</div>
              <div className="min-w-0 flex-1"><h2 className="font-black">{furniture.name}</h2><p className="mt-1 text-sm font-bold text-amber-300">¥{furniture.price.toLocaleString()}</p><p className="mt-1 text-[11px] font-bold text-slate-500">所持 × {getOwnedFurnitureQuantity(game.ownedFurniture, furniture.id)}</p></div>
              <button onClick={() => purchase(furniture.id)} className="rounded-xl bg-amber-300 px-3 py-2 text-xs font-black text-slate-950 transition hover:bg-amber-200">購入</button>
            </article>
          ))}
        </section>

        <section className="mt-6 rounded-3xl border border-white/10 bg-slate-900/70 p-4">
          <div className="flex items-center gap-2"><ShoppingBag className="h-5 w-5 text-emerald-300" /><h2 className="font-black">所持家具</h2><span className="ml-auto text-sm font-black text-emerald-300">{game.ownedFurniture.reduce((total, item) => total + item.quantity, 0)}</span></div>
          {game.ownedFurniture.length ? <div className="mt-4 space-y-2">{game.ownedFurniture.map(({ furnitureId, quantity }) => {
            const furniture = FURNITURE_CATALOG.find((item) => item.id === furnitureId);
            if (!furniture) return null;
            const placed = placedQuantity(furnitureId);
            const canPlace = placed < quantity;
            return <div key={furnitureId} className="flex items-center gap-3 rounded-2xl bg-slate-800/80 p-3"><span className="text-2xl">{furniture.image}</span><span className="flex-1 text-sm font-black">{furniture.name}</span><span className="text-xs font-black text-slate-400">× {quantity}<br />配置 {placed}</span><button disabled={!canPlace} onClick={() => place(furnitureId)} className="rounded-xl bg-emerald-400 px-3 py-2 text-xs font-black text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400">配置する</button></div>;
          })}</div> : <p className="mt-2 text-sm font-bold text-slate-400">まだ家具を持っていません。</p>}
        </section>
      </main>
    </div>
  );
};
