import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  Target, 
  Layers, 
  Ruler, 
  Scale, 
  CheckCircle2, 
  ArrowRight,
  Eye,
  Flame,
  Activity
} from 'lucide-react';
import UncertaintyChart from './UncertaintyChart';

export default function MultiDimensionalConfidencePanel({
  hotspot,
  allHotspots = [],
  onSelectHotspot,
  renderMode,
  setRenderMode
}) {
  if (!hotspot) {
    return (
      <div className="p-6 rounded-2xl tv-card text-center text-slate-400 select-none">
        <Target className="w-8 h-8 text-cyan-400 mx-auto mb-2 opacity-50" />
        <p className="text-xs font-mono">Select any 3D asset beacon in the viewport to inspect its 5-dimensional confidence matrix.</p>
      </div>
    );
  }

  const { confidence, measurement } = hotspot;
  const isHighConfidence = hotspot.statusColor === 'emerald';

  const confidenceDimensions = [
    {
      id: 'geometry',
      label: 'GEOMETRY',
      score: confidence.geometry || 94,
      icon: Layers,
      description: 'Feature match density & multi-angle viewing diversity'
    },
    {
      id: 'depth',
      label: 'DEPTH',
      score: confidence.depth || 89,
      icon: Eye,
      description: 'Triangulation ray convergence vs monocular fallback'
    },
    {
      id: 'scale',
      label: 'SCALE',
      score: confidence.scale || 83,
      icon: Scale,
      description: 'Agreement of ground plane, IMU acceleration & priors'
    },
    {
      id: 'semantic',
      label: 'SEMANTIC',
      score: confidence.semantic || 81,
      icon: Target,
      description: 'YOLO object classification & structural prior certainty'
    },
    {
      id: 'measurement',
      label: 'MEASUREMENT',
      score: confidence.measurement || 91,
      icon: Ruler,
      description: 'Composite statistical uncertainty for metric measurements'
    }
  ];

  const overallScore = (
    (confidence.geometry + confidence.depth + confidence.scale + confidence.semantic + confidence.measurement) / 5
  ).toFixed(1);

  const getScoreColor = (score) => {
    if (score >= 80) return { bar: 'bg-emerald-400 shadow-[0_0_8px_#34d399]', text: 'text-emerald-400', badge: 'HIGH (VERIFIED)' };
    if (score >= 60) return { bar: 'bg-amber-400 shadow-[0_0_8px_#fbbf24]', text: 'text-amber-400', badge: 'MEDIUM (ACCEPTABLE)' };
    return { bar: 'bg-rose-500 shadow-[0_0_8px_#ef4444]', text: 'text-rose-400', badge: 'LOW (REFLECTIVE)' };
  };

  const isHeatmapActive = renderMode === 'heatmap';

  return (
    <div className="p-4 sm:p-5 rounded-2xl tv-card border border-cyan-500/30 bg-dark-950/80 shadow-2xl space-y-4 select-none">
      {/* Header & Quick Region Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold uppercase tracking-wider">
              NTRO 5D MATRIX
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
              isHighConfidence ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              {hotspot.qualityAssessment}
            </span>
          </div>
          <h3 className="text-base font-extrabold text-white mt-1">
            {hotspot.title}
          </h3>
        </div>

        {/* Action: Heatmap Toggle & Region Switchers */}
        <div className="flex items-center gap-2">
          {setRenderMode && (
            <button
              onClick={() => setRenderMode(isHeatmapActive ? 'textured' : 'heatmap')}
              className={`tv-btn tv-btn-sm ${isHeatmapActive ? 'tv-btn-primary' : 'tv-btn-secondary'}`}
              title="Toggle 3D confidence color heatmap in scene"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>{isHeatmapActive ? 'Heatmap ON' : 'Confidence Heatmap'}</span>
            </button>
          )}

          {/* Region Switcher Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-[220px]">
            {allHotspots.map((hs) => (
              <button
                key={hs.id}
                onClick={() => onSelectHotspot(hs)}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold whitespace-nowrap transition-colors ${
                  hs.id === hotspot.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60'
                    : 'bg-white/5 text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                {hs.id.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Overall Confidence Score Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-dark-950 via-slate-900 to-dark-950 border border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-black text-lg shadow-[0_0_14px_rgba(52,211,153,0.25)]">
            {overallScore}%
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">COMPOSITE RECONSTRUCTION CONFIDENCE</div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>{hotspot.measurement.value} {hotspot.measurement.unit}</span>
              <span className="text-amber-400 font-mono text-xs">± {hotspot.measurement.uncertainty} {hotspot.measurement.unit}</span>
            </div>
          </div>
        </div>

        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hidden sm:inline-block">
          CERTIFIED METRIC TOLERANCE
        </span>
      </div>

      {/* 5-Dimensional Confidence Progress Rings / Bars */}
      <div className="space-y-2.5">
        {confidenceDimensions.map((dim) => {
          const Icon = dim.icon;
          const styling = getScoreColor(dim.score);

          return (
            <div
              key={dim.id}
              className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-bold text-slate-200">{dim.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">{styling.badge}</span>
                  <span className={`font-black text-xs ${styling.text}`}>{dim.score}%</span>
                </div>
              </div>

              {/* Progress track */}
              <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${styling.bar}`}
                  style={{ width: `${dim.score}%` }}
                />
              </div>

              <p className="text-[10px] text-slate-400 font-mono">
                {dim.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Gaussian Probability Density Curve */}
      <div className="pt-2 border-t border-slate-800">
        <UncertaintyChart hotspot={hotspot} />
      </div>
    </div>
  );
}
