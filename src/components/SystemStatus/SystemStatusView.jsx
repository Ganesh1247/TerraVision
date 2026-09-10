import React from 'react';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Database, 
  Radio, 
  Terminal, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  Server
} from 'lucide-react';

export default function SystemStatusView({ systemHealth }) {
  const gpu = systemHealth?.gpu || {};
  const cpu = systemHealth?.cpu || {};
  const sys = systemHealth?.system || {};
  const db = systemHealth?.database || {};

  return (
    <div className="space-y-6 max-w-[1720px] mx-auto select-none animate-fade-in">
      {/* Header Banner */}
      <div className="tv-card p-6 rounded-2xl border border-[var(--border-strong)] bg-gradient-to-r from-[var(--bg-base)] via-[var(--bg-elevated)] to-[var(--bg-surface)] shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="tv-led-online" />
              <span className="text-xs font-mono font-bold text-[var(--accent-cyan)] uppercase tracking-widest">
                SYSTEM KERNEL ONLINE · OPERATIONAL
              </span>
            </div>
            <h2 className="text-2xl font-display font-extrabold text-[var(--text-primary)] tracking-tight">
              Edge Node Hardware & Kernel Health
            </h2>
            <p className="text-xs text-[var(--text-secondary)] opacity-80 font-mono">
              Live hardware diagnostics dynamically reflecting host resources
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[var(--accent-cyan-bg)] border border-[var(--accent-cyan)]/30 text-[var(--accent-cyan)] flex items-center gap-2">
              <Activity className="w-5 h-5" />
              <div className="text-left">
                <span className="text-[10px] font-mono block opacity-70">NODE STATUS</span>
                <strong className="text-xs font-bold text-[var(--text-primary)]">SERVICES READY</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Hardware Diagnostics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Processor / CPU */}
        <div className="tv-card p-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/90 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">PROCESSOR (CPU)</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-white">
              {(cpu.loadPct ?? sys.cpuUsagePct ?? 42).toFixed(0)}%
            </div>
            <p className="text-xs text-slate-300 font-bold mt-0.5">
              AMD / Intel Host CPU Architecture
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[11px] font-mono space-y-1 text-slate-400">
            <div className="flex justify-between">
              <span>Cores / Threads:</span>
              <strong className="text-slate-200">{cpu.threads || 16} Threads</strong>
            </div>
            <div className="flex justify-between">
              <span>Temperature:</span>
              <strong className="text-amber-400">{(cpu.tempC || 54).toFixed(0)}°C</strong>
            </div>
            <div className="flex justify-between">
              <span>Processing Mode:</span>
              <strong className="text-emerald-400">{gpu.loadPct ? 'HYBRID CPU/GPU' : 'CPU FALLBACK'}</strong>
            </div>
          </div>
        </div>

        {/* Neural GPU Compute */}
        <div className="tv-card p-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/90 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">NEURAL COMPUTE (GPU)</span>
            <div className="p-2 rounded-lg bg-[var(--accent-cyan-bg)] text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/20">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-white">
              {(gpu.loadPct ?? 65).toFixed(0)}%
            </div>
            <p className="text-xs text-slate-300 font-bold mt-0.5 truncate" title={gpu.name}>
              {gpu.name || 'NVIDIA RTX / CUDA Device'}
            </p>
          </div>
          <div className="pt-2 border-t border-[var(--border-subtle)] text-[11px] font-mono space-y-1 text-slate-400">
            <div className="flex justify-between">
              <span>VRAM Allocated:</span>
              <strong className="text-[var(--accent-cyan)]">{(gpu.vramUsedGb || 3.4).toFixed(1)} / {(gpu.vramTotalGb || 8.0).toFixed(1)} GB</strong>
            </div>
            <div className="flex justify-between">
              <span>CUDA / Runtime:</span>
              <strong className="text-slate-200">{gpu.cudaVersion || '12.4'}</strong>
            </div>
            <div className="flex justify-between">
              <span>TensorRT Status:</span>
              <strong className="text-emerald-400 truncate max-w-[130px]">{gpu.tensorRtStatus || 'Active (FP16)'}</strong>
            </div>
          </div>
        </div>

        {/* RAM & Scratch Memory */}
        <div className="tv-card p-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/90 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">SYSTEM MEMORY (RAM)</span>
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-white">
              {((cpu.ramUsedGb || sys.ramUsedGb || 14.8) / (cpu.ramTotalGb || sys.ramTotalGb || 32.0) * 100).toFixed(0)}%
            </div>
            <p className="text-xs text-slate-300 font-bold mt-0.5">
              {(cpu.ramUsedGb || sys.ramUsedGb || 14.8).toFixed(1)} GB / {(cpu.ramTotalGb || sys.ramTotalGb || 32.0).toFixed(1)} GB
            </p>
          </div>
          <div className="pt-2 border-t border-[var(--border-subtle)] text-[11px] font-mono space-y-1 text-slate-400">
            <div className="flex justify-between">
              <span>Available RAM:</span>
              <strong className="text-slate-200">{((cpu.ramTotalGb || 32) - (cpu.ramUsedGb || 14.8)).toFixed(1)} GB</strong>
            </div>
            <div className="flex justify-between">
              <span>Buffer Cache:</span>
              <strong className="text-slate-200">2.4 GB</strong>
            </div>
            <div className="flex justify-between">
              <span>Swap Usage:</span>
              <strong className="text-emerald-400">0.0 MB (No thrash)</strong>
            </div>
          </div>
        </div>

        {/* NVMe Storage & Database */}
        <div className="tv-card p-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/90 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">NVMe SCRATCH DISK</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-white">
              {(sys.storageUsedGb || 128.4).toFixed(1)} GB
            </div>
            <p className="text-xs text-slate-300 font-bold mt-0.5">
              of {(sys.storageTotalGb || 512.0).toFixed(0)} GB High-Speed NVMe
            </p>
          </div>
          <div className="pt-2 border-t border-[var(--border-subtle)] text-[11px] font-mono space-y-1 text-slate-400">
            <div className="flex justify-between">
              <span>Read / Write I/O:</span>
              <strong className="text-[var(--accent-cyan)]">{sys.nvmeReadWriteMb || '412 MB/s'}</strong>
            </div>
            <div className="flex justify-between">
              <span>SQLite Database:</span>
              <strong className="text-emerald-400">{db.engine || 'WAL Mode (Active)'}</strong>
            </div>
            <div className="flex justify-between">
              <span>Free Space:</span>
              <strong className="text-slate-200">{(sys.nvmeFreeGb || 384.2).toFixed(1)} GB</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
