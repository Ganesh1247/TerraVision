import React from 'react';
import { PRODUCTION_READINESS_CHECKLIST } from '../../data/techStackSpec';
import { ShieldCheck, CheckCircle2, FileCode, Check } from 'lucide-react';

export default function ProductionReadiness() {
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-dark-850 border border-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white tracking-wide">
            Production Readiness Matrix (What Separates This From a Prototype)
          </h3>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            11 / 11 Handled
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Terra Vision is engineered for mission-critical field deployment on edge devices with automatic failure recovery, air-gap guarantees, and structured observability.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-dark-900 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
              <th className="p-3">Concern / Engineering Challenge</th>
              <th className="p-3">How It's Handled in Terra Vision</th>
              <th className="p-3">Status</th>
              <th className="p-3">Backend Module Ref</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 bg-dark-850">
            {PRODUCTION_READINESS_CHECKLIST.map((item, idx) => (
              <tr key={idx} className="hover:bg-dark-800/50 transition-colors">
                <td className="p-3 font-semibold text-white whitespace-nowrap">
                  {item.concern}
                </td>
                <td className="p-3 text-slate-300 leading-relaxed max-w-md">
                  {item.howHandled}
                </td>
                <td className="p-3 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                    <Check className="w-3 h-3" />
                    HANDLED
                  </span>
                </td>
                <td className="p-3 font-mono text-[11px] text-brand-cyan whitespace-nowrap">
                  {item.codeRef}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
