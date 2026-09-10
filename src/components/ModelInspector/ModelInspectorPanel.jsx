import React, { useState } from 'react';
import { 
  Box, 
  Layers, 
  TrendingUp, 
  ShieldCheck, 
  Compass, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Cpu, 
  Sparkles,
  Ruler,
  Maximize2
} from 'lucide-react';

export default function ModelInspectorPanel({ 
  selectedDataset,
  selectedHotspot,
  pipelineState
}) {
  const [sectionsOpen, setSectionsOpen] = useState({
    geometry: true,
    scale: true,
    sensor: false,
    bounds: false
  });

  const toggleSection = (sec) => {
    setSectionsOpen(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  const isComplete = pipelineState === 'completed';

  const modelStats = {
    name: selectedDataset?.name || 'Tactical Survey Unit A',
    vertices: isComplete ? '842,291' : '418,120',
    triangles: isComplete ? '1,684,520' : '836,240',
    points: isComplete ? '1.24M' : '620K',
    textures: '4 (4096 × 4096 UV)',
    scale: 'Metric (Ground RANSAC + VIO)',
    uncertainty: '± 0.013 m',
    quality: 'High (Poisson Recon)',
    confidence: '91.2%'
  };

  return (
    <div className="tv-card p-4 rounded-xl border border-[var(--border-subtle)] bg-dark-950/80 space-y-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-100">
          <Box className="w-4 h-4 text-cyan-400" />
          <span>3D MODEL INSPECTOR</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
          LOCAL ENU
        </span>
      </div>

      {/* Model Overview Summary */}
      <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">IDENTIFIER</span>
            <h4 className="text-xs font-extrabold text-white truncate max-w-[180px]" title={modelStats.name}>
              {modelStats.name}
            </h4>
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
            {modelStats.confidence} CONF
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px] font-mono">
          <div>
            <span className="text-slate-500 text-[9px] block">VERTICES</span>
            <strong className="text-slate-200">{modelStats.vertices}</strong>
          </div>
          <div>
            <span className="text-slate-500 text-[9px] block">TRIANGLES</span>
            <strong className="text-slate-200">{modelStats.triangles}</strong>
          </div>
          <div>
            <span className="text-slate-500 text-[9px] block">POINT CLOUD</span>
            <strong className="text-cyan-400">{modelStats.points}</strong>
          </div>
          <div>
            <span className="text-slate-500 text-[9px] block">QUALITY</span>
            <strong className="text-emerald-400">{modelStats.quality}</strong>
          </div>
        </div>
      </div>

      {/* Collapsible Section 1: Geometric Mesh Details */}
      <div className="border border-slate-800 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('geometry')}
          className="w-full px-3 py-2 bg-slate-900/60 flex items-center justify-between text-left text-xs font-semibold text-slate-200 hover:bg-white/5 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            Geometry & Texture
          </span>
          {sectionsOpen.geometry ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {sectionsOpen.geometry && (
          <div className="p-3 bg-dark-950/40 text-[11px] font-mono space-y-1.5 border-t border-slate-800">
            <div className="flex justify-between py-0.5">
              <span className="text-slate-400">Texture Atlases</span>
              <span className="text-slate-200 font-semibold">{modelStats.textures}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-400">Recon Engine</span>
              <span className="text-slate-200 font-semibold">Screened Poisson MVS</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-400">Ground Resolution</span>
              <span className="text-cyan-400 font-semibold">1.2 cm / px</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-400">Normal Estimation</span>
              <span className="text-slate-200 font-semibold">Covariance k=16</span>
            </div>
          </div>
        )}
      </div>

      {/* Collapsible Section 2: Scale Recovery & Tolerance */}
      <div className="border border-slate-800 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('scale')}
          className="w-full px-3 py-2 bg-slate-900/60 flex items-center justify-between text-left text-xs font-semibold text-slate-200 hover:bg-white/5 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Ruler className="w-3.5 h-3.5 text-amber-400" />
            Metric Scale Recovery
          </span>
          {sectionsOpen.scale ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {sectionsOpen.scale && (
          <div className="p-3 bg-dark-950/40 text-[11px] font-mono space-y-1.5 border-t border-slate-800">
            <div className="flex justify-between py-0.5">
              <span className="text-slate-400">Scale Mode</span>
              <span className="text-emerald-400 font-semibold">Certified Metric (m)</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-400">Error Bound ±δ</span>
              <span className="text-amber-400 font-bold">{modelStats.uncertainty}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-400">Scale Factor λ</span>
              <span className="text-slate-200 font-semibold">1.0428 m / unit</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-400">Ground Plane RANSAC</span>
              <span className="text-emerald-400 font-semibold">Residual 0.008 m</span>
            </div>
          </div>
        )}
      </div>

      {/* Collapsible Section 3: Sensor & Hardware Metadata */}
      <div className="border border-slate-800 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('sensor')}
          className="w-full px-3 py-2 bg-slate-900/60 flex items-center justify-between text-left text-xs font-semibold text-slate-200 hover:bg-white/5 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-violet-400" />
            Edge Hardware & Sensor
          </span>
          {sectionsOpen.sensor ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {sectionsOpen.sensor && (
          <div className="p-3 bg-dark-950/40 text-[11px] font-mono space-y-1.5 border-t border-slate-800">
            <div className="flex justify-between py-0.5">
              <span className="text-slate-400">IMU Synchronizer</span>
              <span className="text-slate-200 font-semibold">{selectedDataset?.hasImu ? '200 Hz Synchronized' : 'Visual Fallback'}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-400">TensorRT Quantization</span>
              <span className="text-emerald-400 font-semibold">FP16 / INT8 Edge</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-400">Air-Gap Verification</span>
              <span className="text-emerald-400 font-semibold">Hard Constraint (0 Egress)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
