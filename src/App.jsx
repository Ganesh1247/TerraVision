import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header/Header';
import UploadPanel from './components/Upload/UploadPanel';
import PipelineStatus from './components/Pipeline/PipelineStatus';
import Viewer3D from './components/Viewer3D/Viewer3D';
import MultiDimensionalConfidencePanel from './components/Confidence/MultiDimensionalConfidencePanel';
import SessionHistory from './components/History/SessionHistory';
import ArchitectureOverview from './components/Architecture/ArchitectureOverview';
import Person2AnalysisStudio from './components/Person2/Person2AnalysisStudio';
import TelemetryConsole from './components/Telemetry/TelemetryConsole';
import ExportReportModal from './components/Telemetry/ExportReportModal';
import { useReconstructionEngine } from './hooks/useReconstructionEngine';
import { useSystemHealth } from './hooks/useSystemHealth';
import { MOCK_DATASETS } from './data/mockDatasets';
import { ShieldCheck, Sparkles, Terminal, Activity, Compass, Cpu, Layers } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('reconstruct'); // 'reconstruct' | 'history' | 'architecture'
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [showConsoleDrawer, setShowConsoleDrawer] = useState(true);

  const systemHealth = useSystemHealth();

  const {
    currentJob,
    selectedDataset,
    setSelectedDataset,
    pipelineState,
    activeStageIndex,
    stageProgress,
    totalProgress,
    currentAction,
    activeFallbacks,
    stageStatuses,
    degradedOverrides,
    setDegradedOverrides,
    logs,
    addLog,
    renderMode,
    setRenderMode,
    selectedHotspot,
    setSelectedHotspot,
    activeHotspotsList,
    droneCamFollow,
    setDroneCamFollow,
    orthoView,
    setOrthoView,
    showTrajectory,
    setShowTrajectory,
    showRuler,
    setShowRuler,
    startReconstruction,
    retryStage,
    resetPipeline
  } = useReconstructionEngine();

  // Trigger celebratory confetti on completion
  useEffect(() => {
    if (pipelineState === 'completed') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22D3EE', '#06B6D4', '#22C55E', '#38BDF8']
      });
    }
  }, [pipelineState]);

  // Load a historic job into 3D viewer
  const handleLoadJobIntoViewer = (job) => {
    const matchingDataset = MOCK_DATASETS.find(d => d.name === job.datasetName) || MOCK_DATASETS[0];
    setSelectedDataset(matchingDataset);
    setActiveTab('reconstruct');
    addLog('SESSION_LOAD', `Loaded historic session ${job.id} into 3D inspection viewport.`, 'success');
  };

  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 flex flex-col font-sans selection:bg-brand-cyan/20 selection:text-brand-cyan">
      {/* Top Navigation & Status Bar */}
      <Header
        currentJob={currentJob}
        systemHealth={systemHealth}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-3 sm:p-5 max-w-[1720px] w-full mx-auto">
        {/* TAB 1: Mission 3D Studio */}
        {activeTab === 'reconstruct' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-start">
            
            {/* Left Column: Upload & Pipeline Status Stepper (5 cols on lg) */}
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

            {/* Right Column: 3D Viewer + 5D Confidence Panel + Telemetry Console (7 cols on lg) */}
            <div className="lg:col-span-7 space-y-4">
              {/* 3D Viewport */}
              <div className="w-full">
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
              </div>

              {/* 5-Dimensional Confidence Panel (Core Differentiator) */}
              <MultiDimensionalConfidencePanel
                hotspot={selectedHotspot}
                allHotspots={activeHotspotsList}
                onSelectHotspot={setSelectedHotspot}
              />

              {/* Real-time Telemetry Terminal Logs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider px-1">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-brand-cyan" />
                    Edge Kernel Observability Stream
                  </span>
                  <button
                    onClick={() => setShowConsoleDrawer(!showConsoleDrawer)}
                    className="text-[11px] text-brand-cyan hover:underline cursor-pointer"
                  >
                    {showConsoleDrawer ? 'Hide Logs' : 'Show Logs'}
                  </button>
                </div>
                {showConsoleDrawer && (
                  <TelemetryConsole logs={logs} />
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: Person 2 Metric Analysis Studio */}
        {activeTab === 'person2' && (
          <Person2AnalysisStudio
            selectedDataset={selectedDataset}
            renderMode={renderMode}
          />
        )}

        {/* TAB 3: Session History */}
        {activeTab === 'history' && (
          <SessionHistory onSelectJobForViewer={handleLoadJobIntoViewer} />
        )}

        {/* TAB 3: Architecture & Tech Spec */}
        {activeTab === 'architecture' && (
          <ArchitectureOverview />
        )}
      </main>

      {/* Global Mission Control Footer */}
      <footer className="mt-8 border-t border-slate-800/80 bg-dark-950 px-4 sm:px-8 py-4 text-xs font-mono text-slate-400">
        <div className="max-w-[1720px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span className="text-white font-bold">TERRA VISION EDGE RECONSTRUCTION SYSTEM</span>
            <span className="text-slate-600">|</span>
            <span>SIH26158 Software Category</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>100% Fully Offline</span>
            <span>·</span>
            <span>Zero GPS / GNSS Required</span>
            <span>·</span>
            <span>Certified Metric Scale Bounds (m ± δ)</span>
          </div>
        </div>
      </footer>

      {/* Export Report Modal */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        currentJob={currentJob}
        selectedDataset={selectedDataset}
      />
    </div>
  );
}
