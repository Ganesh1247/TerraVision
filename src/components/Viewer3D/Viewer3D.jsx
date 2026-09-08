import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Scene3D from './Scene3D';
import ViewportControls from './ViewportControls';
import { 
  Flame, 
  Layers, 
  Target, 
  Compass, 
  Crosshair, 
  Ruler, 
  Info,
  Maximize2
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
  const controlsRef = useRef();

  const handleResetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
      controlsRef.current.target.set(0, 0.8, 0);
    }
  };

  return (
    <div className="relative w-full h-[500px] lg:h-[540px] bg-dark-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl tech-border flex flex-col select-none">
      {/* 3D Viewport Controls Toolbar */}
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
            maxDistance={20}
            maxPolarAngle={orthoView ? 0.01 : Math.PI / 2 - 0.05}
          />
        </Canvas>

        {/* Selected Hotspot In-Canvas Floating HUD (Clean 2D Overlay firmly inside Canvas) */}
        {selectedHotspot && (
          <div className="absolute top-16 right-4 z-20 bg-dark-950/90 backdrop-blur-md p-3 rounded-lg border border-brand-cyan/50 text-xs font-mono shadow-2xl space-y-1.5 max-w-[240px]">
            <div className="flex items-center justify-between gap-1 text-[10px] text-brand-cyan font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <Target className="w-3.5 h-3.5" />
                Active 3D Region
              </span>
              <span className={`px-1 rounded text-[9px] ${
                selectedHotspot.statusColor === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {selectedHotspot.confidence.measurement}% CONF
              </span>
            </div>

            <div className="text-xs font-bold text-white leading-tight">
              {selectedHotspot.title.split('—')[0]}
            </div>

            <div className="text-sm font-black text-brand-cyan">
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
        <div className="absolute bottom-3 left-4 z-10 flex items-center gap-3 text-[11px] font-mono text-slate-400 bg-dark-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 pointer-events-none">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-brand-cyan animate-ping-slow" />
            <span className="text-white font-semibold">LOCAL ENU GRID (GPS-FREE)</span>
          </div>
          <span className="text-slate-600">|</span>
          <span>RES: <strong className="text-brand-cyan">1.2 cm/px</strong></span>
          <span className="text-slate-600">|</span>
          <span>SCALE: <strong className="text-emerald-400">{selectedDataset.hasImu ? 'VIO + Ground' : 'Ground Plane'}</strong></span>
        </div>

        {/* Heatmap Legend */}
        {renderMode === 'heatmap' && (
          <div className="absolute bottom-3 right-4 z-10 bg-dark-950/90 backdrop-blur-md p-2.5 rounded-lg border border-amber-500/30 text-xs font-mono shadow-2xl space-y-1">
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
              <span className="w-2.5 h-2.5 rounded bg-red-500" />
              <span className="text-slate-300">&lt; 50% Low (Reflective)</span>
            </div>
          </div>
        )}

        {/* Heightmap Legend */}
        {renderMode === 'heightmap' && (
          <div className="absolute bottom-3 right-4 z-10 bg-dark-950/90 backdrop-blur-md p-2.5 rounded-lg border border-blue-500/30 text-xs font-mono shadow-2xl space-y-1">
            <div className="text-[10px] uppercase font-bold text-blue-400 tracking-wider flex items-center gap-1">
              <Layers className="w-3 h-3" /> Elevation Map
            </div>
            <div className="w-28 h-1.5 rounded bg-gradient-to-r from-blue-600 via-emerald-500 via-amber-400 to-red-500" />
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
