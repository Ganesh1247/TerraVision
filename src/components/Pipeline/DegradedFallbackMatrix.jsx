import React from 'react';
import { SOFTWARE_FALLBACKS } from '../../data/pipelineStages';
import { ShieldCheck, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function DegradedFallbackMatrix({ activeFallbacks = [] }) {
  return (
    <div className="p-3 rounded-lg bg-dark-850/80 border border-slate-800 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-cyan" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Active Software Fallbacks Matrix
          </span>
        </div>
        <span className="text-[10px] font-mono text-emerald-400">
          {activeFallbacks.length} Active Engine Modules
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {SOFTWARE_FALLBACKS.map((fallback) => {
          const isActive = activeFallbacks.includes(fallback.id);
          return (
            <div
              key={fallback.id}
              className={`p-2 rounded border text-xs transition-all relative ${
                isActive
                  ? 'bg-brand-cyan/10 border-brand-cyan/50 text-slate-200 shadow-[0_0_10px_rgba(34,211,238,0.1)] ring-1 ring-brand-cyan/30'
                  : 'bg-dark-900/40 border-slate-800/60 text-slate-500 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className={`font-semibold truncate text-[11px] ${isActive ? 'text-brand-cyan' : 'text-slate-400'}`}>
                  {fallback.name}
                </span>
                {isActive ? (
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-cyan" />
                  </span>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                )}
              </div>

              <div className="text-[10px] font-mono text-slate-400 truncate">
                {fallback.algorithm}
              </div>

              <div className="text-[9px] text-slate-500 truncate mt-0.5" title={fallback.module}>
                {fallback.module.split('/')[1]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
