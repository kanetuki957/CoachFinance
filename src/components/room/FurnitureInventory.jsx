import React, { useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';
import { POCO_CATEGORIES, getProductById, isProductImagePath } from '../../domain/shop/productCatalog';

const CATEGORY_IDS = ['sofa', 'table-chair', 'storage', 'bed', 'lighting', 'decor', 'rug'];
const categories = [{ id: 'all', name: 'すべて' }, ...CATEGORY_IDS.map((id) => ({ id, name: id === 'decor' ? '植物・雑貨' : POCO_CATEGORIES.find((category) => category.id === id)?.name ?? id }))];

const ownedProducts = (ownedFurniture = []) => {
  const counts = new Map();
  ownedFurniture.forEach((item) => {
    const id = typeof item === 'string' ? item : item?.furnitureId;
    const quantity = typeof item === 'string' ? 1 : Number(item?.quantity) || 0;
    if (id && quantity > 0) counts.set(id, (counts.get(id) ?? 0) + quantity);
  });
  return [...counts].flatMap(([id, totalOwned]) => {
    const product = getProductById(id);
    return product?.isFurniture ? [{ product, totalOwned }] : [];
  });
};

export const FurnitureInventory = ({ open, onClose, ownedFurniture, placedFurniture, onPlace }) => {
  const [category, setCategory] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const products = useMemo(() => ownedProducts(ownedFurniture), [ownedFurniture]);
  const placedCount = (id) => placedFurniture.filter((item) => item.furnitureId === id || item.productId === id).length;
  const visible = products.filter(({ product }) => category === 'all' || product.category === category);
  const selected = products.find(({ product }) => product.id === selectedId) ?? null;
  const selectedAvailable = selected ? Math.max(0, selected.totalOwned - placedCount(selected.product.id)) : 0;

  const startPlacement = () => {
    if (!selected || selectedAvailable <= 0) return;
    if (onPlace(selected.product.id)?.ok) {
      setSelectedId(null);
      onClose();
    }
  };

  return <div className={`fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md transition-transform duration-300 ease-out ${open ? 'translate-y-0' : 'pointer-events-none translate-y-full'}`} aria-hidden={!open}>
    <section className="rounded-t-[2rem] border-x border-t border-white/15 bg-slate-900/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 text-slate-100 shadow-[0_-18px_45px_rgba(2,6,23,.5)] backdrop-blur" aria-label="保有家具">
      <div className="mx-auto h-1 w-10 rounded-full bg-slate-500" />
      <header className="mt-3 flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-amber-300">Furniture inventory</p><h2 className="text-lg font-black">保有家具</h2></div><button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-300 hover:bg-white/10" aria-label="家具インベントリを閉じる"><X className="h-5 w-5" /></button></header>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-2" role="tablist">{categories.map((item) => <button key={item.id} type="button" role="tab" aria-selected={category === item.id} onClick={() => setCategory(item.id)} className={`shrink-0 rounded-full px-3 py-2 text-xs font-black ${category === item.id ? 'bg-amber-300 text-slate-950' : 'bg-white/10 text-slate-300'}`}>{item.name}</button>)}</div>
      <div className="mt-2 max-h-[40dvh] overflow-y-auto pr-1">{visible.length ? <div className="grid grid-cols-3 gap-3 pb-2">{visible.map(({ product, totalOwned }) => {
        const available = Math.max(0, totalOwned - placedCount(product.id));
        const selectedCard = selectedId === product.id;
        return <button key={product.id} type="button" disabled={available === 0} onClick={() => setSelectedId(product.id)} aria-label={`${product.name}、使用可能数 ${available}`} className={`relative aspect-square overflow-hidden rounded-2xl border p-2 text-left transition disabled:cursor-not-allowed ${selectedCard ? 'border-amber-300 bg-amber-300/15 ring-2 ring-amber-300/40' : 'border-white/10 bg-white/10'} ${available === 0 ? 'opacity-45' : 'hover:bg-white/15'}`}>
          {isProductImagePath(product.image) ? <img src={product.image} alt={product.name} className="h-full w-full object-contain drop-shadow-lg" /> : <span className="flex h-full w-full items-center justify-center text-4xl">{product.image}</span>}
          <span className="absolute bottom-1.5 right-1.5 rounded-full bg-slate-950/80 px-2 py-0.5 text-xs font-black text-white">×{available}</span>
          {selectedCard && <span className="absolute left-1.5 top-1.5 rounded-full bg-amber-300 p-1 text-slate-950"><Check className="h-3.5 w-3.5 stroke-[3]" /></span>}
        </button>;
      })}</div> : <p className="rounded-2xl bg-white/5 px-4 py-8 text-center text-sm font-bold text-slate-400">このカテゴリの保有家具はありません</p>}</div>
      {selected && <div className="mt-3 flex items-center gap-3 rounded-2xl bg-white/10 p-2"><p className="min-w-0 flex-1 truncate px-2 text-sm font-black">{selected.product.name} <span className="text-slate-400">×{selectedAvailable}</span></p><button type="button" onClick={startPlacement} disabled={selectedAvailable <= 0} className="shrink-0 rounded-xl bg-amber-300 px-3 py-2.5 text-xs font-black text-slate-950 disabled:bg-slate-600 disabled:text-slate-300">配置をはじめる</button></div>}
    </section>
  </div>;
};
