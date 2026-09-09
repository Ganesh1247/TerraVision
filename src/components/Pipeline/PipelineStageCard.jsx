import React, { useState } from 'react';
import {
  CheckCircle2, Loader2, AlertTriangle,
  ChevronDown, ChevronUp, RotateCcw, Code
} from 'lucide-react';

export default function PipelineStageCard({
  stage, statusObj, isActive, isCompleted, isFailed, stageProgress, onRetry
}) {
  const [expanded, setExpanded] = useState(false);

  /* ── Border / background per state ─────────────────────────── */
  let cardStyle = {
    background:   'var(--bg-surface)',
    border:       '1px solid var(--border-subtle)',
    opacity:      1,
  };
  if (isActive) {
    cardStyle = {
      background:  'var(--bg-raised)',
      border:      '1px solid var(--accent-cyan)',
      boxShadow:   'var(--shadow-glow)',
      opacity:     1,
    };
  } else if (isCompleted) {
    cardStyle = {
      background:  'var(--bg-surface)',
      border:      '1px solid rgba(52,211,153,0.3)',
      opacity:     1,
    };
  } else if (isFailed) {
    cardStyle = {
      background:  'rgba(251,113,133,0.05)',
      border:      '1px solid rgba(251,113,133,0.4)',
      opacity:     1,
    };
  } else {
    cardStyle.opacity = 0.6;
  }

  /* ── Status icon ────────────────────────────────────────────── */
  const StatusIcon = () => {
    if (isActive) return (
      <div className="w-6 h-6 rounded-full flex items-center justify-center"
        style={{ background: 'var(--accent-cyan-bg)', border: '1px solid var(--accent-cyan)' }}>
        <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: 'var(--accent-cyan)' }} />
      </div>
    );
    if (isCompleted) return (
      <div className="w-6 h-6 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.4)' }}>
        <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--accent-emerald)' }} />
      </div>
    );
    if (isFailed) return (
      <div className="w-6 h-6 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(251,113,133,0.12)', border: '1px solid rgba(251,113,133,0.4)' }}>
        <AlertTriangle className="w-3.5 h-3.5" style={{ color: 'var(--accent-rose)' }} />
      </div>
    );
    return (
      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold"
        style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
        {String(stage.index).padStart(2, '0')}
      </div>
    );
  };

  return (
    <div
      className="rounded-lg transition-all duration-200"
      style={cardStyle}
    >
      {/* Header row */}
      <div className="p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0"><StatusIcon /></div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                {stage.index}. {stage.name}
              </span>
              {isActive && (
                <span className="tv-badge tv-badge-cyan animate-pulse">ACTIVE</span>
              )}
            </div>
            <p className="text-[11px] truncate" style={{ color: 'var(--text-secondary)' }}>
              {stage.coreTechnique}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {statusObj.throughput && (
            <span className="hidden sm:inline text-[10px] font-mono px-2 py-0.5 rounded"
              style={{ background: 'var(--bg-overlay)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
              {statusObj.throughput}
            </span>
          )}
          {statusObj.duration && (
            <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
              {statusObj.duration}
            </span>
          )}
          {isFailed && (
            <button onClick={onRetry} className="tv-btn tv-btn-danger tv-btn-sm">
              <RotateCcw className="w-3 h-3" /> Retry
            </button>
          )}
          <button
            onClick={() => setExpanded(e => !e)}
            className="tv-btn tv-btn-ghost tv-btn-icon"
            style={{ padding: '4px' }}
            title="Expand stage details"
          >
            {expanded
              ? <ChevronUp className="w-3.5 h-3.5" />
              : <ChevronDown className="w-3.5 h-3.5" />
            }
          </button>
        </div>
      </div>

      {/* Active stage progress bar */}
      {isActive && (
        <div className="px-3 pb-2">
          <div className="tv-progress-track h-1.5">
            <div className="tv-progress-fill" style={{ width: `${stageProgress}%` }} />
          </div>
        </div>
      )}

      {/* Error message */}
      {isFailed && statusObj.error && (
        <div className="px-3 pb-3 pt-1 text-xs rounded-b-lg border-t"
          style={{ color: 'var(--accent-rose)', background: 'rgba(251,113,133,0.05)', borderColor: 'rgba(251,113,133,0.2)' }}>
          <strong>Fault Captured:</strong> {statusObj.error}
        </div>
      )}

      {/* Expanded details */}
      {expanded && (
        <div className="px-3 pb-3 pt-2 space-y-2 border-t rounded-b-lg animate-fade-in"
          style={{ background: 'var(--bg-base)', borderColor: 'var(--border-subtle)' }}>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {stage.description}
          </p>
          <div className="flex items-center gap-2 text-[10px] font-mono p-2 rounded"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <Code className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--accent-cyan)' }} />
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Module:</span>
            <span className="truncate" style={{ color: 'var(--accent-cyan)' }}>{stage.module}</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Execution Sequence:
            </span>
            <ul className="space-y-0.5">
              {stage.actions.map((act, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--accent-cyan)' }}>▹</span>
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
