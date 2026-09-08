import React from 'react';
import { PIPELINE_STAGES } from '../../data/pipelineStages';
import PipelineStageCard from './PipelineStageCard';
import DegradedFallbackMatrix from './DegradedFallbackMatrix';
import { Activity, Zap, CheckCircle2, AlertOctagon, Terminal } from 'lucide-react';

export default function PipelineStatus({
  pipelineState,
  activeStageIndex,
  stageProgress,
  totalProgress,
  currentAction,
  activeFallbacks,
  stageStatuses,
  onRetryStage
}) {
  return (
    <div className="space-y-4">
      {/* Live Master Progress Header */}
      <div className="p-4 rounded-xl bg-dark-850/90 border border-brand-cyan/20 tech-border-glow space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-md ${
              pipelineState === 'processing' 
                ? 'bg-brand-cyan/20 text-brand-cyan animate-pulse' 
                : pipelineState === 'completed'
                ? 'bg-emerald-500/20 text-emerald-400'
                : pipelineState === 'error'
                ? 'bg-red-500/20 text-red-400'
                : 'bg-slate-800 text-slate-400'
            }`}>
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                Reconstruction Pipeline Status
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                  pipelineState === 'processing'
                    ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30'
                    : pipelineState === 'completed'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : pipelineState === 'error'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {pipelineState.toUpperCase()}
                </span>
              </h3>
              <p className="text-[11px] font-mono text-brand-cyan mt-0.5 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-cyan animate-ping" />
                {currentAction}
              </p>
            </div>
          </div>

          <div className="text-right font-mono">
            <span className="text-2xl font-black text-white">{totalProgress}%</span>
            <div className="text-[10px] text-slate-400">
              Stage {pipelineState === 'completed' ? 9 : activeStageIndex + 1} of 9
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full bg-dark-950 rounded-full h-2 overflow-hidden border border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              pipelineState === 'error'
                ? 'bg-red-500'
                : pipelineState === 'completed'
                ? 'bg-emerald-500 shadow-[0_0_12px_#22C55E]'
                : 'bg-gradient-to-r from-cyan-500 to-brand-cyan shadow-[0_0_12px_#22D3EE]'
            }`}
            style={{ width: `${totalProgress}%` }}
          />
        </div>
      </div>

      {/* Software Fallback Matrix */}
      <DegradedFallbackMatrix activeFallbacks={activeFallbacks} />

      {/* 9 Stages List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-semibold uppercase tracking-wider">
          <span>Sequential Pipeline Stages</span>
          <span>Throughput / Duration</span>
        </div>

        {PIPELINE_STAGES.map((stage, idx) => {
          const statusObj = stageStatuses[idx] || { status: 'idle' };
          const isActive = pipelineState === 'processing' && activeStageIndex === idx;
          const isCompleted = statusObj.status === 'complete';
          const isFailed = statusObj.status === 'failed';

          return (
            <PipelineStageCard
              key={stage.id}
              stage={stage}
              statusObj={statusObj}
              isActive={isActive}
              isCompleted={isCompleted}
              isFailed={isFailed}
              stageProgress={stageProgress}
              onRetry={onRetryStage}
            />
          );
        })}
      </div>
    </div>
  );
}
