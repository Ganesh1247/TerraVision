import React from 'react';
import { PIPELINE_STAGES } from '../../data/pipelineStages';
import PipelineStageCard from './PipelineStageCard';
import DegradedFallbackMatrix from './DegradedFallbackMatrix';
import { Activity, CheckCircle2, AlertOctagon, Loader2 } from 'lucide-react';

const STATE_CONFIG = {
  idle: {
    badge: 'tv-badge-cyan',
    icon: Activity,
    iconClass: 'text-[var(--text-muted)]',
    label: 'Standby',
  },
  processing: {
    badge: 'tv-badge-cyan',
    icon: Loader2,
    iconClass: 'text-[var(--accent-cyan)] animate-spin',
    label: 'Processing',
  },
  completed: {
    badge: 'tv-badge-emerald',
    icon: CheckCircle2,
    iconClass: 'text-[var(--accent-emerald)]',
    label: 'Completed',
  },
  error: {
    badge: 'tv-badge-rose',
    icon: AlertOctagon,
    iconClass: 'text-[var(--accent-rose)]',
    label: 'Error',
  },
};

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
  const cfg = STATE_CONFIG[pipelineState] || STATE_CONFIG.idle;
  const Icon = cfg.icon;
  const stageNum = pipelineState === 'completed' ? 9 : activeStageIndex + 1;

  return (
    <div className="space-y-4">
      {/* ── Master progress card ─────────────────────────────────── */}
      <div className="tv-card tv-card-accent p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl tv-surface flex items-center justify-center`}>
              <Icon className={`w-4 h-4 ${cfg.iconClass}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                  Reconstruction Pipeline
                </h3>
                <span className={`tv-badge ${cfg.badge}`}>{cfg.label}</span>
              </div>
              {currentAction && (
                <p className="text-[11px] mt-0.5 font-mono" style={{ color: 'var(--accent-cyan)' }}>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--accent-cyan)] mr-1.5 animate-pulse" />
                  {currentAction}
                </p>
              )}
            </div>
          </div>

          {/* Progress percentage */}
          <div className="text-right shrink-0">
            <span
              className="text-3xl font-black font-mono leading-none"
              style={{ color: 'var(--text-primary)' }}
            >
              {totalProgress}%
            </span>
            <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Stage {stageNum} / 9
            </div>
          </div>
        </div>

        {/* Global progress bar */}
        <div>
          <div className="tv-progress-track">
            <div
              className={`tv-progress-fill ${
                pipelineState === 'completed'
                  ? '!bg-[var(--accent-emerald)] after:hidden'
                  : pipelineState === 'error'
                  ? '!bg-[var(--accent-rose)] after:hidden'
                  : ''
              }`}
              style={{ width: `${totalProgress}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px]" style={{ color: 'var(--text-muted)', fontFamily: '"JetBrains Mono", monospace' }}>
              0%
            </span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)', fontFamily: '"JetBrains Mono", monospace' }}>
              100%
            </span>
          </div>
        </div>

        {/* Stage mini-dots */}
        <div className="flex gap-1 flex-wrap">
          {Array.from({ length: 9 }).map((_, i) => {
            const s = stageStatuses[i] || { status: 'idle' };
            const isDone = s.status === 'complete';
            const isActive = pipelineState === 'processing' && activeStageIndex === i;
            const isFail = s.status === 'failed';
            return (
              <div
                key={i}
                title={`Stage ${i + 1}`}
                className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                  isDone   ? 'bg-[var(--accent-emerald)]' :
                  isFail   ? 'bg-[var(--accent-rose)]' :
                  isActive ? 'bg-[var(--accent-cyan)] animate-pulse' :
                             'bg-[var(--bg-muted)]'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* ── Fallback matrix ──────────────────────────────────────── */}
      <DegradedFallbackMatrix activeFallbacks={activeFallbacks} />

      {/* ── Stage cards ─────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="tv-section-label">
          <Activity className="w-3 h-3" />
          Sequential Pipeline Stages
        </div>

        {PIPELINE_STAGES.map((stage, idx) => {
          const statusObj = stageStatuses[idx] || { status: 'idle' };
          const isActive    = pipelineState === 'processing' && activeStageIndex === idx;
          const isCompleted = statusObj.status === 'complete';
          const isFailed    = statusObj.status === 'failed';
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
