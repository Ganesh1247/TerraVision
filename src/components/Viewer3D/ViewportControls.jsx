import React from 'react';
import { 
  Box, 
  Grid3X3, 
  Sparkles, 
  Flame, 
  Eye, 
  Maximize2, 
  Compass, 
  Layers, 
  Crosshair, 
  Ruler, 
  Navigation 
} from 'lucide-react';

export default function ViewportControls({
  renderMode,
  setRenderMode,
  showTrajectory,
  setShowTrajectory,
  showRuler,
  setShowRuler,
  onResetView,
  orthoView,
  setOrthoView
}) {
  const modes = [
    { id: 'textured', label: 'Textured Mesh', icon: Box },
    { id: 'pointcloud', label: 'Dense Cloud', icon: Sparkles },
    { id: 'wireframe', label: 'Wireframe', icon: Grid3X3 },
    { id: 'heatmap', label: 'Confidence Heatmap', icon: Flame },
    { id: 'heightmap', label: 'Elevation Contours', icon: Layers },
  ];

  return (
    <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
      {/* Left: Render Mode Buttons */}
      <div className="flex items-center gap-1 p-1 bg-dark-950/80 backdrop-blur-md rounded-xl border border-slate-800 shadow-xl pointer-events-auto">
        {modes.map((m) => {
          const Icon = m.icon;
          const isActive = renderMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setRenderMode(m.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? m.id === 'heatmap'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-brand-cyan text-slate-950 font-bold shadow-md shadow-brand-cyan/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title={m.label}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right: Camera Tools & Overlays */}
      <div className="flex items-center gap-1 p-1 bg-dark-950/80 backdrop-blur-md rounded-xl border border-slate-800 shadow-xl pointer-events-auto">
        {/* Trajectory toggle */}
        <button
          onClick={() => setShowTrajectory(!showTrajectory)}
          className={`p-1.5 rounded-lg text-xs transition-colors ${
            showTrajectory ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40' : 'text-slate-400 hover:text-white'
          }`}
          title="Toggle Drone Flight Trajectory & Camera Frustums"
        >
          <Navigation className="w-4 h-4" />
        </button>

        {/* Orthographic / Top-down toggle */}
        <button
          onClick={() => setOrthoView(!orthoView)}
          className={`p-1.5 rounded-lg text-xs transition-colors ${
            orthoView ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40' : 'text-slate-400 hover:text-white'
          }`}
          title="Toggle Top-Down Orthographic View"
        >
          <Crosshair className="w-4 h-4" />
        </button>

        {/* Reset Camera View */}
        <button
          onClick={onResetView}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs transition-colors"
          title="Reset Orbit Camera"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
