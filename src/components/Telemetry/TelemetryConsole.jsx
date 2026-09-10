import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal, 
  Copy, 
  Check, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Download,
  Filter,
  Play,
  Pause
} from 'lucide-react';

const LEVEL_STYLES = {
  success: { text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  warning: { text: 'text-amber-400',   badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  error:   { text: 'text-rose-400',    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  info:    { text: 'text-cyan-400',    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
};

export default function TelemetryConsole({ logs = [], onClearLogs }) {
  const [filterLevel, setFilterLevel] = useState('all');
  const [copied, setCopied]           = useState(false);
  const [paused, setPaused]           = useState(false);
  const [expanded, setExpanded]       = useState(true);
  const [localLogs, setLocalLogs]     = useState(logs);
  const consoleBodyRef                = useRef(null);

  useEffect(() => {
    setLocalLogs(logs);
  }, [logs]);

  const filteredLogs = localLogs.filter(l =>
    filterLevel === 'all' || l.level === filterLevel
  );

  useEffect(() => {
    if (!paused && consoleBodyRef.current) {
      consoleBodyRef.current.scrollTop = consoleBodyRef.current.scrollHeight;
    }
  }, [filteredLogs, paused]);

  const handleCopy = () => {
    const text = filteredLogs.map(l => `[${l.timestamp}] [${l.tag}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    if (onClearLogs) {
      onClearLogs();
    } else {
      setLocalLogs([]);
    }
  };

  const handleDownloadLog = () => {
    const text = filteredLogs.map(l => `[${l.timestamp}] [${l.tag}] [${l.level.toUpperCase()}] ${l.message}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `terravision-kernel-${Date.now()}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const levelOptions = ['all', 'info', 'success', 'warning', 'error'];
  const counts = localLogs.reduce((acc, l) => { acc[l.level] = (acc[l.level] || 0) + 1; return acc; }, {});

  return (
    <div className="tv-card rounded-xl overflow-hidden border border-slate-800 bg-dark-950 font-mono shadow-xl select-none">
      {/* Console Header */}
      <div className="px-3.5 py-2.5 flex items-center justify-between border-b border-slate-800 bg-slate-900/80">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded flex items-center justify-center bg-cyan-500/20 text-cyan-400">
            <Terminal className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-slate-100">
            EDGE KERNEL OBSERVABILITY STREAM
          </span>
          <span className="tv-live-dot" />

          {/* Counts */}
          <div className="hidden sm:flex gap-1 ml-2">
            {counts.error > 0 && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {counts.error} ERR
              </span>
            )}
            {counts.warning > 0 && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {counts.warning} WARN
              </span>
            )}
          </div>
        </div>

        {/* Console Action Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Filter Dropdown */}
          <select
            value={filterLevel}
            onChange={e => setFilterLevel(e.target.value)}
            className="py-1 px-2 text-[10px] rounded bg-dark-950 border border-slate-700 text-slate-200 outline-none hover:border-cyan-400/50 cursor-pointer"
          >
            {levelOptions.map(l => (
              <option key={l} value={l}>{l === 'all' ? 'ALL LEVELS' : l.toUpperCase()}</option>
            ))}
          </select>

          {/* Pause / Resume */}
          <button
            onClick={() => setPaused(!paused)}
            className={`p-1.5 rounded text-[10px] border transition-colors ${
              paused ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-white/5 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title={paused ? 'Resume Auto-Scroll' : 'Pause Auto-Scroll'}
          >
            {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          {/* Clear Button */}
          <button
            onClick={handleClear}
            className="px-2 py-1 rounded text-[10px] font-bold bg-white/5 border border-slate-700 hover:bg-rose-500/20 hover:border-rose-500/40 hover:text-rose-300 text-slate-400 transition-colors"
            title="Clear console logs"
          >
            CLEAR
          </button>

          {/* Download Log Button */}
          <button
            onClick={handleDownloadLog}
            className="px-2 py-1 rounded text-[10px] font-bold bg-white/5 border border-slate-700 hover:bg-cyan-500/20 hover:border-cyan-500/40 hover:text-cyan-300 text-slate-400 flex items-center gap-1 transition-colors"
            title="Download full log file"
          >
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">DOWNLOAD LOG</span>
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded text-[10px] bg-white/5 border border-slate-700 hover:text-white text-slate-400 transition-colors"
            title="Copy all logs to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Expand / Collapse */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded text-[10px] bg-white/5 border border-slate-700 hover:text-white text-slate-400 transition-colors ml-1"
            title={expanded ? 'Collapse console' : 'Expand console'}
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Terminal Log Area */}
      {expanded && (
        <div 
          ref={consoleBodyRef}
          className="h-48 overflow-y-auto tv-scroll-panel p-3 space-y-1 text-xs bg-dark-950/95 border-b border-slate-800"
        >
          {filteredLogs.length === 0 && (
            <p className="text-center py-8 text-slate-500 text-xs">
              No telemetry entries recorded. Execute a reconstruction pipeline to stream logs.
            </p>
          )}

          {filteredLogs.map((log, idx) => {
            const style = LEVEL_STYLES[log.level] || LEVEL_STYLES.info;
            return (
              <div key={idx} className="flex items-start gap-2 leading-relaxed animate-fade-in group hover:bg-white/5 px-1 py-0.5 rounded">
                <span className="shrink-0 text-[10px] text-slate-500 select-none">
                  [{log.timestamp}]
                </span>
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${style.badge} shrink-0`}>
                  {log.tag}
                </span>
                <span className={`break-all flex-1 text-[11px] ${style.text}`}>
                  {log.message}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Terminal Status Bar */}
      <div className="px-3.5 py-1.5 flex items-center justify-between text-[10px] text-slate-500 bg-slate-900/60">
        <div className="flex items-center gap-2">
          <span>{filteredLogs.length} / {localLogs.length} entries</span>
          {paused && <span className="text-amber-400 font-bold">⏸ AUTO-SCROLL PAUSED</span>}
        </div>
        <span className="text-cyan-400/80 font-mono">TELEMETRY KERNEL · ACTIVE</span>
      </div>
    </div>
  );
}
