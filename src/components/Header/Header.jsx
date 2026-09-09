import React, { useState, useEffect } from 'react';
import {
  Boxes, Clock, History, Compass, FileCode,
  Download, Sun, Moon, Activity, Wifi, WifiOff,
  Shield, Cpu, ChevronDown, Bell, X
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import OfflineBadge from '../Common/OfflineBadge';
import SystemHealthModal from './SystemHealthModal';

function NavTab({ icon: Icon, label, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className={`tv-tab ${active ? 'active' : ''} relative`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{label}</span>
      {badge && (
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--accent-rose)] text-white text-[9px] font-bold flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );
}

function StatPill({ icon: Icon, value, label, color = 'cyan' }) {
  const colorMap = {
    cyan:    { text: 'text-[var(--accent-cyan)]',    bg: 'bg-[var(--accent-cyan-bg)]' },
    emerald: { text: 'text-[var(--accent-emerald)]', bg: 'bg-[rgba(52,211,153,0.08)]' },
    amber:   { text: 'text-[var(--accent-amber)]',   bg: 'bg-[rgba(251,191,36,0.08)]' },
    rose:    { text: 'text-[var(--accent-rose)]',    bg: 'bg-[rgba(251,113,133,0.08)]' },
  };
  const c = colorMap[color] || colorMap.cyan;
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[var(--border-subtle)] ${c.bg}`}>
      <Icon className={`w-3 h-3 ${c.text}`} />
      <span className={`font-mono text-[11px] font-bold ${c.text}`}>{value}</span>
      <span className="text-[10px] text-[var(--text-muted)] hidden sm:inline">{label}</span>
    </div>
  );
}

export default function Header({
  currentJob,
  systemHealth,
  activeTab,
  setActiveTab,
  onOpenExportModal
}) {
  const { theme, toggleTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState('');
  const [isHealthOpen, setIsHealthOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentTime(now.toTimeString().split(' ')[0]);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const tabs = [
    { id: 'reconstruct',  label: 'Mission Studio',     icon: Compass  },
    { id: 'history',      label: 'Session History',    icon: History  },
    { id: 'architecture', label: 'Architecture',       icon: FileCode },
  ];

  const gpuOk = systemHealth?.gpu?.loadPct < 90;

  return (
    <>
      {/* ── Main header ───────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 w-full tv-glass border-b border-[var(--border-subtle)]"
        style={{ backgroundColor: 'var(--bg-elevated)' }}
      >
        {/* Top strip */}
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[var(--accent-cyan)] to-transparent opacity-60" />

        <div className="px-4 lg:px-6 py-2.5">
          <div className="flex items-center justify-between gap-3">

            {/* ── Logo ─────────────────────────────────────────── */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-cyan-bg)] to-[var(--accent-violet-bg)] border border-[var(--border-strong)] flex items-center justify-center shadow-glow-cyan">
                  <Boxes className="w-5 h-5 text-[var(--accent-cyan)]" />
                </div>
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[var(--accent-emerald)] rounded-full border-2 border-[var(--bg-elevated)]" />
              </div>

              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-black tracking-widest font-display" style={{ color: 'var(--text-primary)' }}>
                    TERRA<span style={{ color: 'var(--accent-cyan)' }}>VISION</span>
                  </h1>
                  <span className="tv-badge tv-badge-cyan">SIH26158</span>
                </div>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Offline Drone → 3D Reconstruction · GPS-Free Edge
                </p>
              </div>
            </div>

            {/* ── Nav tabs (desktop) ────────────────────────────── */}
            <div className="hidden md:flex tv-tabbar">
              {tabs.map(t => (
                <NavTab
                  key={t.id}
                  icon={t.icon}
                  label={t.label}
                  active={activeTab === t.id}
                  onClick={() => setActiveTab(t.id)}
                />
              ))}
            </div>

            {/* ── Right controls ────────────────────────────────── */}
            <div className="flex items-center gap-2 shrink-0">

              {/* Live system stats */}
              <button
                onClick={() => setIsHealthOpen(true)}
                className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)] transition-all"
                title="Open system health monitor"
              >
                <span className={`w-2 h-2 rounded-full ${gpuOk ? 'bg-[var(--accent-emerald)]' : 'bg-[var(--accent-amber)]'}`} />
                <span className="text-[11px] font-mono" style={{ color: 'var(--text-secondary)' }}>
                  GPU {systemHealth?.gpu?.loadPct?.toFixed(0) ?? '0'}% · {systemHealth?.gpu?.tempC?.toFixed(0) ?? '0'}°C
                </span>
              </button>

              {/* Mission clock */}
              <div className="hidden xl:flex items-center gap-1 px-2 py-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
                <Clock className="w-3 h-3 text-[var(--accent-cyan)]" />
                <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>{currentTime}</span>
              </div>

              {/* Active job badge */}
              <div className="hidden xl:block px-2 py-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[11px] font-mono" style={{ color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Job: </span>
                <span className="font-bold" style={{ color: 'var(--accent-cyan)' }}>{currentJob?.id || 'TV-STANDBY'}</span>
              </div>

              {/* Offline badge */}
              <OfflineBadge />

              {/* Notifications */}
              <button
                onClick={() => setShowNotif(!showNotif)}
                className="relative tv-btn-icon tv-btn tv-btn-ghost"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[var(--accent-rose)]" />
              </button>

              {/* Export */}
              <button
                onClick={onOpenExportModal}
                className="tv-btn tv-btn-ghost tv-btn-sm hidden sm:flex"
              >
                <Download className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
                Export
              </button>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="tv-theme-toggle"
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark'
                  ? <Sun  className="w-3.5 h-3.5 text-[var(--accent-amber)]" />
                  : <Moon className="w-3.5 h-3.5 text-[var(--accent-violet)]" />
                }
                <span className="hidden sm:inline text-[11px]">
                  {theme === 'dark' ? 'Light' : 'Dark'}
                </span>
              </button>

              {/* Mobile hamburger */}
              <button
                className="md:hidden tv-btn tv-btn-ghost tv-btn-icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-2 pt-2 border-t border-[var(--border-subtle)] flex gap-1 flex-wrap animate-fade-in">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setActiveTab(t.id); setMobileMenuOpen(false); }}
                  className={`tv-tab ${activeTab === t.id ? 'active' : ''}`}
                >
                  <t.icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bottom progress bar (when job active) */}
        {currentJob && currentJob.status === 'processing' && (
          <div className="h-0.5 w-full bg-[var(--bg-overlay)] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--accent-cyan-dk)] to-[var(--accent-cyan)] animate-pulse transition-all duration-500"
              style={{ width: `${currentJob.progress || 50}%` }}
            />
          </div>
        )}
      </header>

      {/* Notification drawer */}
      {showNotif && (
        <div className="fixed top-16 right-4 z-50 w-72 tv-card tv-card-accent animate-scale-in p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Notifications</span>
            <button onClick={() => setShowNotif(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {[
              { text: 'Air-gap constraint active — zero network calls', color: 'emerald', icon: Shield },
              { text: `GPU temp ${systemHealth?.gpu?.tempC?.toFixed(0) ?? 0}°C — within safe range`, color: 'cyan', icon: Cpu },
              { text: 'IMU sensor data ready for fusion', color: 'amber', icon: Activity },
            ].map((n, i) => (
              <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                <n.icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 text-[var(--accent-${n.color})]`} style={{ color: `var(--accent-${n.color})` }} />
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{n.text}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] mt-3 text-right" style={{ color: 'var(--text-muted)' }}>All systems nominal</p>
        </div>
      )}

      {/* System Health Modal */}
      <SystemHealthModal
        health={systemHealth}
        isOpen={isHealthOpen}
        onClose={() => setIsHealthOpen(false)}
      />
    </>
  );
}
