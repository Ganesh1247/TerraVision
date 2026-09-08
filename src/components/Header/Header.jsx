import React, { useState, useEffect } from 'react';
import { 
  Boxes, 
  Activity, 
  Clock, 
  Radio, 
  Cpu, 
  Layers, 
  History, 
  Compass,
  FileCode,
  Sparkles,
  Download,
  Scale
} from 'lucide-react';
import OfflineBadge from '../Common/OfflineBadge';
import SystemHealthModal from './SystemHealthModal';

export default function Header({ 
  currentJob, 
  systemHealth, 
  activeTab, 
  setActiveTab,
  onOpenExportModal 
}) {
  const [currentTime, setCurrentTime] = useState('');
  const [isHealthOpen, setIsHealthOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toTimeString().split(' ')[0] + ' UTC+05:30');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-dark-950/95 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-6 py-2.5">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          
          {/* Left: Brand / Logo & Tagline */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-brand-cyan/20 to-blue-600/20 border border-brand-cyan/40 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              <Boxes className="w-6 h-6 text-brand-cyan" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-brand-cyan rounded-full animate-ping" />
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-wider text-white font-sans flex items-center gap-1.5">
                  TERRA<span className="text-brand-cyan font-extrabold">VISION</span>
                </h1>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan uppercase tracking-wider">
                  SIH26158
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans hidden sm:block">
                Offline drone video → accurate 3D models, no GPS required
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center bg-dark-850 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('reconstruct')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'reconstruct'
                  ? 'bg-brand-cyan text-slate-950 font-bold shadow-md shadow-brand-cyan/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Mission 3D Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('person2')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'person2'
                  ? 'bg-brand-cyan text-slate-950 font-bold shadow-md shadow-brand-cyan/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Person 2: Metric Analysis</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'history'
                  ? 'bg-brand-cyan text-slate-950 font-bold shadow-md shadow-brand-cyan/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Session History</span>
            </button>

            <button
              onClick={() => setActiveTab('architecture')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'architecture'
                  ? 'bg-brand-cyan text-slate-950 font-bold shadow-md shadow-brand-cyan/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Architecture & Tech Spec</span>
            </button>
          </div>

          {/* Right: Offline Badge, Traffic Light Cluster, Job ID & Clock */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
            <OfflineBadge />

            {/* System Health Traffic Light Cluster */}
            <button
              onClick={() => setIsHealthOpen(true)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-dark-850 hover:bg-dark-800 border border-slate-800 hover:border-brand-cyan/40 transition-all text-xs font-mono text-slate-300"
              title="Click to view full GPU, VRAM, and daemon hardware telemetry"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" title="GPU VRAM OK" />
                <span className="w-2 h-2 rounded-full bg-emerald-400" title="NVMe SSD OK" />
                <span className="w-2 h-2 rounded-full bg-emerald-400" title="VIO Engine OK" />
              </div>
              <span className="hidden sm:inline text-[11px] text-slate-400">
                GPU {systemHealth.gpu.loadPct.toFixed(0)}% · {systemHealth.gpu.tempC.toFixed(0)}°C
              </span>
            </button>

            {/* Mission Clock & Job Counter */}
            <div className="hidden xl:flex items-center gap-3 pl-2 border-l border-slate-800 text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-brand-cyan" />
                <span>{currentTime}</span>
              </div>
              <div className="px-2 py-0.5 rounded bg-dark-800 text-slate-300 border border-slate-700/60">
                Active Job: <span className="text-brand-cyan font-bold">{currentJob?.id || 'TV-STANDBY'}</span>
              </div>
            </div>

            {/* Export CTA */}
            <button
              onClick={onOpenExportModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-brand-cyan" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </header>

      {/* System Health Diagnostics Modal */}
      <SystemHealthModal 
        health={systemHealth} 
        isOpen={isHealthOpen} 
        onClose={() => setIsHealthOpen(false)} 
      />
    </>
  );
}
