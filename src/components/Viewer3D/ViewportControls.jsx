import React from 'react';
import { 
  Box, 
  Grid3X3, 
  Sparkles, 
  Flame, 
  Layers, 
  RotateCcw, 
  Crosshair, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  Compass, 
  Navigation,
  Eye,
  Minimize2
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
  setOrthoView,
  isFullscreen,
  onToggleFullscreen,
  onZoomIn,
  onZoomOut
}) {
  const modes = [
    { id: 'textured', label: 'SOLID MESH', icon: Box },
    { id: 'pointcloud', label: 'POINT CLOUD', icon: Sparkles },
    { id: 'wireframe', label: 'WIREFRAME', icon: Grid3X3 },
    { id: 'heatmap', label: 'HEATMAP', icon: Flame },
    { id: 'heightmap', label: 'ELEVATION', icon: Layers },
  ];

  return (
    <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
      {/* Left: Render Mode Selector Floating Bar */}
      <div className="tv-floating-bar p-1 flex items-center gap-1 shadow-2xl pointer-events-auto">
        {modes.map((m) => {
          const Icon = m.icon;
          const isActive = renderMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setRenderMode(m.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all duration-200 ${
                isActive
                  ? m.id === 'heatmap'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/60 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 shadow-[0_0_12px_rgba(34,211,238,0.3)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
              title={`Switch to ${m.label} rendering`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right: Floating Workstation Navigation Controls [↻] [⌖] [＋] [−] [▣] */}
      <div className="tv-floating-bar p-1 flex items-center gap-1 shadow-2xl pointer-events-auto text-slate-300">
        {/* Reset Camera [↻] */}
        <button
          onClick={onResetView}
          className="p-1.5 rounded-lg hover:bg-white/10 hover:text-cyan-400 transition-colors"
          title="Reset Camera View [↻]"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Ortho / Top-down Lock [⌖] */}
        <button
          onClick={() => setOrthoView(!orthoView)}
          className={`p-1.5 rounded-lg transition-colors ${
            orthoView 
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_8px_rgba(34,211,238,0.3)]' 
              : 'hover:bg-white/10 hover:text-cyan-400'
          }`}
          title="Toggle Orthographic / Top-Down View [⌖]"
        >
          <Crosshair className="w-4 h-4" />
        </button>

        {/* Zoom In [＋] */}
        {onZoomIn && (
          <button
            onClick={onZoomIn}
            className="p-1.5 rounded-lg hover:bg-white/10 hover:text-cyan-400 transition-colors"
            title="Zoom In [＋]"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        )}

        {/* Zoom Out [−] */}
        {onZoomOut && (
          <button
            onClick={onZoomOut}
            className="p-1.5 rounded-lg hover:bg-white/10 hover:text-cyan-400 transition-colors"
            title="Zoom Out [−]"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        )}

        {/* Trajectory Frustums */}
        <button
          onClick={() => setShowTrajectory(!showTrajectory)}
          className={`p-1.5 rounded-lg transition-colors ${
            showTrajectory 
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50' 
              : 'hover:bg-white/10 text-slate-500 hover:text-slate-300'
          }`}
          title="Toggle Drone Flight Trajectory & VIO Frustums"
        >
          <Navigation className="w-4 h-4" />
        </button>

        {/* Fullscreen [▣] */}
        {onToggleFullscreen && (
          <button
            onClick={onToggleFullscreen}
            className="p-1.5 rounded-lg hover:bg-white/10 hover:text-cyan-400 transition-colors"
            title={isFullscreen ? "Exit Fullscreen [▣]" : "Enter Fullscreen [▣]"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}
