import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Loader2, 
  Circle, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw, 
  Layers, 
  Code, 
  Cpu 
} from 'lucide-react';

export default function PipelineStageCard({
  stage,
  statusObj,
  isActive,
  isCompleted,
  isFailed,
  stageProgress,
  onRetry
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`rounded-lg border transition-all ${
        isActive
          ? 'bg-dark-800 border-brand-cyan shadow-[0_0_15px_rgba(34,211,238,0.15)] ring-1 ring-brand-cyan/40'
          : isCompleted
          ? 'bg-dark-850/60 border-emerald-500/30'
          : isFailed
          ? 'bg-red-950/30 border-red-500/50'
          : 'bg-dark-900/40 border-slate-800/60 opacity-70'
      }`}
    >
      {/* Main Header Row */}
      <div className="p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Status Indicator Icon */}
          <div className="shrink-0">
            {isActive ? (
              <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-brand-cyan/20 border border-brand-cyan text-brand-cyan">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              </div>
            ) : isCompleted ? (
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            ) : isFailed ? (
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500/20 border border-red-500 text-red-400">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
            ) : (
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-slate-500 text-[10px] font-mono font-bold">
                0{stage.index}
              </div>
            )}
          </div>

          {/* Title & Core Technique */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white truncate">
                {stage.index}. {stage.name}
              </span>
              {isActive && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40 animate-pulse">
                  PROCESSING
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {stage.coreTechnique}
            </p>
          </div>
        </div>

        {/* Right Stats & Expand Chevron */}
        <div className="flex items-center gap-2 shrink-0">
          {statusObj.throughput && (
            <span className="hidden sm:inline text-[10px] font-mono px-2 py-0.5 rounded bg-dark-900 border border-slate-800 text-slate-300">
              {statusObj.throughput}
            </span>
          )}

          {statusObj.duration && (
            <span className="text-[10px] font-mono text-slate-400">
              {statusObj.duration}
            </span>
          )}

          {isFailed && (
            <button
              onClick={onRetry}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-xs font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            title="Expand algorithm deep-dive"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Progress Bar for Active Stage */}
      {isActive && (
        <div className="px-3 pb-2">
          <div className="w-full bg-dark-950 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-brand-cyan h-full rounded-full transition-all duration-150 shadow-[0_0_8px_#22D3EE]"
              style={{ width: `${stageProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Message if Failed */}
      {isFailed && statusObj.error && (
        <div className="px-3 pb-3 pt-1 text-xs text-red-400 bg-red-950/20 rounded-b-lg border-t border-red-500/20">
          <strong>Fault Captured:</strong> {statusObj.error}
        </div>
      )}

      {/* Collapsible Tech Deep-Dive */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-2 text-xs border-t border-slate-800 bg-dark-950/60 rounded-b-lg space-y-2">
          <p className="text-slate-300 leading-relaxed">
            {stage.description}
          </p>

          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 bg-dark-900 p-2 rounded border border-slate-800">
            <Code className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
            <span className="text-slate-300 font-semibold">Backend Implementation:</span>
            <span className="text-brand-cyan truncate">{stage.module}</span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Execution Sequence:
            </span>
            <ul className="space-y-0.5 text-[11px] text-slate-400">
              {stage.actions.map((act, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-brand-cyan">▹</span>
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
