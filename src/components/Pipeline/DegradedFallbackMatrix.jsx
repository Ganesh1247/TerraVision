import React from 'react';
import { SOFTWARE_FALLBACKS } from '../../data/pipelineStages';
import { ShieldCheck } from 'lucide-react';

export default function DegradedFallbackMatrix({ activeFallbacks = [] }) {
  return (
    <div className="tv-surface p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="tv-section-label flex-1">
          <ShieldCheck className="w-3 h-3" />
          Software Fallback Matrix
        </div>
        <span className="tv-badge tv-badge-cyan ml-2 shrink-0">
          {activeFallbacks.length} Active
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {SOFTWARE_FALLBACKS.map((fb) => {
          const isActive = activeFallbacks.includes(fb.id);
          return (
            <div
              key={fb.id}
              className="p-2 rounded-lg text-xs transition-all"
              style={{
                background:    isActive ? 'var(--accent-cyan-bg)'   : 'var(--bg-overlay)',
                border:        `1px solid ${isActive ? 'rgba(34,211,238,0.35)' : 'var(--border-subtle)'}`,
                opacity:       isActive ? 1 : 0.5,
                boxShadow:     isActive ? 'var(--shadow-glow)' : 'none',
              }}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-semibold truncate text-[11px]"
                  style={{ color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
                  {fb.name}
                </span>
                {isActive ? (
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                      style={{ background: 'var(--accent-cyan)' }} />
                    <span className="relative inline-flex rounded-full h-2 w-2"
                      style={{ background: 'var(--accent-cyan)' }} />
                  </span>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--bg-muted)' }} />
                )}
              </div>
              <div className="text-[10px] font-mono truncate" style={{ color: 'var(--text-secondary)' }}>
                {fb.algorithm}
              </div>
              <div className="text-[9px] truncate mt-0.5" style={{ color: 'var(--text-muted)' }}
                title={fb.module}>
                {fb.module.split('/')[1]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
