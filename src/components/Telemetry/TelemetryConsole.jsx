import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Copy, Check, Trash2, Filter } from 'lucide-react';

export default function TelemetryConsole({ logs = [], onClear }) {
  const [filterLevel, setFilterLevel] = useState('all');
  const [copied, setCopied] = useState(false);
  const logEndRef = useRef(null);

  const filteredLogs = logs.filter(l => {
    if (filterLevel === 'all') return true;
    return l.level === filterLevel;
  });

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleCopy = () => {
    const text = filteredLogs.map(l => `[${l.timestamp}] [${l.tag}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTagColor = (level) => {
    if (level === 'success') return 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30';
    if (level === 'warning') return 'text-amber-400 bg-amber-950/60 border-amber-500/30';
    if (level === 'error') return 'text-red-400 bg-red-950/60 border-red-500/30';
    return 'text-brand-cyan bg-cyan-950/60 border-cyan-500/30';
  };

  return (
    <div className="rounded-xl bg-dark-950 border border-slate-800 flex flex-col h-64 overflow-hidden font-mono text-xs">
      {/* Console Header */}
      <div className="px-3 py-2 bg-dark-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-300">
          <Terminal className="w-4 h-4 text-brand-cyan" />
          <span className="font-bold uppercase tracking-wider text-[11px]">
            Real-Time Edge Daemon Telemetry Stream
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Dropdown */}
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="bg-dark-950 border border-slate-800 text-slate-300 text-[10px] rounded px-2 py-0.5"
          >
            <option value="all">All Modules</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warnings</option>
            <option value="error">Errors</option>
          </select>

          {/* Copy logs */}
          <button
            onClick={handleCopy}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Copy logs to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Logs Scroll Area */}
      <div className="flex-1 p-3 overflow-y-auto space-y-1.5 text-[11px] bg-dark-950/90 selection:bg-brand-cyan/20">
        {filteredLogs.map((log, idx) => (
          <div key={idx} className="flex items-start gap-2 leading-relaxed">
            <span className="text-slate-600 shrink-0 select-none">[{log.timestamp}]</span>
            <span className={`px-1 rounded border text-[10px] uppercase shrink-0 ${getTagColor(log.level)}`}>
              {log.tag}
            </span>
            <span className={`break-all ${
              log.level === 'error' ? 'text-red-400 font-semibold' : log.level === 'warning' ? 'text-amber-300' : 'text-slate-300'
            }`}>
              {log.message}
            </span>
          </div>
        ))}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}
