import React from 'react';
import { Brain, HeartPulse, Sparkles, Wallet } from 'lucide-react';

// Display-only values for the home-screen prototype. They intentionally do not
// read or update game state until the game system is introduced.
const DISPLAY_STATUS = [
  { label: '体力', value: 4, icon: HeartPulse, color: 'bg-rose-400' },
  { label: '知力', value: 3, icon: Brain, color: 'bg-sky-400' },
  { label: '運', value: 4, icon: Sparkles, color: 'bg-amber-300' },
];

export const PlayerStatusPanel = () => (
  <section className="rounded-[1.75rem] border border-white/10 bg-slate-900/75 p-4 shadow-xl shadow-slate-950/30">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-amber-300">Character status</p>
        <p className="mt-1 text-lg font-black text-slate-50">あなたのキャラクター</p>
      </div>
      <div className="rounded-2xl border border-amber-300/25 bg-amber-300/10 px-3 py-2 text-right">
        <span className="block text-[10px] font-black tracking-[0.16em] text-amber-200">LEVEL</span>
        <span className="text-lg font-black text-amber-300">Lv. 5</span>
      </div>
    </div>

    <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-800/80 px-4 py-3">
      <span className="flex items-center gap-2 text-sm font-black text-slate-200"><Wallet className="h-4 w-4 text-amber-300" />所持金</span>
      <span className="font-black text-amber-300">¥12,500</span>
    </div>

    <div className="mt-4 space-y-3">
      {DISPLAY_STATUS.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="flex items-center gap-3">
          <span className="flex w-10 items-center gap-1 text-xs font-black text-slate-300"><Icon className="h-3.5 w-3.5" />{label}</span>
          <div className="flex flex-1 gap-1" aria-label={`${label} ${value} / 5`}>
            {[1, 2, 3, 4, 5].map((level) => <span key={level} className={`h-2 flex-1 rounded-full ${level <= value ? color : 'bg-slate-700'}`} />)}
          </div>
        </div>
      ))}
    </div>
  </section>
);
