import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  Target, 
  Layers, 
  Ruler, 
  Scale, 
  Info, 
  CheckCircle2, 
  ArrowRight,
  Eye
} from 'lucide-react';
import UncertaintyChart from './UncertaintyChart';

export default function MultiDimensionalConfidencePanel({
  hotspot,
  allHotspots = [],
  onSelectHotspot
}) {
  if (!hotspot) {
    return (
      <div className="p-6 rounded-xl bg-dark-850 border border-slate-800 text-center text-slate-400">
        <Target className="w-8 h-8 text-brand-cyan mx-auto mb-2 opacity-50" />
        <p className="text-xs">Click any 3D asset hotspot or region pin in the viewer to inspect 5-dimensional confidence metrics.</p>
      </div>
    );
  }

  const { confidence, measurement } = hotspot;
  const isHighConfidence = hotspot.statusColor === 'emerald';

  const confidenceDimensions = [
    {
      id: 'geometry',
      label: 'Geometry Confidence',
      score: confidence.geometry,
      icon: Layers,
      description: 'Constrained by feature match density & multi-angle viewing ray diversity'
    },
    {
      id: 'depth',
      label: 'Depth Confidence',
      score: confidence.depth,
      icon: Eye,
      description: 'Reliability of depth values (multi-view triangulation vs monocular fallback)'
    },
    {
      id: 'scale',
      label: 'Scale Confidence',
      score: confidence.scale,
      icon: Scale,
      description: 'Agreement level across ground plane, IMU acceleration & camera calibration'
    },
    {
      id: 'semantic',
      label: 'Semantic Confidence',
      score: confidence.semantic,
      icon: Target,
      description: 'Certainty in object segmentation prior feeding into physical scale logic'
    },
    {
      id: 'measurement',
      label: 'Composite Measurement Confidence',
      score: confidence.measurement,
      icon: Ruler,
      description: 'Combined statistical reliability of any spatial metric taken in this region'
    }
  ];

  const getScoreColor = (score) => {
    if (score >= 80) return { bar: 'bg-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
    if (score >= 60) return { bar: 'bg-amber-500', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    return { bar: 'bg-red-500', text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' };
  };

  return (
    <div className="p-4 sm:p-5 rounded-xl bg-dark-850 border border-brand-cyan/30 shadow-2xl tech-border-glow space-y-4">
      {/* Header & Quick Region Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan font-bold uppercase tracking-wider">
              Core Differentiator
            </span>
            <span className={`text-xs font-mono px-2 py-0.5 rounded border font-semibold ${
              isHighConfidence ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              {hotspot.qualityAssessment}
            </span>
          </div>
          <h2 className="text-base font-bold text-white mt-1">
            {hotspot.title}
          </h2>
        </div>

        {/* Region Switcher Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {allHotspots.map((hs) => (
            <button
              key={hs.id}
              onClick={() => onSelectHotspot(hs)}
              className={`px-2 py-1 rounded text-[11px] font-mono whitespace-nowrap transition-all ${
                hs.id === hotspot.id
                  ? 'bg-brand-cyan text-slate-950 font-bold'
                  : 'bg-dark-900 hover:bg-dark-800 text-slate-400 border border-slate-800'
              }`}
            >
              {hs.title.split('—')[0].trim()}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Stat: Metric Measurement with Uncertainty Band */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-dark-900 to-dark-950 border border-brand-cyan/40 shadow-inner relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan/5 rounded-full blur-2xl" />
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="text-[11px] font-mono text-brand-cyan uppercase tracking-wider font-semibold">
              {measurement.type} (Metric Reference)
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                {measurement.value} <span className="text-2xl font-bold text-slate-300">{measurement.unit}</span>
              </span>
              <span className={`text-lg font-bold font-mono ${
                measurement.uncertainty <= 0.5 ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                ± {measurement.uncertainty} {measurement.unit}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1 font-mono">
              95% Confidence Interval · σ = {measurement.uncertainty.toFixed(2)}{measurement.unit}
            </div>
          </div>

          {measurement.secondaryMetric && (
            <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-4">
              <div className="text-[10px] font-mono text-slate-400 uppercase">
                {measurement.secondaryMetric.label}
              </div>
              <div className="text-lg font-bold text-white font-mono">
                {measurement.secondaryMetric.value}
              </div>
              <div className="text-[10px] text-amber-400 font-mono">
                {measurement.secondaryMetric.uncertainty}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Uncertainty Distribution Curve */}
      <UncertaintyChart
        mean={measurement.value}
        sigma={measurement.uncertainty}
        unit={measurement.unit}
        confidencePct={confidence.measurement}
      />

      {/* 5-Dimensional Confidence Bars */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-300 font-semibold uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-cyan" />
            5-Dimensional Confidence Breakdown
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            Per-Region Evaluation Tensor
          </span>
        </div>

        <div className="space-y-2">
          {confidenceDimensions.map((dim) => {
            const Icon = dim.icon;
            const colors = getScoreColor(dim.score);
            const isHero = dim.id === 'measurement';

            return (
              <div
                key={dim.id}
                className={`p-2.5 rounded-lg border transition-all ${
                  isHero ? 'bg-dark-800/90 border-brand-cyan/40' : 'bg-dark-900/50 border-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 ${colors.text}`} />
                    <span className={`font-semibold ${isHero ? 'text-white' : 'text-slate-200'}`}>
                      {dim.label}
                    </span>
                  </div>
                  <span className={`font-mono font-bold ${colors.text}`}>
                    {dim.score}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-dark-950 rounded-full h-2 overflow-hidden">
                  <div
                    className={`${colors.bar} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${dim.score}%` }}
                  />
                </div>

                <div className="text-[10px] text-slate-400 mt-1 truncate">
                  {dim.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Explainable AI Rationale & Decision Value Box */}
      <div className="p-3 rounded-lg bg-dark-900/90 border border-slate-800 text-xs space-y-1.5">
        <div className="flex items-center gap-1.5 text-brand-cyan font-semibold">
          <Info className="w-3.5 h-3.5" />
          <span>Algorithmic Explanation:</span>
        </div>
        <p className="text-slate-300 leading-relaxed text-[11px]">
          {hotspot.explanation}
        </p>
        <div className="pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center gap-1.5">
          <strong className="text-slate-300">Why this matters:</strong>
          <span>A confidently wrong measurement is dangerous. Explicit uncertainty bounds empower critical field decisions.</span>
        </div>
      </div>
    </div>
  );
}
