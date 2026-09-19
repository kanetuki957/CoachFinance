import React, { useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';
import { POCO_CATEGORIES, getProductById, isProductImagePath } from '../../domain/shop/productCatalog';

const INVENTORY_CATEGORY_IDS = ['sofa', 'table-chair', 'storage', 'bed', 'lighting', 'decor', 'rug'];
const CATEGORY_NAME_OVERRIDES = { decor: '植物・雑貨' };

const getInventoryCategories = () => [
  { id: 'all', name: 'すべて' },
  ...INVENTORY_CATEGORY_IDS.map((id) => {
    const category = POCO_CATEGORIES.find((item) => item.id === id);
    return { id, name: CATEGORY_NAME_OVERRIDES[id] ?? category?.name ?? id };
  }),
];

// 保存済みの旧配列形式にも対応しながら、商品IDごとに所持数をまとめる。
const getOwnedFurniture = (ownedFurniture = []) => {
  const quantities = new Map();
  ownedFurniture.forEach((item) => {
    const furnitureId = typeof item === 'string' ? item : item?.furnitureId;
    const quantity = typeof item === 'string' ? 1 : Number(item?.quantity) || 0;
    if (!furnitureId || quantity <= 0) return;
    quantities.set(furnitureId, (quantities.get(furnitureId) ?? 0) + quantity);
  });
  return [...quantities].flatMap(([furnitureId, quantity]) => {
    const product = getProductById(furnitureId);
    return product?.isFurniture ? [{ product, quantity }] : [];
  });
};

export const FurnitureInventory = ({ open, onClose, ownedFurniture, placedFurniture, onPlace }) => {
  const [category, setCategory] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const categories = useMemo(getInventoryCategories, []);
  const furniture = useMemo(() => getOwnedFurniture(ownedFurniture), [ownedFurniture]);
  const visibleFurniture = furniture.filter(({ product }) => category === 'all' || product.category === category);
  const selected = furniture.find(({ product }) => product.id === selectedId) ?? null;
  const placedCount = (furnitureId) => placedFurniture.filter((item) => item.furnitureId === furnitureId).length;
  const selectedAvailable = selected ? selected.quantity - placedCount(selected.product.id) : 0;

  const placeSelected = () => {
    if (!selected || selectedAvailable <= 0) return;
    const result = onPlace(selected.product.id);
    if (result?.ok) {
      setSelectedId(null);
      onClose();
    }
  };

  return (
    <div className={`fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md transition-transform duration-300 ease-out ${open ? 'translate-y-0' : 'pointer-events-none translate-y-full'}`} aria-hidden={!open}>
      <section className="rounded-t-[2rem] border-x border-t border-white/15 bg-slate-900/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 text-slate-100 shadow-[0_-18px_45px_rgba(2,6,23,.5)] backdrop-blur" aria-label="保有家具">
        <div className="mx-auto h-1 w-10 rounded-full bg-slate-500" />
        <header className="mt-3 flex items-center justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-amber-300">Furniture inventory</p><h2 className="mt-0.5 text-lg font-black">保有家具</h2></div><button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-300 transition hover:bg-white/10 hover:text-white" aria-label="家具インベントリを閉じる"><X className="h-5 w-5" /></button></header>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="家具カテゴリ">
          {categories.map((item) => <button key={item.id} type="button" role="tab" aria-selected={category === item.id} onClick={() => setCategory(item.id)} className={`shrink-0 rounded-full px-3 py-2 text-xs font-black transition ${category === item.id ? 'bg-amber-300 text-slate-950' : 'bg-white/10 text-slate-300 hover:bg-white/15'}`}>{item.name}</button>)}
        </div>
        <div className="mt-2 max-h-[40dvh] overflow-y-auto pr-1">
          {visibleFurniture.length ? <div className="grid grid-cols-3 gap-3 pb-2">
            {visibleFurniture.map(({ product, quantity }) => {
              const available = quantity - placedCount(product.id);
              const isSelected = selectedId === product.id;
              return <button key={product.id} type="button" onClick={() => setSelectedId(product.id)} className={`relative aspect-square overflow-hidden rounded-2xl border p-2 transition ${isSelected ? 'border-amber-300 bg-amber-300/15 ring-2 ring-amber-300/40' : 'border-white/10 bg-white/10 hover:bg-white/15'} ${available <= 0 ? 'opacity-60' : ''}`} aria-label={`${product.name}、${quantity}個所持${available <= 0 ? '、すべて配置済み' : ''}`}>
                {isProductImagePath(product.image) ? <img src={product.image} alt={product.name} className="h-full w-full object-contain drop-shadow-lg" /> : <span className="flex h-full w-full items-center justify-center text-4xl" aria-hidden="true">{product.image}</span>}
                <span className="absolute bottom-1.5 right-1.5 rounded-full bg-slate-950/80 px-2 py-0.5 text-xs font-black text-white">×{quantity}</span>
                {isSelected && <span className="absolute left-1.5 top-1.5 rounded-full bg-amber-300 p-1 text-slate-950"><Check className="h-3.5 w-3.5 stroke-[3]" /></span>}
              </button>;
            })}
          </div> : <p className="rounded-2xl bg-white/5 px-4 py-8 text-center text-sm font-bold text-slate-400">このカテゴリの保有家具はありません</p>}
        </div>
        {selected && <div className="mt-3 flex items-center gap-3 rounded-2xl bg-white/10 p-2"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 p-1">{isProductImagePath(selected.product.image) ? <img src={selected.product.image} alt="" className="h-full w-full object-contain" /> : <span className="text-2xl">{selected.product.image}</span>}</div><p className="min-w-0 flex-1 truncate text-sm font-black">{selected.product.name}</p><button type="button" onClick={placeSelected} disabled={selectedAvailable <= 0} className="shrink-0 rounded-xl bg-amber-300 px-3 py-2.5 text-xs font-black text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300">{selectedAvailable > 0 ? '配置する' : '配置済み'}</button></div>}
      </section>
    </div>
  );
};
