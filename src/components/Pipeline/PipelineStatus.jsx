import React, { useState, useEffect } from 'react';
import { PIPELINE_STAGES } from '../../data/pipelineStages';
import PipelineStageCard from './PipelineStageCard';
import DegradedFallbackMatrix from './DegradedFallbackMatrix';
import { 
  Activity, 
  CheckCircle2, 
  AlertOctagon, 
  Loader2, 
  Clock, 
  Hourglass, 
  Camera, 
  Sparkles, 
  Box,
  Layers,
  ChevronRight
} from 'lucide-react';

const STATE_CONFIG = {
  idle: {
    badge: 'tv-badge-cyan',
    icon: Activity,
    iconClass: 'text-slate-400',
    label: 'STANDBY',
  },
  processing: {
    badge: 'tv-badge-cyan',
    icon: Loader2,
    iconClass: 'text-cyan-400 animate-spin',
    label: 'RECONSTRUCTING',
  },
  completed: {
    badge: 'tv-badge-emerald',
    icon: CheckCircle2,
    iconClass: 'text-emerald-400',
    label: '3D READY',
  },
  error: {
    badge: 'tv-badge-rose',
    icon: AlertOctagon,
    iconClass: 'text-rose-400',
    label: 'FAULT DETECTED',
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

  // Compute realistic dynamic telemetry counters based on stage
  const [elapsedSec, setElapsedSec] = useState(0);

  useEffect(() => {
    let timer;
    if (pipelineState === 'processing') {
      timer = setInterval(() => setElapsedSec(s => s + 1), 1000);
    } else if (pipelineState === 'idle') {
      setElapsedSec(0);
    }
    return () => clearInterval(timer);
  }, [pipelineState]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const estRemaining = pipelineState === 'completed' 
    ? '00:00' 
    : pipelineState === 'processing' 
    ? formatTime(Math.max(0, Math.round((elapsedSec / Math.max(totalProgress, 1)) * (100 - totalProgress)))) 
    : '--:--';

  const framesProcessed = Math.min(428, Math.floor((totalProgress / 100) * 428));
  const featuresDetected = Math.min(84200, Math.floor((totalProgress / 100) * 84200));
  const pointsGenerated = totalProgress < 30 ? '0' : totalProgress < 70 ? `${(Math.floor((totalProgress / 100) * 850)).toLocaleString()}K` : '1.24M';

  // Generate ASCII-like block meter
  const totalBlocks = 20;
  const filledBlocks = Math.round((totalProgress / 100) * totalBlocks);
  const blockMeter = '█'.repeat(filledBlocks) + '░'.repeat(totalBlocks - filledBlocks);

  return (
    <div className="space-y-4 select-none">
      {/* ── Master Technical Pipeline Card ─────────────────────────── */}
      <div className="tv-card p-4 rounded-xl border border-cyan-500/30 bg-gradient-to-b from-dark-950 to-slate-950 shadow-xl space-y-3.5 relative overflow-hidden">
        {/* Top glowing accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        {/* Header and status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(34,211,238,0.2)]">
              <Icon className={`w-5 h-5 ${cfg.iconClass}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-100 font-mono">
                  RECONSTRUCTION PIPELINE
                </h3>
                <span className={`tv-badge ${cfg.badge} text-[10px]`}>{cfg.label}</span>
              </div>
              {currentAction && (
                <p className="text-[11px] mt-0.5 font-mono text-cyan-300 truncate max-w-[260px] sm:max-w-md">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 mr-1.5 animate-pulse" />
                  {currentAction}
                </p>
              )}
            </div>
          </div>

          {/* Large Progress Display */}
          <div className="text-right shrink-0">
            <span className="text-3xl font-black font-mono leading-none text-white tracking-tight">
              {totalProgress}%
            </span>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">
              STAGE {stageNum} OF 9
            </div>
          </div>
        </div>

        {/* Technical ASCII Block Meter & Smooth Progress Fill */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="text-cyan-400 font-bold tracking-wider">
              PROGRESS [{blockMeter}]
            </span>
            <span className="text-slate-300 font-bold">{totalProgress}%</span>
          </div>

          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                pipelineState === 'completed'
                  ? 'bg-emerald-400 shadow-[0_0_12px_#34d399]'
                  : pipelineState === 'error'
                  ? 'bg-rose-500 shadow-[0_0_12px_#ef4444]'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_12px_rgba(34,211,238,0.5)]'
              }`}
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>

        {/* Live Hardware & Telemetry Counters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono">
          <div className="bg-dark-950/60 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-500 block flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" /> ELAPSED
            </span>
            <strong className="text-slate-200 text-xs mt-0.5 block">
              {formatTime(elapsedSec)}
            </strong>
          </div>

          <div className="bg-dark-950/60 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-500 block flex items-center gap-1">
              <Hourglass className="w-3 h-3 text-amber-400" /> REMAINING
            </span>
            <strong className="text-slate-200 text-xs mt-0.5 block">
              {estRemaining}
            </strong>
          </div>

          <div className="bg-dark-950/60 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-500 block flex items-center gap-1">
              <Camera className="w-3 h-3 text-cyan-400" /> FRAMES
            </span>
            <strong className="text-slate-200 text-xs mt-0.5 block">
              {framesProcessed} / 428
            </strong>
          </div>

          <div className="bg-dark-950/60 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-500 block flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" /> FEATURES
            </span>
            <strong className="text-slate-200 text-xs mt-0.5 block">
              {featuresDetected.toLocaleString()}
            </strong>
          </div>

          <div className="bg-dark-950/60 p-2 rounded-lg border border-slate-800 col-span-2 sm:col-span-1">
            <span className="text-slate-500 block flex items-center gap-1">
              <Box className="w-3 h-3 text-violet-400" /> 3D POINTS
            </span>
            <strong className="text-cyan-400 text-xs mt-0.5 block">
              {pointsGenerated}
            </strong>
          </div>
        </div>
      </div>

      {/* ── Active Software Fallback Matrix ────────────────────────── */}
      <DegradedFallbackMatrix activeFallbacks={activeFallbacks} />

      {/* ── 9 Sequential Pipeline Stage Cards ──────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="tv-section-label">
            <Activity className="w-3 h-3 text-cyan-400" />
            <span>Sequential Pipeline Execution</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">9 Core Stages</span>
        </div>

        <div className="space-y-2">
          {PIPELINE_STAGES.map((stage, idx) => {
            const statusObj = stageStatuses[idx] || { status: 'idle' };
            const isActive    = pipelineState === 'processing' && activeStageIndex === idx;
            const isCompleted = statusObj.status === 'complete' || (pipelineState === 'completed');
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
    </div>
  );
}
