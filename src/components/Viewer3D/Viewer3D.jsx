import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Scene3D from './Scene3D';
import ViewportControls from './ViewportControls';
import MeasurementToolbar from '../Measurements/MeasurementToolbar';
import { 
  Flame, 
  Layers, 
  Target, 
  Radio, 
  Compass, 
  Crosshair, 
  Ruler, 
  Info,
  Maximize2,
  Minimize2,
  Box,
  Sparkles,
  Camera
} from 'lucide-react';

export default function Viewer3D({
  renderMode,
  setRenderMode,
  activeStageIndex,
  pipelineState,
  hotspots,
  selectedHotspot,
  onSelectHotspot,
  showTrajectory,
  setShowTrajectory,
  showRuler,
  setShowRuler,
  droneCamFollow,
  setDroneCamFollow,
  orthoView,
  setOrthoView,
  selectedDataset
}) {
  const containerRef = useRef();
  const controlsRef = useRef();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeMeasurementTool, setActiveMeasurementTool] = useState(null);
  const [measurementResult, setMeasurementResult] = useState(null);

  const handleResetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
      controlsRef.current.target.set(0, 0.8, 0);
    }
  };

  const handleZoomIn = () => {
    if (controlsRef.current?.object) {
      controlsRef.current.object.position.multiplyScalar(0.85);
      controlsRef.current.update();
    }
  };

  const handleZoomOut = () => {
    if (controlsRef.current?.object) {
      controlsRef.current.object.position.multiplyScalar(1.15);
      controlsRef.current.update();
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const isComplete = pipelineState === 'completed';

  return (
    <div 
      ref={containerRef}
      className={`relative w-full bg-dark-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col select-none tv-corner-mark transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : 'h-[520px] lg:h-[580px]'
      }`}
    >
      {/* 3D Viewport Controls Floating Toolbar */}
      <ViewportControls
        renderMode={renderMode}
        setRenderMode={setRenderMode}
        showTrajectory={showTrajectory}
        setShowTrajectory={setShowTrajectory}
        showRuler={showRuler}
        setShowRuler={setShowRuler}
        onResetView={handleResetView}
        orthoView={orthoView}
        setOrthoView={setOrthoView}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />

      {/* Main Three.js Canvas */}
      <div className="relative flex-1 w-full h-full cursor-grab active:cursor-grabbing overflow-hidden">
        <Canvas
          shadows
          camera={{ 
            position: orthoView ? [0, 12, 0.01] : [6.5, 5.2, 6.5], 
            fov: orthoView ? 36 : 44 
          }}
          gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
        >
          <color attach="background" args={['#070A0E']} />
          <ambientLight intensity={0.7} />
          <directionalLight
            position={[8, 14, 6]}
            intensity={1.3}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <directionalLight position={[-6, 8, -6]} intensity={0.4} color="#22D3EE" />

          {/* 3D Scene */}
          <Scene3D
            renderMode={renderMode}
            activeStageIndex={activeStageIndex}
            pipelineState={pipelineState}
            hotspots={hotspots}
            selectedHotspot={selectedHotspot}
            onSelectHotspot={onSelectHotspot}
            showTrajectory={showTrajectory}
            showRuler={showRuler}
            selectedDataset={selectedDataset}
          />

          {/* Orbit Controls centered on [0, 0.8, 0] */}
          <OrbitControls
            ref={controlsRef}
            target={[0, 0.8, 0]}
            makeDefault
            enableDamping
            dampingFactor={0.06}
            minDistance={2.5}
            maxDistance={25}
            maxPolarAngle={orthoView ? 0.01 : Math.PI / 2 - 0.05}
          />
        </Canvas>

        {/* ── Technical In-Viewport HUD (Top-Left under controls) ───── */}
        <div className="absolute top-16 left-3 z-10 tv-floating-bar px-3 py-2 text-[10px] font-mono shadow-2xl space-y-1.5 pointer-events-none border-cyan-500/20">
          <div className="flex items-center justify-between gap-3 pb-1 border-b border-slate-800">
            <span className="text-slate-500 uppercase">MODEL STATUS</span>
            <span className={`font-bold px-1.5 py-0.5 rounded text-[9px] ${
              isComplete ? 'bg-emerald-500/20 text-emerald-400' : pipelineState === 'processing' ? 'bg-cyan-500/20 text-cyan-400 animate-pulse' : 'bg-slate-800 text-slate-300'
            }`}>
              {isComplete ? 'READY' : pipelineState === 'processing' ? 'PROCESSING' : 'STANDBY'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-slate-300">
            <div>
              <span className="text-slate-500 block text-[9px]">POINTS</span>
              <strong className="text-cyan-400 text-xs">{isComplete ? '1.24M' : '620K'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px]">CAMERAS</span>
              <strong className="text-white text-xs">428</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px]">CONFIDENCE</span>
              <strong className="text-emerald-400 text-xs">91.2%</strong>
            </div>
          </div>
        </div>

        {/* ── CAD & GIS Measurement Floating Bar (Top-Center) ───────── */}
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20">
          <MeasurementToolbar
            activeTool={activeMeasurementTool}
            setActiveTool={setActiveTool => {
              setActiveMeasurementTool(setActiveTool);
              setShowRuler(!!setActiveTool);
            }}
            measurementResult={measurementResult}
            onClearMeasurement={() => {
              setActiveMeasurementTool(null);
              setShowRuler(false);
            }}
          />
        </div>

        {/* Selected Hotspot 3D Region Overlay (Top Right) */}
        {selectedHotspot && (
          <div className="absolute top-16 right-3 z-20 tv-floating-bar p-3 border-cyan-500/50 text-xs font-mono shadow-2xl space-y-1.5 max-w-[240px] pointer-events-auto animate-slide-up">
            <div className="flex items-center justify-between gap-1 text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <Target className="w-3.5 h-3.5" />
                Active Region
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                selectedHotspot.statusColor === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {selectedHotspot.confidence.measurement}% CONF
              </span>
            </div>

            <div className="text-xs font-bold text-white leading-tight">
              {selectedHotspot.title.split('—')[0]}
            </div>

            <div className="text-sm font-black text-cyan-400 font-mono">
              {selectedHotspot.measurement.value} {selectedHotspot.measurement.unit}{' '}
              <span className="text-[10px] text-amber-400 font-normal">
                ± {selectedHotspot.measurement.uncertainty} {selectedHotspot.measurement.unit}
              </span>
            </div>

            <p className="text-[10px] text-slate-400 leading-tight">
              {selectedHotspot.category}
            </p>
          </div>
        )}

        {/* Bottom Left Coordinate / Metric Telemetry */}
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-3 text-[11px] font-mono text-slate-400 tv-floating-bar px-3 py-1.5 border-slate-800 pointer-events-none">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping-slow" />
            <span className="text-white font-bold">LOCAL ENU (GPS-FREE)</span>
          </div>
          <span className="text-slate-600">|</span>
          <span>RES: <strong className="text-cyan-400">1.2 cm/px</strong></span>
          <span className="text-slate-600">|</span>
          <span>SCALE: <strong className="text-emerald-400">{selectedDataset?.hasImu ? 'VIO + Ground' : 'Ground Plane'}</strong></span>
        </div>

        {/* Heatmap Legend */}
        {renderMode === 'heatmap' && (
          <div className="absolute bottom-3 right-3 z-10 tv-floating-bar p-2.5 border-amber-500/30 text-xs font-mono shadow-2xl space-y-1">
            <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1">
              <Flame className="w-3 h-3" /> Confidence Overlay
            </div>
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
              <span className="text-slate-300">&gt; 80% High (Verified)</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="w-2.5 h-2.5 rounded bg-amber-500" />
              <span className="text-slate-300">50% - 80% Medium</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="w-2.5 h-2.5 rounded bg-rose-500" />
              <span className="text-slate-300">&lt; 50% Low (Reflective)</span>
            </div>
          </div>
        )}

        {/* Heightmap Legend */}
        {renderMode === 'heightmap' && (
          <div className="absolute bottom-3 right-3 z-10 tv-floating-bar p-2.5 border-blue-500/30 text-xs font-mono shadow-2xl space-y-1">
            <div className="text-[10px] uppercase font-bold text-blue-400 tracking-wider flex items-center gap-1">
              <Layers className="w-3 h-3" /> Elevation Map
            </div>
            <div className="w-28 h-1.5 rounded bg-gradient-to-r from-blue-600 via-emerald-500 via-amber-400 to-rose-500" />
            <div className="flex justify-between text-[9px] text-slate-400">
              <span>0.0m</span>
              <span>+18.4m</span>
              <span>+35.0m</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
