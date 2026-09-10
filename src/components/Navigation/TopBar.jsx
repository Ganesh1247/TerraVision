import React, { useState, useRef, useEffect } from 'react';
import ThemeSelector from './ThemeSelector';
import { 
  Cpu, 
  HardDrive, 
  Activity,
  WifiOff,
  Wifi,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  Lock,
  Radio
} from 'lucide-react';

export default function TopBar({
  currentJob,
  systemHealth,
  pipelineState,
  onOpenSystemDiagnostics
}) {
  const [isOffline, setIsOffline] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tv-offline-mode');
      return saved !== 'false';
    }
    return true;
  });
  const [isOfflineMenuOpen, setIsOfflineMenuOpen] = useState(false);
  const offlineMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (offlineMenuRef.current && !offlineMenuRef.current.contains(e.target)) {
        setIsOfflineMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOfflineMode = () => {
    const next = !isOffline;
    setIsOffline(next);
    localStorage.setItem('tv-offline-mode', String(next));
  };

  const gpuLoad = systemHealth?.gpu?.loadPct ?? 65;
  const cpuLoad = systemHealth?.cpu?.loadPct ?? systemHealth?.system?.cpuUsagePct ?? 42;
  const vramUsed = systemHealth?.gpu?.vramUsedGb ?? 3.4;

  return (
    <header 
      className="h-16 px-4 lg:px-6 flex items-center justify-between border-b border-[var(--border-subtle)] select-none shrink-0" 
      style={{ background: 'var(--bg-elevated)' }}
    >
      {/* Left: Mission / Project info & Live Status */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <div className="flex items-center gap-2.5">
          <div className="text-xs font-mono font-bold px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
            JOB: {currentJob?.id || 'TV-2026-ACTIVE'}
          </div>
          <span className="hidden sm:inline text-xs font-bold text-slate-200 truncate max-w-[180px] lg:max-w-[240px]">
            {currentJob?.dataset?.name || 'High-Parallax Drone Survey'}
          </span>
        </div>

        {/* Processing status pill */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono font-semibold border border-[var(--border-subtle)] bg-dark-950/60">
          {pipelineState === 'processing' ? (
            <>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-cyan-400">PIPELINE RUNNING</span>
            </>
          ) : pipelineState === 'completed' ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-emerald-400">3D MODEL READY</span>
            </>
          ) : pipelineState === 'error' ? (
            <>
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-rose-400">FAULT RECOVERY</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              <span className="text-slate-400">SYSTEM STANDBY</span>
            </>
          )}
        </div>
      </div>

      {/* Right: Offline Mode Button, Hardware pills, Theme Selector & Operator Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* ── Prominent Offline Mode Top Button ── */}
        <div className="relative" ref={offlineMenuRef}>
          <button
            onClick={() => setIsOfflineMenuOpen(!isOfflineMenuOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all shadow-sm ${
              isOffline
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.18)]'
                : 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.18)]'
            }`}
            title="Click to view or toggle Offline Air-Gapped Mode"
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isOffline ? 'bg-emerald-400' : 'bg-amber-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                isOffline ? 'bg-emerald-500' : 'bg-amber-500'
              }`} />
            </span>

            {isOffline ? (
              <WifiOff className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <Wifi className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            )}

            <span className="tracking-wide">
              {isOffline ? 'OFFLINE MODE' : 'ONLINE MODE'}
            </span>

            <span className={`hidden md:inline text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase border ${
              isOffline
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
                : 'bg-amber-500/20 border-amber-500/40 text-amber-200'
            }`}>
              {isOffline ? 'AIR-GAPPED' : 'NETWORK SYNC'}
            </span>

            <ChevronDown className={`w-3 h-3 transition-transform ${isOfflineMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Offline Mode Status Popover */}
          {isOfflineMenuOpen && (
            <div 
              className="absolute right-0 mt-2 w-80 rounded-xl p-4 z-50 animate-scale-in shadow-2xl border"
              style={{
                background: 'var(--bg-elevated)',
                borderColor: 'var(--border-default)',
                boxShadow: 'var(--shadow-panel)'
              }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg border ${
                    isOffline ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  }`}>
                    {isOffline ? <ShieldCheck className="w-4 h-4" /> : <Radio className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 font-display">
                      {isOffline ? 'Air-Gapped Edge Node' : 'Connected Network Mode'}
                    </h4>
                    <p className="text-[10px] font-mono text-slate-400">
                      SIH26158 Specification
                    </p>
                  </div>
                </div>

                <button
                  onClick={toggleOfflineMode}
                  className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded transition-colors border ${
                    isOffline
                      ? 'bg-emerald-500 text-dark-950 border-emerald-400 hover:bg-emerald-400'
                      : 'bg-amber-500 text-dark-950 border-amber-400 hover:bg-amber-400'
                  }`}
                >
                  {isOffline ? 'Toggle to Online' : 'Toggle to Offline'}
                </button>
              </div>

              <div className="py-3 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-slate-500" /> External API Calls:
                  </span>
                  <strong className={isOffline ? 'text-emerald-400' : 'text-amber-400'}>
                    {isOffline ? '0 (Blocked)' : 'Allowed'}
                  </strong>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-slate-500" /> GPS Dependency:
                  </span>
                  <strong className="text-emerald-400">None (VIO & Visual Scale)</strong>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Cpu className="w-3 h-3 text-slate-500" /> Neural Compute:
                  </span>
                  <strong className="text-cyan-400">100% On-Device Host GPU</strong>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <HardDrive className="w-3 h-3 text-slate-500" /> Database Engine:
                  </span>
                  <strong className="text-slate-200">Local SQLite (WAL Mode)</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--border-subtle)] text-[10px] font-mono text-slate-400 leading-tight">
                {isOffline 
                  ? '🔒 Operating in zero-trust air-gapped mode. All photogrammetry and point clouds stay on this workstation.'
                  : '📡 Connected mode enabled for local network streaming and remote export targets.'}
              </div>
            </div>
          )}
        </div>

        {/* Hardware telemetry pills */}
        <div 
          onClick={onOpenSystemDiagnostics}
          className="hidden xl:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-dark-950/70 border border-[var(--border-subtle)] hover:border-cyan-500/40 cursor-pointer transition-colors text-xs font-mono"
          title="Click to view detailed system diagnostics"
        >
          <div className="flex items-center gap-1.5 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>GPU {gpuLoad.toFixed(0)}%</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>CPU {cpuLoad.toFixed(0)}%</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-slate-300">
            <HardDrive className="w-3.5 h-3.5 text-violet-400" />
            <span>{vramUsed.toFixed(1)}GB</span>
          </div>
        </div>

        {/* Theme & Palette Selector */}
        <ThemeSelector />

        {/* Operator Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-[var(--border-subtle)]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white text-xs font-black shadow-md">
            OP
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-200 leading-tight">Field Lead</span>
            <span className="text-[10px] font-mono text-[var(--accent-cyan)]">NTRO-SIH26158</span>
          </div>
        </div>
      </div>
    </header>
  );
}
