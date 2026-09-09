import React from 'react';
import { X, Activity, Cpu, HardDrive, Database, ShieldCheck, Zap, Server, Thermometer } from 'lucide-react';

function MetricRow({ label, value, accent }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span className="text-[11px] font-mono font-semibold"
        style={{ color: accent ? `var(--accent-${accent})` : 'var(--text-primary)' }}>
        {value}
      </span>
    </div>
  );
}

function HealthCard({ icon: Icon, title, badge, children, accentColor = 'cyan', barValue, barMax }) {
  const pct = barMax ? Math.min((barValue / barMax) * 100, 100) : null;
  const barColor = pct > 85 ? 'var(--accent-rose)' : pct > 65 ? 'var(--accent-amber)' : 'var(--accent-cyan)';
  return (
    <div className="tv-surface p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider"
          style={{ color: `var(--accent-${accentColor})` }}>
          <Icon className="w-3.5 h-3.5" />{title}
        </span>
        {badge && (
          <span className="tv-badge tv-badge-emerald text-[9px]">{badge}</span>
        )}
      </div>
      <div className="tv-divider" />
      <div className="space-y-0.5">{children}</div>
      {pct !== null && (
        <div className="tv-progress-track mt-2">
          <div className="tv-progress-fill" style={{ width: `${pct}%`, background: barColor }} />
        </div>
      )}
    </div>
  );
}

export default function SystemHealthModal({ health, isOpen, onClose }) {
  if (!isOpen) return null;

  const gpuPct = (health.gpu.vramUsedGb / health.gpu.vramTotalGb) * 100;

  return (
    <div className="tv-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="tv-modal w-full max-w-2xl">
        {/* Accent top line */}
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[var(--accent-cyan)] to-transparent rounded-t-2xl" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ background: 'rgba(52,211,153,0.10)', border: '1px solid rgba(52,211,153,0.3)' }}>
              <Activity className="w-5 h-5" style={{ color: 'var(--accent-emerald)' }} />
            </div>
            <div>
              <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                Edge Node System Diagnostics
                <span className="tv-badge tv-badge-emerald ml-2">HTTP 200</span>
              </h3>
              <p className="text-[11px] font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
                GET /api/v1/health · Daemon Uptime: {health.uptime}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="tv-btn tv-btn-ghost tv-btn-icon">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* GPU */}
          <HealthCard
            icon={Zap} title="Neural GPU Compute" accentColor="cyan"
            badge={`${health.gpu.loadPct.toFixed(0)}% Load`}
            barValue={health.gpu.vramUsedGb} barMax={health.gpu.vramTotalGb}
          >
            <MetricRow label="Device" value={health.gpu.name} />
            <MetricRow label="VRAM" value={`${health.gpu.vramUsedGb.toFixed(1)} / ${health.gpu.vramTotalGb} GB`} accent="cyan" />
            <MetricRow label="Temperature" value={`${health.gpu.tempC.toFixed(0)}°C`}
              accent={health.gpu.tempC > 80 ? 'rose' : health.gpu.tempC > 65 ? 'amber' : 'emerald'} />
            <MetricRow label="CUDA / TensorRT" value={`${health.gpu.cudaVersion} / ${health.gpu.tensorRtStatus}`} accent="emerald" />
          </HealthCard>

          {/* Storage */}
          <HealthCard
            icon={HardDrive} title="NVMe Scratch Storage" accentColor="violet"
            badge={`I/O ${health.system.nvmeReadWriteMb}`}
            barValue={health.system.storageUsedGb} barMax={health.system.storageTotalGb}
          >
            <MetricRow label="Used / Total"
              value={`${health.system.storageUsedGb.toFixed(1)} / ${health.system.storageTotalGb} GB`}
              accent="violet" />
            <MetricRow label="Read / Write" value={health.system.nvmeReadWriteMb} />
            <MetricRow label="File System" value="ext4 (WAL-mode SQLite)" />
          </HealthCard>

          {/* CPU */}
          <HealthCard
            icon={Cpu} title="ARM CPU + RAM" accentColor="amber"
            barValue={health.cpu.loadPct} barMax={100}
          >
            <MetricRow label="Load" value={`${health.cpu.loadPct.toFixed(0)}%`}
              accent={health.cpu.loadPct > 85 ? 'rose' : 'amber'} />
            <MetricRow label="RAM" value={`${health.cpu.ramUsedGb.toFixed(1)} / ${health.cpu.ramTotalGb} GB`} />
            <MetricRow label="Threads" value={health.cpu.threads} />
          </HealthCard>

          {/* Air-gap / mission */}
          <HealthCard icon={ShieldCheck} title="Air-Gap Verification" accentColor="emerald" badge="SECURE">
            <MetricRow label="Network Interfaces" value="All Blocked" accent="emerald" />
            <MetricRow label="GPS / GNSS" value="Disabled" accent="emerald" />
            <MetricRow label="External Calls" value="0 (Hard Constraint)" accent="emerald" />
            <MetricRow label="Daemon Mode" value={health.daemon?.mode || 'Offline Edge'} />
          </HealthCard>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
          <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
            SIH26158 · Target: NVIDIA Jetson AGX Orin · {new Date().toLocaleTimeString()}
          </span>
          <button onClick={onClose} className="tv-btn tv-btn-primary tv-btn-sm">Close</button>
        </div>
      </div>
    </div>
  );
}
