import { useState, useEffect, useRef, useCallback } from 'react';
import { PIPELINE_STAGES, SOFTWARE_FALLBACKS } from '../data/pipelineStages';
import { MOCK_DATASETS } from '../data/mockDatasets';
import { MOCK_HOTSPOTS } from '../data/mockHotspots';

export function useReconstructionEngine() {
  const [currentJob, setCurrentJob] = useState(null);
  const [selectedDataset, setSelectedDataset] = useState(MOCK_DATASETS[0]);
  const [pipelineState, setPipelineState] = useState('idle'); // 'idle' | 'processing' | 'paused' | 'error' | 'completed'
  const [activeStageIndex, setActiveStageIndex] = useState(0); // 0 to 8
  const [stageProgress, setStageProgress] = useState(0); // 0 to 100
  const [totalProgress, setTotalProgress] = useState(0); // 0 to 100
  const [currentAction, setCurrentAction] = useState('System standby. Ready for flight footage ingestion.');
  const [activeFallbacks, setActiveFallbacks] = useState([]);
  const [stageStatuses, setStageStatuses] = useState(
    PIPELINE_STAGES.map(() => ({ status: 'idle', duration: null, throughput: null, error: null }))
  );
  
  // Degraded inputs simulation overrides
  const [degradedOverrides, setDegradedOverrides] = useState({
    forceLowLight: false,
    forceFogHaze: false,
    forceMotionBlur: false,
    forceNoImu: false,
    forceSparseOverlap: false,
    forceSimulateFailure: false
  });

  // Telemetry logs
  const [logs, setLogs] = useState([
    { timestamp: '00:00:01.042', tag: 'SYSTEM', message: 'Terra Vision Engine daemon initialized (v1.0.0-edge).', level: 'info' },
    { timestamp: '00:00:01.120', tag: 'OFFLINE', message: 'Network interfaces air-gap verified (Zero cloud dependency).', level: 'success' },
    { timestamp: '00:00:01.280', tag: 'HEALTH', message: 'NVIDIA TensorRT + CUDA 12.4 runtime ready on device.', level: 'info' }
  ]);

  // Active 3D Render Mode & Hotspot
  const [renderMode, setRenderMode] = useState('textured'); // 'pointcloud' | 'wireframe' | 'textured' | 'heatmap' | 'heightmap'
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [activeHotspotsList, setActiveHotspotsList] = useState(MOCK_HOTSPOTS.substation);
  const [droneCamFollow, setDroneCamFollow] = useState(false);
  const [orthoView, setOrthoView] = useState(false);
  const [showTrajectory, setShowTrajectory] = useState(true);
  const [showRuler, setShowRuler] = useState(false);

  const timerRef = useRef(null);
  const stageStartTimeRef = useRef(null);

  // Update hotspots when dataset changes
  useEffect(() => {
    const list = MOCK_HOTSPOTS[selectedDataset.defaultHotspots] || MOCK_HOTSPOTS.substation;
    setActiveHotspotsList(list);
    setSelectedHotspot(list[0]);
  }, [selectedDataset]);

  const addLog = useCallback((tag, message, level = 'info') => {
    const now = new Date();
    const ts = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}`;
    setLogs(prev => [...prev.slice(-150), { timestamp: ts, tag, message, level }]);
  }, []);

  // Compute active software fallbacks dynamically based on dataset + overrides
  useEffect(() => {
    const fallbacks = [];
    const flags = {
      ...selectedDataset.degradedFlags,
      lowLight: degradedOverrides.forceLowLight || selectedDataset.degradedFlags?.lowLight,
      fogHaze: degradedOverrides.forceFogHaze || selectedDataset.degradedFlags?.fogHaze,
      motionBlur: degradedOverrides.forceMotionBlur || selectedDataset.degradedFlags?.motionBlur,
      noImu: degradedOverrides.forceNoImu || selectedDataset.degradedFlags?.noImu || !selectedDataset.hasImu,
      monoDepth: degradedOverrides.forceSparseOverlap
    };

    if (flags.lowLight) fallbacks.push('low_light');
    if (flags.fogHaze) fallbacks.push('dehazing');
    if (flags.motionBlur) fallbacks.push('deblurring');
    if (flags.monoDepth) fallbacks.push('mono_depth');
    if (flags.noImu || flags.lowTexture) fallbacks.push('imu_weighting');
    if (flags.loopClosureNeeded) fallbacks.push('loop_closure');

    setActiveFallbacks(fallbacks);
  }, [selectedDataset, degradedOverrides]);

  // Start / Resume Pipeline
  const startReconstruction = useCallback((customDataset = null) => {
    const targetDataset = customDataset || selectedDataset;
    setSelectedDataset(targetDataset);
    
    const jobId = `TV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    setCurrentJob({
      id: jobId,
      dataset: targetDataset,
      startTime: new Date()
    });

    setPipelineState('processing');
    setActiveStageIndex(0);
    setStageProgress(0);
    setTotalProgress(0);
    setStageStatuses(PIPELINE_STAGES.map((s, idx) => ({
      status: idx === 0 ? 'active' : 'idle',
      duration: null,
      throughput: null,
      error: null
    })));

    addLog('ORCHESTRATOR', `Initiating job ${jobId} with dataset [${targetDataset.name}]`, 'info');
    if (!targetDataset.hasImu || degradedOverrides.forceNoImu) {
      addLog('VIO_WARN', 'No IMU telemetry supplied: Engaging visual-only scale recovery fallback.', 'warning');
    }
  }, [selectedDataset, degradedOverrides, addLog]);

  // Main Pipeline Stepper Tick Loop
  useEffect(() => {
    if (pipelineState !== 'processing') return;

    const currentStage = PIPELINE_STAGES[activeStageIndex];
    if (!currentStage) return;

    const actionIdx = Math.min(
      Math.floor((stageProgress / 100) * currentStage.actions.length),
      currentStage.actions.length - 1
    );
    setCurrentAction(currentStage.actions[actionIdx]);

    const intervalMs = 120; // fluid live tick
    const progressIncrement = 4; // speed of step progress

    timerRef.current = setTimeout(() => {
      // Simulate artificial failure if toggle is active on stage 4 (SfM)
      if (degradedOverrides.forceSimulateFailure && activeStageIndex === 4 && stageProgress >= 50) {
        setPipelineState('error');
        setStageStatuses(prev => prev.map((s, idx) => 
          idx === activeStageIndex ? { ...s, status: 'failed', error: 'High epipolar residual divergence (0.94px > 0.60px threshold). Epipolar geometry ambiguous.' } : s
        ));
        addLog('SFM_ERR', 'Bundle adjustment failed to converge within 100 iterations. Operator retry recommended.', 'error');
        setCurrentAction('Pipeline halted: Reprojection error exceeded tolerance.');
        return;
      }

      if (stageProgress + progressIncrement < 100) {
        setStageProgress(prev => prev + progressIncrement);
        const overall = Math.round(((activeStageIndex * 100) + (stageProgress + progressIncrement)) / PIPELINE_STAGES.length);
        setTotalProgress(overall);
      } else {
        // Stage completed! Mark and advance
        setStageStatuses(prev => prev.map((s, idx) => 
          idx === activeStageIndex 
            ? { ...s, status: 'complete', duration: `${(Math.random() * 1.5 + 1.2).toFixed(1)}s`, throughput: currentStage.normalThroughput }
            : s
        ));
        addLog(currentStage.shortName.toUpperCase().replace(/\s+/g, '_'), `Stage ${activeStageIndex + 1}/9 [${currentStage.name}] completed successfully.`, 'success');

        if (activeStageIndex < PIPELINE_STAGES.length - 1) {
          const nextIdx = activeStageIndex + 1;
          setActiveStageIndex(nextIdx);
          setStageProgress(0);
          setStageStatuses(prev => prev.map((s, idx) => 
            idx === nextIdx ? { ...s, status: 'active' } : s
          ));
        } else {
          // All 9 stages completed!
          setPipelineState('completed');
          setStageProgress(100);
          setTotalProgress(100);
          setCurrentAction('Reconstruction finished! 3D textured mesh and 5D confidence matrix loaded.');
          addLog('DELIVERY', 'Reconstruction payload ready. All checksums validated.', 'success');
        }
      }
    }, intervalMs);

    return () => clearTimeout(timerRef.current);
  }, [pipelineState, activeStageIndex, stageProgress, degradedOverrides, addLog]);

  // Retry failed stage
  const retryStage = useCallback(() => {
    if (pipelineState !== 'error') return;
    setDegradedOverrides(prev => ({ ...prev, forceSimulateFailure: false }));
    setPipelineState('processing');
    setStageProgress(0);
    setStageStatuses(prev => prev.map((s, idx) => 
      idx === activeStageIndex ? { ...s, status: 'active', error: null } : s
    ));
    addLog('ORCHESTRATOR', `Retrying stage ${activeStageIndex + 1} with relaxed RANSAC threshold...`, 'info');
  }, [pipelineState, activeStageIndex, addLog]);

  // Reset / Cancel
  const resetPipeline = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPipelineState('idle');
    setActiveStageIndex(0);
    setStageProgress(0);
    setTotalProgress(0);
    setCurrentAction('System standby. Ready for flight footage ingestion.');
    setStageStatuses(PIPELINE_STAGES.map(() => ({ status: 'idle', duration: null, throughput: null, error: null })));
    addLog('ORCHESTRATOR', 'Pipeline reset to idle standby.', 'info');
  }, [addLog]);

  return {
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
  };
}
