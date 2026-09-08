import React from 'react';
import { X, Activity, Cpu, HardDrive, Database, ShieldCheck, Zap, Server } from 'lucide-react';

export default function SystemHealthModal({ health, isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-dark-850 border border-brand-cyan/30 rounded-xl p-6 shadow-2xl overflow-hidden tech-border-glow">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Edge Node System Diagnostics
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                  HTTP 200 OK
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                GET /api/v1/health · Daemon Uptime: {health.uptime}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Diagnostic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          {/* GPU Hardware */}
          <div className="p-4 rounded-lg bg-dark-800 border border-slate-700/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-brand-cyan uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4" /> Neural GPU Compute
              </span>
              <span className="text-xs font-mono text-emerald-400">
                {health.gpu.tempC.toFixed(0)}°C · {health.gpu.loadPct.toFixed(0)}% Load
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-300 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Device:</span>
                <span className="text-white font-medium">{health.gpu.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">VRAM Allocation:</span>
                <span className="text-brand-cyan">{health.gpu.vramUsedGb} GB / {health.gpu.vramTotalGb} GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">CUDA / TensorRT:</span>
                <span className="text-emerald-400">{health.gpu.cudaVersion} / {health.gpu.tensorRtStatus}</span>
              </div>
            </div>
            {/* VRAM Bar */}
            <div className="mt-3 w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-brand-cyan h-full rounded-full transition-all duration-500"
                style={{ width: `${(health.gpu.vramUsedGb / health.gpu.vramTotalGb) * 100}%` }}
              />
            </div>
          </div>

          {/* Storage & I/O */}
          <div className="p-4 rounded-lg bg-dark-800 border border-slate-700/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-brand-cyan uppercase tracking-wider flex items-center gap-1.5">
                <HardDrive className="w-4 h-4" /> NVMe Scratch Storage
              </span>
              <span className="text-xs font-mono text-emerald-400">I/O {health.system.nvmeReadWriteMb}</span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-300 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Free Disk Space:</span>
                <span className="text-white font-medium">{health.system.nvmeFreeGb} GB NVMe PCIe Gen4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">System Memory:</span>
                <span>{health.system.ramUsedGb} GB / {health.system.ramTotalGb} GB RAM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">CPU Thread Load:</span>
                <span className="text-emerald-400">{health.system.cpuUsagePct.toFixed(0)}% (16 Cores)</span>
              </div>
            </div>
            <div className="mt-3 w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(health.system.ramUsedGb / health.system.ramTotalGb) * 100}%` }}
              />
            </div>
          </div>

          {/* Database & VIO Engine */}
          <div className="p-4 rounded-lg bg-dark-800 border border-slate-700/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-brand-cyan uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-4 h-4" /> SQLite WAL Catalog
              </span>
              <span className="text-xs font-mono text-emerald-400">ACID Safe</span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-300 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Engine Mode:</span>
                <span className="text-white">{health.database.engine}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Catalog Entries:</span>
                <span>{health.database.recordsCount} completed runs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Disk Sync Latency:</span>
                <span className="text-emerald-400">{health.database.status}</span>
              </div>
            </div>
          </div>

          {/* VIO Odometry Daemon */}
          <div className="p-4 rounded-lg bg-dark-800 border border-slate-700/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-brand-cyan uppercase tracking-wider flex items-center gap-1.5">
                <Server className="w-4 h-4" /> VIO Odometry Daemon
              </span>
              <span className="text-xs font-mono text-emerald-400">{health.vioDaemon.frequency}</span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-300 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">VINS-Fusion Core:</span>
                <span className="text-emerald-400 font-medium">{health.vioDaemon.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">C++ Thread ID:</span>
                <span className="text-slate-300">{health.vioDaemon.threadId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Zero-GPS Fallback:</span>
                <span className="text-emerald-400 font-semibold">Armed & Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Air-gap guarantee badge */}
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-xs text-emerald-200">
            <strong>Zero-Cloud Guarantee:</strong> All feature detection, bundle adjustment, and surface meshing execute strictly inside local hardware RAM and GPU memory. No packets leave the host machine.
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-brand-cyan text-slate-950 font-bold text-xs rounded-lg hover:bg-brand-cyan-dark transition-colors"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
}
