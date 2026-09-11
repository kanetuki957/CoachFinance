import React, { useMemo, useState } from 'react';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { SHOP_CATEGORIES, PRODUCT_CATALOG, getProductById } from '../domain/shop/productCatalog';
import { getOwnedProductQuantity } from '../domain/shop/productInventory';
import { getOwnedFurnitureQuantity } from '../domain/furniture/furnitureInventory';
import { useFinance } from '../context/FinanceContext';

const RESULT_MESSAGES = {
  'insufficient-funds': '所持金が足りません',
  'not-available': '配置できるアイテムがありません',
};

export const Shop = ({ onBack }) => {
  const { game, buyProduct, placeOwnedFurniture } = useFinance();
  const [selectedCategory, setSelectedCategory] = useState('item');
  const [message, setMessage] = useState('');

  // 選択中のカテゴリだけを表示し、スマートフォンでも商品を探しやすくする。
  const products = useMemo(
    () => PRODUCT_CATALOG.filter((product) => product.category === selectedCategory),
    [selectedCategory],
  );
  const selectedCategoryData = SHOP_CATEGORIES.find((category) => category.id === selectedCategory);

  const purchase = (productId) => {
    const result = buyProduct(productId);
    setMessage(result.ok ? `${result.product.name}を購入しました` : RESULT_MESSAGES[result.reason] ?? '購入できません');
  };

  const place = (furnitureId) => {
    const result = placeOwnedFurniture(furnitureId);
    setMessage(result.ok ? '部屋に配置しました。ホーム画面で位置を変更できます。' : RESULT_MESSAGES[result.reason]);
  };

  return (
    <div className="min-h-[100dvh] bg-[#10182b] text-slate-100">
      <main className="mx-auto w-full max-w-md px-4 pb-10 pt-5 sm:px-5">
        <header className="flex items-center gap-3">
          <button onClick={onBack} className="rounded-xl p-2 text-slate-300 transition hover:bg-white/10" aria-label="ホームに戻る"><ArrowLeft className="h-5 w-5" /></button>
          <div className="flex-1"><p className="text-[11px] font-black tracking-[0.22em] text-amber-300">SHOP</p><h1 className="mt-1 text-2xl font-black">ショップ</h1></div>
          <div className="rounded-2xl border border-amber-300/25 bg-amber-300/10 px-3 py-2 text-right"><span className="block text-[10px] font-black text-amber-200">所持金</span><span className="font-black text-amber-300">¥{game.money.toLocaleString()}</span></div>
        </header>

        <section className="mt-5 grid grid-cols-4 gap-2" aria-label="ショップカテゴリ">
          {SHOP_CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category.id;
            return <button key={category.id} type="button" onClick={() => { setSelectedCategory(category.id); setMessage(''); }} aria-pressed={isSelected} className={`flex min-h-20 flex-col items-center justify-center rounded-2xl border px-1 py-2 transition ${isSelected ? 'border-amber-300 bg-amber-300 text-slate-950 shadow-lg shadow-amber-950/30' : 'border-white/10 bg-slate-900/70 text-slate-300 hover:bg-slate-800'}`}><span className="text-2xl" aria-hidden="true">{category.icon}</span><span className="mt-1 text-xs font-black">{category.name}</span></button>;
          })}
        </section>

        {message && <p className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-3 text-sm font-bold text-emerald-100" role="status">{message}</p>}

        <section className="mt-6" aria-label={`${selectedCategoryData?.name ?? ''}の商品一覧`}>
          <div className="flex items-end justify-between"><div><p className="text-xs font-black tracking-[0.16em] text-amber-300">CATEGORY</p><h2 className="mt-1 text-xl font-black">{selectedCategoryData?.name}</h2></div><span className="text-xs font-bold text-slate-400">{selectedCategoryData?.description}</span></div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {products.map((product) => {
              const ownedQuantity = getOwnedProductQuantity(game.ownedProducts, product.id);
              const cannotAfford = game.money < product.price;
              return <article key={product.id} className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-lg shadow-slate-950/20"><div className="flex aspect-[1.15] items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-5xl">{product.image}</div><div className="p-3"><h3 className="min-h-10 text-sm font-black leading-snug">{product.name}</h3><div className="mt-1 flex items-center justify-between gap-2"><span className="text-sm font-black text-amber-300">¥{product.price.toLocaleString()}</span><span className="text-[10px] font-bold text-slate-500">所持 × {ownedQuantity}</span></div><button type="button" disabled={cannotAfford} onClick={() => purchase(product.id)} className="mt-3 w-full rounded-xl bg-amber-300 px-2 py-2.5 text-xs font-black text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400">{cannotAfford ? '所持金不足' : '購入する'}</button></div></article>;
            })}
          </div>
        </section>

        {selectedCategory === 'item' && <section className="mt-6 rounded-3xl border border-white/10 bg-slate-900/70 p-4"><div className="flex items-center gap-2"><ShoppingBag className="h-5 w-5 text-emerald-300" /><div><h2 className="font-black">所持アイテム</h2><p className="text-[11px] font-bold text-slate-500">購入済みのアイテムを部屋へ配置できます</p></div></div><div className="mt-4 space-y-2">{game.ownedFurniture.length ? game.ownedFurniture.map(({ furnitureId, quantity }) => {
          const furniture = getProductById(furnitureId);
          if (!furniture) return null;
          const placed = game.placedFurniture.filter((item) => item.furnitureId === furnitureId).length;
          const canPlace = placed < getOwnedFurnitureQuantity(game.ownedFurniture, furnitureId);
          return <div key={furnitureId} className="flex items-center gap-3 rounded-2xl bg-slate-800/80 p-3"><span className="text-2xl">{furniture.image}</span><span className="flex-1 text-sm font-black">{furniture.name}<span className="mt-0.5 block text-[11px] text-slate-500">所持 {quantity} / 配置 {placed}</span></span><button disabled={!canPlace} onClick={() => place(furnitureId)} className="rounded-xl bg-emerald-400 px-3 py-2 text-xs font-black text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400">配置する</button></div>;
        }) : <p className="text-center text-sm font-bold text-slate-400">まだアイテムを持っていません。</p>}</div></section>}
      </main>
    </div>
  );
};
