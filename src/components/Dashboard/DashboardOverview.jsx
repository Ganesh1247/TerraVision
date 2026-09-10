import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  FolderKanban, 
  Cpu, 
  Box, 
  TrendingUp, 
  ShieldCheck, 
  ArrowRight, 
  Video, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Clock, 
  Ruler, 
  Compass,
  Radio,
  FileCheck2,
  ChevronRight
} from 'lucide-react';
import { MOCK_DATASETS } from '../../data/mockDatasets';

export default function DashboardOverview({ 
  onStartReconstruct, 
  onViewProjects, 
  onSelectDataset,
  currentJob
}) {
  // Animated number counters
  const [counts, setCounts] = useState({
    projects: 0,
    jobs: 0,
    models: 0,
    confidence: 0
  });

  useEffect(() => {
    const duration = 1200;
    const start = performance.now();

    const animate = (time) => {
      const progress = Math.min(1, (time - start) / duration);
      // easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);

      setCounts({
        projects: Math.floor(ease * 24),
        jobs: Math.floor(ease * 2),
        models: Math.floor(ease * 18),
        confidence: parseFloat((ease * 91.4).toFixed(1))
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, []);

  const stats = [
    {
      id: 'projects',
      label: 'TOTAL PROJECTS',
      value: counts.projects.toString().padStart(2, '0'),
      trend: '+4 this month',
      trendPositive: true,
      icon: FolderKanban,
      color: 'cyan',
      bgGlow: 'from-cyan-500/10 to-blue-600/5',
      borderColor: 'border-cyan-500/30'
    },
    {
      id: 'jobs',
      label: 'ACTIVE JOBS',
      value: counts.jobs.toString().padStart(2, '0'),
      trend: 'Real-time Edge VIO',
      trendPositive: true,
      icon: Cpu,
      color: 'amber',
      bgGlow: 'from-amber-500/10 to-orange-600/5',
      borderColor: 'border-amber-500/30'
    },
    {
      id: 'models',
      label: '3D MODELS',
      value: counts.models.toString().padStart(2, '0'),
      trend: 'Metric scale certified',
      trendPositive: true,
      icon: Box,
      color: 'violet',
      bgGlow: 'from-violet-500/10 to-purple-600/5',
      borderColor: 'border-violet-500/30'
    },
    {
      id: 'confidence',
      label: 'AVG CONFIDENCE',
      value: `${counts.confidence}%`,
      trend: '±0.038m error bounds',
      trendPositive: true,
      icon: TrendingUp,
      color: 'emerald',
      bgGlow: 'from-emerald-500/10 to-teal-600/5',
      borderColor: 'border-emerald-500/30'
    }
  ];

  const recentMissions = [
    {
      id: 'TV-2026-881',
      title: 'High-Voltage Power Substation',
      type: 'Industrial Infrastructure',
      date: 'Today, 14:22',
      duration: '4m 12s',
      frames: 428,
      points: '1.24M',
      confidence: '93.4%',
      status: 'Completed',
      statusColor: 'emerald',
      thumbGradient: 'from-cyan-900/50 to-slate-900'
    },
    {
      id: 'TV-2026-880',
      title: 'Open-Pit Quarry Pit 3B',
      type: 'Mining & Excavation',
      date: 'Yesterday, 18:05',
      duration: '7m 45s',
      frames: 680,
      points: '2.10M',
      confidence: '90.8%',
      status: 'Completed',
      statusColor: 'emerald',
      thumbGradient: 'from-amber-900/50 to-slate-900'
    },
    {
      id: 'TV-2026-879',
      title: 'Concrete Railway Viaduct',
      type: 'Structural Inspection',
      date: '07 Sep 2026',
      duration: '5m 30s',
      frames: 512,
      points: '1.65M',
      confidence: '88.9%',
      status: 'Completed',
      statusColor: 'emerald',
      thumbGradient: 'from-emerald-900/50 to-slate-900'
    },
    {
      id: 'TV-2026-878',
      title: 'Defense Tactical Perimeter',
      type: 'GPS-Denied Corridor',
      date: '06 Sep 2026',
      duration: '3m 18s',
      frames: 340,
      points: '980K',
      confidence: '92.1%',
      status: 'Completed',
      statusColor: 'emerald',
      thumbGradient: 'from-purple-900/50 to-slate-900'
    }
  ];

  return (
    <div className="space-y-6 max-w-[1720px] mx-auto animate-fade-in">
      {/* Hero Command-Center Header */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 p-6 lg:p-8 bg-gradient-to-br from-dark-950 via-slate-950 to-dark-900 shadow-2xl">
        <div className="absolute inset-0 tv-grid-bg opacity-30 pointer-events-none" />
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300 font-bold">
              <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
              <span>SIH26158 · NTRO DEFENSE WORKSTATION</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Terra Vision
              <span className="block text-lg sm:text-xl font-medium text-cyan-400 mt-1 font-mono">
                From Drone Video to Intelligent 3D Reality
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Production-grade edge workstation resolving true metric scale and dense 3D reconstructions from single-pass drone footage with certified spatial accuracy.
            </p>
          </div>

          {/* Quick-Action Command Card */}
          <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={onStartReconstruct}
              className="tv-btn tv-btn-primary tv-btn-lg shadow-lg justify-center"
            >
              <PlusCircle className="w-5 h-5" />
              <span>New Reconstruction</span>
            </button>
            <button
              onClick={onViewProjects}
              className="tv-btn tv-btn-secondary tv-btn-lg justify-center"
            >
              <FolderKanban className="w-5 h-5" />
              <span>Explore Projects</span>
            </button>
          </div>
        </div>
      </div>

      {/* Animated KPI Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((st) => {
          const Icon = st.icon;
          return (
            <div
              key={st.id}
              className={`tv-card p-5 rounded-xl border ${st.borderColor} bg-gradient-to-br ${st.bgGlow} relative overflow-hidden group hover:shadow-xl transition-all duration-300`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono tracking-wider font-bold text-slate-400">
                  {st.label}
                </span>
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <div className="text-3xl font-extrabold font-mono text-white tracking-tight">
                  {st.value}
                </div>
                <div className="text-[10px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{st.trend}</span>
                </div>
              </div>

              {/* Bottom precision line */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          );
        })}
      </div>

      {/* Two Column Grid: Benchmark Scenarios & Recent Missions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Quick Benchmark Datasets */}
        <div className="lg:col-span-4 space-y-4">
          <div className="tv-card p-5 rounded-xl border border-[var(--border-subtle)] space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-100">Tactical Benchmark Scenarios</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">SIH Pre-loaded</span>
            </div>

            <div className="space-y-2.5">
              {MOCK_DATASETS.map((ds) => (
                <div
                  key={ds.id}
                  onClick={() => {
                    onSelectDataset(ds);
                    onStartReconstruct();
                  }}
                  className="p-3 rounded-lg bg-dark-950/60 border border-[var(--border-subtle)] hover:border-cyan-400/50 hover:bg-white/5 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 transition-colors truncate">
                      {ds.name}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>{ds.duration}</span>
                      <span>·</span>
                      <span>{ds.frames} frames</span>
                      <span>·</span>
                      <span className={ds.hasImu ? 'text-emerald-400' : 'text-amber-400'}>
                        {ds.hasImu ? 'IMU 200Hz' : 'Ground Plane'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Air-Gap Verification Card */}
          <div className="tv-card p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
              <h4 className="text-xs font-bold uppercase tracking-wider">Hard Constraint Verification</h4>
            </div>
            <ul className="text-[11px] font-mono space-y-2 text-slate-300">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Zero external HTTP/HTTPS calls</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Visual-Inertial Odometry without GPS</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Certified metric scale accuracy ± δ</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right: Recent Reconstructions Explorer */}
        <div className="lg:col-span-8 space-y-4">
          <div className="tv-card p-5 rounded-xl border border-[var(--border-subtle)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <FolderKanban className="w-4 h-4 text-cyan-400" />
                  Recent Reconstruction Missions
                </h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Archived local edge sessions with 3D model deliverables
                </p>
              </div>
              <button 
                onClick={onViewProjects} 
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
              >
                <span>View All 24</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {recentMissions.map((m) => (
                <div
                  key={m.id}
                  onClick={onStartReconstruct}
                  className="p-4 rounded-xl bg-dark-950/70 border border-slate-800 hover:border-cyan-400/50 hover:shadow-xl cursor-pointer transition-all duration-200 group flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 font-semibold">
                        {m.id} · {m.date}
                      </span>
                      <h4 className="text-sm font-bold text-slate-100 group-hover:text-cyan-400 transition-colors leading-tight mt-0.5">
                        {m.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {m.type}
                      </span>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {m.confidence}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-400">
                    <div>
                      <span className="text-slate-500 block">TIME</span>
                      <strong className="text-slate-300">{m.duration}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">FRAMES</span>
                      <strong className="text-slate-300">{m.frames}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">POINTS</span>
                      <strong className="text-cyan-400">{m.points}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
