import React from 'react';
import { X, CheckCircle2, AlertTriangle, Layers, Calendar, Clock, HardDrive, ShieldCheck, Download } from 'lucide-react';

export default function JobDetailModal({ job, isOpen, onClose, onLoadIntoViewer }) {
  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-dark-850 border border-brand-cyan/30 rounded-xl p-6 shadow-2xl overflow-hidden tech-border-glow">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Job Details: {job.id}
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                  {job.status.toUpperCase()}
                </span>
              </h3>
              <p className="text-xs text-slate-400">{job.datasetName}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-5 grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 bg-dark-900 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[10px]">TIMESTAMP</span>
            <span className="text-white font-medium">{job.timestamp}</span>
          </div>
          <div className="p-3 bg-dark-900 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[10px]">TOTAL RUNTIME</span>
            <span className="text-brand-cyan font-medium">{job.runtime}</span>
          </div>
          <div className="p-3 bg-dark-900 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[10px]">POINT DENSITY</span>
            <span className="text-white font-medium">{job.pointCount}</span>
          </div>
          <div className="p-3 bg-dark-900 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[10px]">MESH TRIANGLES</span>
            <span className="text-white font-medium">{job.meshFaces}</span>
          </div>
          <div className="p-3 bg-dark-900 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[10px]">SCALE ACCURACY</span>
            <span className="text-emerald-400 font-bold">{job.scaleUncertainty}</span>
          </div>
          <div className="p-3 bg-dark-900 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[10px]">AVG CONFIDENCE</span>
            <span className="text-brand-cyan font-bold">{job.confidenceAvg}%</span>
          </div>
        </div>

        {/* Degraded flags */}
        <div className="p-3 bg-dark-900/60 rounded-lg border border-slate-800 text-xs space-y-1">
          <span className="text-slate-400 font-semibold block text-[10px] uppercase">
            Active Software Fallbacks in this flight:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {job.degradedFlags.map((flag, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-[11px] font-mono">
                {flag}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-dark-900 hover:bg-dark-800 text-slate-300 rounded-lg text-xs font-semibold"
          >
            Close
          </button>
          <button
            onClick={() => {
              onLoadIntoViewer(job);
              onClose();
            }}
            className="px-4 py-2 bg-brand-cyan hover:bg-brand-cyan-dark text-slate-950 rounded-lg text-xs font-bold transition-colors"
          >
            Load Reconstruction in 3D Viewer
          </button>
        </div>
      </div>
    </div>
  );
}
