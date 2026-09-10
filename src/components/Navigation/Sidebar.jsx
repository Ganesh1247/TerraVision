import React from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  FolderKanban, 
  Box, 
  Ruler, 
  Activity, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Radio
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  isCollapsed, 
  setIsCollapsed,
  pipelineState = 'idle'
}) {
  const navItems = [
    { id: 'dashboard',    label: 'Dashboard',             icon: LayoutDashboard, badge: null },
    { id: 'reconstruct',  label: 'New Reconstruction',    icon: PlusCircle,      badge: pipelineState === 'processing' ? 'ACTIVE' : null, badgeColor: 'cyan' },
    { id: 'projects',     label: 'Projects & History',    icon: FolderKanban,     badge: '24' },
    { id: 'models',       label: '3D Models Gallery',     icon: Box,              badge: '18' },
    { id: 'measurements', label: 'CAD Measurements',      icon: Ruler,            badge: null },
    { id: 'system',       label: 'System Status',         icon: Activity,         badge: '100%' },
    { id: 'settings',     label: 'Settings & Themes',     icon: Settings,         badge: null },
  ];

  return (
    <aside 
      className={`relative z-30 flex flex-col shrink-0 border-r border-[var(--border-subtle)] transition-all duration-300 ease-in-out select-none ${
        isCollapsed ? 'w-[68px]' : 'w-64'
      }`}
      style={{ background: 'var(--bg-elevated)' }}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-[var(--border-subtle)]">
        <div 
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer overflow-hidden group"
        >
          <div className="relative w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-400/30 group-hover:border-cyan-400/60 transition-all shadow-[0_0_12px_rgba(34,211,238,0.15)]">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-dark-950" />
          </div>

          {!isCollapsed && (
            <div className="flex flex-col min-w-0 animate-fade-in">
              <span className="font-extrabold tracking-wider text-sm text-slate-100 flex items-center gap-1">
                TERRA<span className="text-cyan-400">VISION</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400 truncate tracking-tight">
                WORKSTATION v1.0
              </span>
            </div>
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-7 h-7 rounded-lg border border-[var(--border-subtle)] hover:border-cyan-400/40 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:bg-white/5 transition-all"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-3 px-2 space-y-1 overflow-y-auto tv-scroll-panel">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <div key={item.id} className="relative group">
              <button
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'border font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                }`}
                style={isActive ? {
                  backgroundColor: 'var(--accent-cyan-bg)',
                  borderColor: 'var(--border-strong)',
                  color: 'var(--text-primary)',
                  boxShadow: 'var(--shadow-glow)'
                } : {}}
              >
                {/* Active left indicator line */}
                {isActive && (
                  <span 
                    className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
                    style={{
                      backgroundColor: 'var(--accent-cyan)',
                      boxShadow: '0 0 8px var(--accent-cyan)'
                    }}
                  />
                )}

                <Icon 
                  className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" 
                  style={{
                    color: isActive ? 'var(--accent-cyan)' : undefined
                  }}
                />

                {!isCollapsed && (
                  <span className="truncate flex-1 text-left">
                    {item.label}
                  </span>
                )}

                {!isCollapsed && item.badge && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md uppercase font-bold shrink-0 ${
                    item.badgeColor === 'cyan' 
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse' 
                      : item.badgeColor === 'amber'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-white/10 text-slate-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>

              {/* Tooltip for collapsed mode */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-dark-950/95 text-slate-200 text-xs font-medium rounded-md shadow-2xl border border-slate-700 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  {item.label}
                  {item.badge && <span className="ml-1.5 text-[10px] text-cyan-400 font-mono">({item.badge})</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
