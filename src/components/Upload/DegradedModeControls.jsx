import React from 'react';
import { Sliders, SunMedium, CloudFog, Disc, AlertOctagon, RefreshCw, Sparkles } from 'lucide-react';

export default function DegradedModeControls({
  degradedOverrides,
  setDegradedOverrides,
  isProcessing
}) {
  const toggleOverride = (key) => {
    if (isProcessing) return;
    setDegradedOverrides(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="p-3 rounded-lg bg-dark-850/80 border border-slate-800 space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-amber-400" />
          Simulate Degraded Input Conditions
        </label>
        <span className="text-[10px] font-mono text-slate-400">
          Demo Software Fallbacks Live
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {/* Force Low Light */}
        <button
          onClick={() => toggleOverride('forceLowLight')}
          disabled={isProcessing}
          className={`flex items-center gap-2 p-2 rounded text-left border text-xs transition-all ${
            degradedOverrides.forceLowLight
              ? 'bg-amber-500/10 border-amber-500/50 text-amber-300 font-semibold'
              : 'bg-dark-900/60 border-slate-800 text-slate-400 hover:text-slate-300'
          }`}
        >
          <SunMedium className={`w-3.5 h-3.5 shrink-0 ${degradedOverrides.forceLowLight ? 'text-amber-400' : 'text-slate-500'}`} />
          <div className="truncate">
            <div className="text-[11px] leading-tight">Low-Light Night</div>
            <div className="text-[9px] font-mono text-slate-500">Zero-DCE Fallback</div>
          </div>
        </button>

        {/* Force Fog / Haze */}
        <button
          onClick={() => toggleOverride('forceFogHaze')}
          disabled={isProcessing}
          className={`flex items-center gap-2 p-2 rounded text-left border text-xs transition-all ${
            degradedOverrides.forceFogHaze
              ? 'bg-amber-500/10 border-amber-500/50 text-amber-300 font-semibold'
              : 'bg-dark-900/60 border-slate-800 text-slate-400 hover:text-slate-300'
          }`}
        >
          <CloudFog className={`w-3.5 h-3.5 shrink-0 ${degradedOverrides.forceFogHaze ? 'text-amber-400' : 'text-slate-500'}`} />
          <div className="truncate">
            <div className="text-[11px] leading-tight">Heavy Fog / Haze</div>
            <div className="text-[9px] font-mono text-slate-500">Dark Channel Prior</div>
          </div>
        </button>

        {/* Force No IMU */}
        <button
          onClick={() => toggleOverride('forceNoImu')}
          disabled={isProcessing}
          className={`flex items-center gap-2 p-2 rounded text-left border text-xs transition-all ${
            degradedOverrides.forceNoImu
              ? 'bg-amber-500/10 border-amber-500/50 text-amber-300 font-semibold'
              : 'bg-dark-900/60 border-slate-800 text-slate-400 hover:text-slate-300'
          }`}
        >
          <Disc className={`w-3.5 h-3.5 shrink-0 ${degradedOverrides.forceNoImu ? 'text-amber-400' : 'text-slate-500'}`} />
          <div className="truncate">
            <div className="text-[11px] leading-tight">IMU Blackout</div>
            <div className="text-[9px] font-mono text-slate-500">Visual Scale Recovery</div>
          </div>
        </button>

        {/* Force Single-Angle Sparse Overlap */}
        <button
          onClick={() => toggleOverride('forceSparseOverlap')}
          disabled={isProcessing}
          className={`flex items-center gap-2 p-2 rounded text-left border text-xs transition-all ${
            degradedOverrides.forceSparseOverlap
              ? 'bg-amber-500/10 border-amber-500/50 text-amber-300 font-semibold'
              : 'bg-dark-900/60 border-slate-800 text-slate-400 hover:text-slate-300'
          }`}
        >
          <Sparkles className={`w-3.5 h-3.5 shrink-0 ${degradedOverrides.forceSparseOverlap ? 'text-amber-400' : 'text-slate-500'}`} />
          <div className="truncate">
            <div className="text-[11px] leading-tight">Sparse Overlap</div>
            <div className="text-[9px] font-mono text-slate-500">MiDaS Mono-Depth</div>
          </div>
        </button>

        {/* Force Motion Blur */}
        <button
          onClick={() => toggleOverride('forceMotionBlur')}
          disabled={isProcessing}
          className={`flex items-center gap-2 p-2 rounded text-left border text-xs transition-all ${
            degradedOverrides.forceMotionBlur
              ? 'bg-amber-500/10 border-amber-500/50 text-amber-300 font-semibold'
              : 'bg-dark-900/60 border-slate-800 text-slate-400 hover:text-slate-300'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${degradedOverrides.forceMotionBlur ? 'text-amber-400' : 'text-slate-500'}`} />
          <div className="truncate">
            <div className="text-[11px] leading-tight">High Motion Blur</div>
            <div className="text-[9px] font-mono text-slate-500">Wiener Deconvolution</div>
          </div>
        </button>

        {/* Force Artificial Failure for Retry test */}
        <button
          onClick={() => toggleOverride('forceSimulateFailure')}
          disabled={isProcessing}
          className={`flex items-center gap-2 p-2 rounded text-left border text-xs transition-all ${
            degradedOverrides.forceSimulateFailure
              ? 'bg-red-500/10 border-red-500/50 text-red-400 font-semibold'
              : 'bg-dark-900/60 border-slate-800 text-slate-400 hover:text-slate-300'
          }`}
        >
          <AlertOctagon className={`w-3.5 h-3.5 shrink-0 ${degradedOverrides.forceSimulateFailure ? 'text-red-400' : 'text-slate-500'}`} />
          <div className="truncate">
            <div className="text-[11px] leading-tight">Simulate Failure</div>
            <div className="text-[9px] font-mono text-slate-500">Test Self-Healing/Retry</div>
          </div>
        </button>
      </div>
    </div>
  );
}
