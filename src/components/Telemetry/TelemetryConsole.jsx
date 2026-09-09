import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Copy, Check, Trash2, ChevronDown, ChevronUp, Filter } from 'lucide-react';

const LEVEL_STYLES = {
  success: { text: 'text-[var(--accent-emerald)]', badge: 'tv-badge-emerald' },
  warning: { text: 'text-[var(--accent-amber)]',   badge: 'tv-badge-amber'   },
  error:   { text: 'text-[var(--accent-rose)]',    badge: 'tv-badge-rose'    },
  info:    { text: 'text-[var(--accent-cyan)]',    badge: 'tv-badge-cyan'    },
};

export default function TelemetryConsole({ logs = [] }) {
  const [filterLevel, setFilterLevel] = useState('all');
  const [copied, setCopied]           = useState(false);
  const [paused, setPaused]           = useState(false);
  const [expanded, setExpanded]       = useState(true);
  const logEndRef = useRef(null);

  const filteredLogs = logs.filter(l =>
    filterLevel === 'all' || l.level === filterLevel
  );

  useEffect(() => {
    if (!paused) logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, paused]);

  const handleCopy = () => {
    const text = filteredLogs.map(l => `[${l.timestamp}] [${l.tag}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const levelOptions = ['all', 'info', 'success', 'warning', 'error'];
  const counts = logs.reduce((acc, l) => { acc[l.level] = (acc[l.level] || 0) + 1; return acc; }, {});

  return (
    <div className="tv-card overflow-hidden" style={{ fontFamily: 'var(--font-mono)' }}>
      {/* Header */}
      <div className="px-3 py-2.5 flex items-center justify-between border-b border-[var(--border-subtle)]"
        style={{ background: 'var(--bg-surface)' }}>
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>
            Edge Daemon Telemetry
          </span>
          <span className="tv-live-dot" />
          {/* Log counts */}
          <div className="flex gap-1 ml-1">
            {counts.error   > 0 && <span className="tv-badge tv-badge-rose">{counts.error}E</span>}
            {counts.warning > 0 && <span className="tv-badge tv-badge-amber">{counts.warning}W</span>}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Filter */}
          <select
            value={filterLevel}
            onChange={e => setFilterLevel(e.target.value)}
            className="tv-input py-0.5 px-2 text-[10px] h-6 w-auto"
            style={{ minWidth: 70 }}
          >
            {levelOptions.map(l => (
              <option key={l} value={l}>{l === 'all' ? 'All' : l.charAt(0).toUpperCase() + l.slice(1)}</option>
            ))}
          </select>

          {/* Pause */}
          <button
            onClick={() => setPaused(p => !p)}
            className={`tv-btn tv-btn-sm tv-btn-ghost px-2 py-0.5 text-[10px] ${paused ? 'border-[var(--accent-amber)] text-[var(--accent-amber)]' : ''}`}
            title={paused ? 'Resume auto-scroll' : 'Pause auto-scroll'}
          >
            {paused ? '▶' : '⏸'}
          </button>

          {/* Copy */}
          <button
            onClick={handleCopy}
            className="tv-btn tv-btn-sm tv-btn-ghost tv-btn-icon"
            title="Copy all logs"
          >
            {copied
              ? <Check className="w-3.5 h-3.5 text-[var(--accent-emerald)]" />
              : <Copy className="w-3.5 h-3.5" />
            }
          </button>

          {/* Expand / Collapse */}
          <button
            onClick={() => setExpanded(e => !e)}
            className="tv-btn tv-btn-sm tv-btn-ghost tv-btn-icon"
            title={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded
              ? <ChevronUp className="w-3.5 h-3.5" />
              : <ChevronDown className="w-3.5 h-3.5" />
            }
          </button>
        </div>
      </div>

      {/* Log area */}
      {expanded && (
        <div
          className="h-52 overflow-y-auto tv-scroll-panel p-3 space-y-1.5 text-[11px]"
          style={{ background: 'var(--bg-base)', fontFamily: '"JetBrains Mono", monospace' }}
        >
          {filteredLogs.length === 0 && (
            <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
              No log entries yet. Start a reconstruction to see telemetry.
            </p>
          )}
          {filteredLogs.map((log, idx) => {
            const style = LEVEL_STYLES[log.level] || LEVEL_STYLES.info;
            return (
              <div key={idx} className="flex items-start gap-2 leading-relaxed group animate-fade-in">
                <span className="shrink-0 select-none text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {log.timestamp}
                </span>
                <span className={`tv-badge ${style.badge} shrink-0 text-[9px]`}>
                  {log.tag}
                </span>
                <span className={`break-all flex-1 ${style.text} group-hover:opacity-80 transition-opacity`}>
                  {log.message}
                </span>
              </div>
            );
          })}
          <div ref={logEndRef} />
        </div>
      )}

      {/* Footer bar */}
      <div className="px-3 py-1.5 flex items-center justify-between border-t border-[var(--border-subtle)]"
        style={{ background: 'var(--bg-surface)' }}>
        <span className="text-[10px]" style={{ color: 'var(--text-muted)', fontFamily: '"JetBrains Mono", monospace' }}>
          {filteredLogs.length} / {logs.length} entries
          {paused && <span className="ml-2 text-[var(--accent-amber)]">⏸ PAUSED</span>}
        </span>
        <span className="text-[10px]" style={{ color: 'var(--text-muted)', fontFamily: '"JetBrains Mono", monospace' }}>
          AIR-GAP · EDGE KERNEL
        </span>
      </div>
    </div>
  );
}
