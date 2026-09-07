import React from 'react';
import { Brain, HeartPulse, Sparkles, Wallet } from 'lucide-react';

const DISPLAY_STATUS = [
  { key: 'strength', label: '体力', icon: HeartPulse, color: 'bg-rose-400' },
  { key: 'knowledge', label: '知力', icon: Brain, color: 'bg-sky-400' },
  { key: 'wealth', label: '運', icon: Sparkles, color: 'bg-amber-300' },
];

export const PlayerStatusPanel = ({ game }) => (
  <section className="rounded-[1.75rem] border border-white/10 bg-slate-900/75 p-4 shadow-xl shadow-slate-950/30">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-amber-300">Character status</p>
        <p className="mt-1 text-lg font-black text-slate-50">あなたのキャラクター</p>
      </div>
      <div className="rounded-2xl border border-amber-300/25 bg-amber-300/10 px-3 py-2 text-right">
        <span className="block text-[10px] font-black tracking-[0.16em] text-amber-200">LEVEL</span>
        <span className="text-lg font-black text-amber-300">Lv. 1</span>
      </div>
    </div>

    <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-800/80 px-4 py-3">
      <span className="flex items-center gap-2 text-sm font-black text-slate-200"><Wallet className="h-4 w-4 text-amber-300" />所持金</span>
      <span className="font-black text-amber-300">¥{game.money.toLocaleString()}</span>
    </div>

    <div className="mt-4 space-y-3">
      {DISPLAY_STATUS.map(({ key, label, icon: Icon, color }) => {
        const value = game[key];
        return (
        <div key={label} className="flex items-center gap-3">
          <span className="flex w-10 items-center gap-1 text-xs font-black text-slate-300"><Icon className="h-3.5 w-3.5" />{label}</span>
          <div className="flex flex-1 gap-1" aria-label={`${label} ${value} / 100`}>
            {[20, 40, 60, 80, 100].map((threshold) => <span key={threshold} className={`h-2 flex-1 rounded-full ${value >= threshold ? color : 'bg-slate-700'}`} />)}
          </div>
          <span className="w-7 text-right text-xs font-black text-slate-300">{value}</span>
        </div>
        );
      })}
    </div>
  </section>
);
