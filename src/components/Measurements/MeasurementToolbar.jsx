import React, { useState } from 'react';
import { 
  Ruler, 
  MoveVertical, 
  Square, 
  Box, 
  Target, 
  Check, 
  Trash2, 
  Sparkles,
  Info
} from 'lucide-react';

export default function MeasurementToolbar({
  activeTool,
  setActiveTool,
  measurementResult,
  onClearMeasurement,
  isOpen,
  onToggle
}) {
  const tools = [
    { id: 'distance', label: 'Distance', icon: Ruler, hotkey: 'D', unit: 'm', sample: { val: '24.85 m', conf: '92%', err: '±0.024 m' } },
    { id: 'height',   label: 'Height',   icon: MoveVertical, hotkey: 'H', unit: 'm', sample: { val: '18.42 m', conf: '89%', err: '±0.042 m' } },
    { id: 'area',     label: 'Area',     icon: Square, hotkey: 'A', unit: 'm²', sample: { val: '412.60 m²', conf: '91%', err: '±1.2 m²' } },
    { id: 'volume',   label: 'Volume',   icon: Box, hotkey: 'V', unit: 'm³', sample: { val: '1,840.5 m³', conf: '87%', err: '±12.4 m³' } },
    { id: 'point',    label: 'Point',    icon: Target, hotkey: 'P', unit: 'ENU', sample: { val: 'X: 12.4, Y: 18.2, Z: 5.4', conf: '95%', err: '±0.008 m' } },
  ];

  return (
    <div className="select-none pointer-events-auto">
      {/* Floating Toolbar Pill */}
      <div className="tv-floating-bar px-2.5 py-1.5 flex items-center gap-1.5 shadow-2xl">
        <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 mr-1 hidden sm:flex items-center gap-1">
          <Ruler className="w-3 h-3" />
          <span>CAD Tools</span>
        </div>

        {tools.map(t => {
          const Icon = t.icon;
          const isSelected = activeTool === t.id;

          return (
            <button
              key={t.id}
              onClick={() => setActiveTool(isSelected ? null : t.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all duration-200 ${
                isSelected
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 shadow-[0_0_12px_rgba(34,211,238,0.3)]'
                  : 'text-slate-300 hover:text-white hover:bg-white/10 border border-transparent'
              }`}
              title={`${t.label} measurement [${t.hotkey}]`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400 scale-110' : 'text-slate-400'}`} />
              <span className="hidden md:inline">{t.label}</span>
            </button>
          );
        })}

        {activeTool && (
          <button
            onClick={onClearMeasurement}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10 ml-1 transition-colors"
            title="Clear measurement"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Floating Measurement Result Card */}
      {activeTool && (
        <div className="mt-2.5 tv-floating-bar p-3 border-cyan-500/40 shadow-2xl max-w-xs animate-slide-up">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-[10px] font-mono">
            <span className="text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {activeTool.toUpperCase()} MEASUREMENT
            </span>
            <span className="px-1.5 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {measurementResult?.conf || '89% CONF'}
            </span>
          </div>

          <div className="mt-2">
            <div className="text-xs text-slate-400 font-mono">Calculated Value:</div>
            <div className="text-xl font-black font-mono text-white tracking-tight">
              {measurementResult?.val || (activeTool === 'height' ? '18.42 m' : activeTool === 'distance' ? '24.85 m' : activeTool === 'area' ? '412.60 m²' : activeTool === 'volume' ? '1,840.5 m³' : 'X: 12.4m, Y: 18.2m, Z: 5.4m')}
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Statistical Bound:</span>
            <strong className="text-amber-400">
              {measurementResult?.err || (activeTool === 'height' ? '±0.42 m' : '±0.024 m')}
            </strong>
          </div>
        </div>
      )}
    </div>
  );
}
