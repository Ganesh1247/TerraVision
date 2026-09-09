import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useTheme } from './context/ThemeContext';
import Header from './components/Header/Header';
import UploadPanel from './components/Upload/UploadPanel';
import PipelineStatus from './components/Pipeline/PipelineStatus';
import Viewer3D from './components/Viewer3D/Viewer3D';
import MultiDimensionalConfidencePanel from './components/Confidence/MultiDimensionalConfidencePanel';
import SessionHistory from './components/History/SessionHistory';
import ArchitectureOverview from './components/Architecture/ArchitectureOverview';
import TelemetryConsole from './components/Telemetry/TelemetryConsole';
import ExportReportModal from './components/Telemetry/ExportReportModal';
import { useReconstructionEngine } from './hooks/useReconstructionEngine';
import { useSystemHealth } from './hooks/useSystemHealth';
import { MOCK_DATASETS } from './data/mockDatasets';
import {
  Terminal, Activity, Cpu, HardDrive, Thermometer,
  BarChart3, Globe, CheckCircle2, Shield, Sparkles
} from 'lucide-react';

/* ── Small stat pill shown in the info ribbon ─────────────────── */
function RibbonStat({ icon: Icon, label, value, color = 'cyan' }) {
  const colorVars = {
    cyan:    'var(--accent-cyan)',
    emerald: 'var(--accent-emerald)',
    amber:   'var(--accent-amber)',
    violet:  'var(--accent-violet)',
    rose:    'var(--accent-rose)',
  };
  const c = colorVars[color] || colorVars.cyan;
  return (
    <div className="tv-stat flex-row items-center gap-2 py-2 px-3 flex">
      <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: c }} />
      <div>
        <div className="tv-stat-value text-sm" style={{ color: 'var(--text-primary)' }}>{value}</div>
        <div className="tv-stat-label">{label}</div>
      </div>
    </div>
  );
}

/* ── Completion banner shown when pipeline finishes ───────────── */
function CompletionBanner({ onDismiss }) {
  return (
    <div className="tv-card-accent p-4 animate-slide-up flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl" style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)' }}>
          <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--accent-emerald)' }} />
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            🎉 Reconstruction Complete!
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            3D model generated with certified metric scale bounds. Export your report below.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="tv-badge tv-badge-emerald">
          <Sparkles className="w-3 h-3" /> Ready
        </span>
        <button onClick={onDismiss} className="tv-btn tv-btn-ghost tv-btn-sm">
          Dismiss
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab]             = useState('reconstruct');
  const [isExportModalOpen, setIsExportModal] = useState(false);
  const [showConsole, setShowConsole]         = useState(true);
  const [showBanner, setShowBanner]           = useState(false);

  const systemHealth = useSystemHealth();

  const {
    currentJob, selectedDataset, setSelectedDataset,
    pipelineState, activeStageIndex, stageProgress, totalProgress,
    currentAction, activeFallbacks, stageStatuses, degradedOverrides,
    setDegradedOverrides, logs, addLog, renderMode, setRenderMode,
    selectedHotspot, setSelectedHotspot, activeHotspotsList,
    droneCamFollow, setDroneCamFollow, orthoView, setOrthoView,
    showTrajectory, setShowTrajectory, showRuler, setShowRuler,
    startReconstruction, retryStage, resetPipeline,
  } = useReconstructionEngine();

  // Confetti + banner on completion
  useEffect(() => {
    if (pipelineState === 'completed') {
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.55 }, colors: ['#22D3EE', '#34D399', '#A78BFA'] });
      setShowBanner(true);
    }
  }, [pipelineState]);

  const handleLoadJob = (job) => {
    const ds = MOCK_DATASETS.find(d => d.name === job.datasetName) || MOCK_DATASETS[0];
    setSelectedDataset(ds);
    setActiveTab('reconstruct');
    addLog('SESSION_LOAD', `Loaded historic session ${job.id} into 3D inspection viewport.`, 'success');
  };

  /* ── Derive ribbon stats from systemHealth (safe accessors) ── */
  const gpuLoad   = systemHealth?.gpu?.loadPct   ?? 0;
  const gpuTemp   = systemHealth?.gpu?.tempC     ?? 0;
  const gpuVram   = systemHealth?.gpu?.vramUsedGb ?? 0;
  const cpuLoad   = systemHealth?.system?.cpuUsagePct ?? 0;

  const ribbonStats = [
    { icon: Cpu,         label: 'GPU Load',  value: `${gpuLoad.toFixed(0)}%`,  color: 'cyan'    },
    { icon: Thermometer, label: 'GPU Temp',  value: `${gpuTemp.toFixed(0)}°C`, color: gpuTemp > 75 ? 'rose' : 'emerald' },
    { icon: HardDrive,   label: 'VRAM',      value: `${gpuVram.toFixed(1)} GB`, color: 'violet'  },
    { icon: Activity,    label: 'CPU',       value: `${cpuLoad.toFixed(0)}%`,  color: 'amber'   },
    { icon: Globe,       label: 'Network',   value: 'AIR-GAP',                 color: 'emerald' },
    { icon: Shield,      label: 'GPS',       value: 'BLOCKED',                 color: 'emerald' },
  ];

  return (
    /* Root wrapper — class drives CSS variables */
    <div
      className={`min-h-screen flex flex-col font-sans ${theme}`}
      style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', transition: 'background 0.3s ease, color 0.3s ease' }}
    >
      {/* Top Navigation */}
      <Header
        currentJob={currentJob}
        systemHealth={systemHealth}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenExportModal={() => setIsExportModal(true)}
      />

      {/* System metrics ribbon */}
      <div
        className="w-full border-b border-[var(--border-subtle)] overflow-x-auto"
        style={{ background: 'var(--bg-surface)' }}
      >
        <div className="flex items-center gap-2 px-4 lg:px-6 py-1.5 max-w-[1720px] mx-auto min-w-max">
          {ribbonStats.map((s, i) => (
            <RibbonStat key={i} {...s} />
          ))}
          <div className="ml-auto shrink-0">
            <span className="tv-badge tv-badge-cyan">
              <BarChart3 className="w-3 h-3" /> Live Telemetry
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-3 sm:p-5 max-w-[1720px] w-full mx-auto space-y-4">

        {/* Completion banner */}
        {showBanner && pipelineState === 'completed' && (
          <CompletionBanner onDismiss={() => setShowBanner(false)} />
        )}

        {/* ── TAB: Mission 3D Studio ─────────────────────────────── */}
        {activeTab === 'reconstruct' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-start animate-fade-in">

            {/* Left column */}
            <div className="lg:col-span-5 space-y-4">
              <UploadPanel
                selectedDataset={selectedDataset}
                onSelectDataset={setSelectedDataset}
                onStartReconstruction={startReconstruction}
                pipelineState={pipelineState}
                onResetPipeline={resetPipeline}
                degradedOverrides={degradedOverrides}
                setDegradedOverrides={setDegradedOverrides}
              />
              <PipelineStatus
                pipelineState={pipelineState}
                activeStageIndex={activeStageIndex}
                stageProgress={stageProgress}
                totalProgress={totalProgress}
                currentAction={currentAction}
                activeFallbacks={activeFallbacks}
                stageStatuses={stageStatuses}
                onRetryStage={retryStage}
              />
            </div>

            {/* Right column */}
            <div className="lg:col-span-7 space-y-4">
              {/* 3D Viewer */}
              <Viewer3D
                renderMode={renderMode}
                setRenderMode={setRenderMode}
                activeStageIndex={activeStageIndex}
                pipelineState={pipelineState}
                hotspots={activeHotspotsList}
                selectedHotspot={selectedHotspot}
                onSelectHotspot={setSelectedHotspot}
                showTrajectory={showTrajectory}
                setShowTrajectory={setShowTrajectory}
                showRuler={showRuler}
                setShowRuler={setShowRuler}
                droneCamFollow={droneCamFollow}
                setDroneCamFollow={setDroneCamFollow}
                orthoView={orthoView}
                setOrthoView={setOrthoView}
                selectedDataset={selectedDataset}
              />

              {/* 5D Confidence Panel */}
              <MultiDimensionalConfidencePanel
                hotspot={selectedHotspot}
                allHotspots={activeHotspotsList}
                onSelectHotspot={setSelectedHotspot}
              />

              {/* Telemetry Console */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="tv-section-label flex-1">
                    <Terminal className="w-3 h-3" />
                    Edge Kernel Observability Stream
                  </div>
                  <button
                    onClick={() => setShowConsole(v => !v)}
                    className="tv-btn tv-btn-ghost tv-btn-sm ml-3"
                  >
                    {showConsole ? 'Hide Logs' : 'Show Logs'}
                  </button>
                </div>
                {showConsole && <TelemetryConsole logs={logs} />}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: Session History ────────────────────────────────── */}
        {activeTab === 'history' && (
          <div className="animate-fade-in">
            <SessionHistory onSelectJobForViewer={handleLoadJob} />
          </div>
        )}

        {/* ── TAB: Architecture ──────────────────────────────────── */}
        {activeTab === 'architecture' && (
          <div className="animate-fade-in">
            <ArchitectureOverview />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className="border-t border-[var(--border-subtle)] px-4 sm:px-8 py-3"
        style={{ background: 'var(--bg-surface)' }}
      >
        <div className="max-w-[1720px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span className="tv-live-dot" />
            <span className="font-black tracking-widest" style={{ color: 'var(--text-primary)' }}>
              TERRA<span style={{ color: 'var(--accent-cyan)' }}>VISION</span>
            </span>
            <span style={{ color: 'var(--text-muted)' }}>·</span>
            <span>SIH26158 · Edge Reconstruction System</span>
          </div>
          <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--text-muted)', fontFamily: '"JetBrains Mono", monospace' }}>
            <span className="tv-badge tv-badge-emerald">100% Offline</span>
            <span>Zero GPS / GNSS</span>
            <span>·</span>
            <span>Certified Metric Scale ± δ</span>
            <span>·</span>
            <span>v1.0.0</span>
          </div>
        </div>
      </footer>

      {/* Export modal */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModal(false)}
        currentJob={currentJob}
        selectedDataset={selectedDataset}
      />
    </div>
  );
}
