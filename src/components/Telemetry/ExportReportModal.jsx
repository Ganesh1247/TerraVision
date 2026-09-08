import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileText, 
  Layers, 
  Box, 
  Map, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';

export default function ExportReportModal({ 
  isOpen, 
  onClose, 
  currentJob, 
  selectedDataset 
}) {
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadSuccess, setDownloadSuccess] = useState(null);

  if (!isOpen) return null;

  const deliverables = [
    {
      id: 'obj',
      title: 'Wavefront 3D Textured Mesh (.OBJ + .MTL)',
      size: '48.2 MB',
      description: 'Clean triangulated UV mesh suitable for Blender, AutoCAD, Unreal Engine & GIS',
      icon: Box,
      checksum: 'sha256: 8f2b3e4...1a9'
    },
    {
      id: 'las',
      title: 'Georeferenced Point Cloud (.LAS / .PLY)',
      size: '112.5 MB',
      description: '1.42M spatial tie-points with normal vectors and RGB photometric color',
      icon: Layers,
      checksum: 'sha256: 3c91d8e...5b2'
    },
    {
      id: 'geotiff',
      title: 'Orthomosaic & Elevation DEM (.GeoTIFF)',
      size: '184.0 MB',
      description: '1.2 cm/pixel true-orthophoto and digital surface elevation model raster',
      icon: Map,
      checksum: 'sha256: 7e44a01...9f8'
    },
    {
      id: 'report',
      title: 'Certified 5D Confidence & Metric Report (.PDF)',
      size: '2.4 MB',
      description: 'Comprehensive engineering audit with uncertainty bands, covariance bounds & raw telemetry',
      icon: FileText,
      checksum: 'sha256: b109f5c...3e0'
    }
  ];

  const handleDownload = (id) => {
    setDownloadingId(id);
    setTimeout(() => {
      setDownloadingId(null);
      setDownloadSuccess(id);
      setTimeout(() => setDownloadSuccess(null), 3000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-dark-850 border border-brand-cyan/30 rounded-xl p-6 shadow-2xl overflow-hidden tech-border-glow">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Export 3D Deliverables & Audit Report
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Session ID: {currentJob?.id || 'TV-2026-089'} · Dataset: {selectedDataset?.name}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Deliverables List */}
        <div className="space-y-3 my-5">
          {deliverables.map((item) => {
            const Icon = item.icon;
            const isDownloading = downloadingId === item.id;
            const isSuccess = downloadSuccess === item.id;

            return (
              <div 
                key={item.id}
                className="p-3.5 rounded-lg bg-dark-800 border border-slate-700/70 hover:border-brand-cyan/40 transition-all flex items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded bg-dark-900 border border-slate-800 text-brand-cyan shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate">
                        {item.title}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-dark-900 border border-slate-700 text-brand-cyan">
                        {item.size}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {item.description}
                    </p>
                    <div className="text-[9px] font-mono text-slate-500 mt-1">
                      {item.checksum}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDownload(item.id)}
                  disabled={isDownloading}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1.5 shrink-0 ${
                    isSuccess
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : isDownloading
                      ? 'bg-slate-700 text-slate-400 cursor-wait'
                      : 'bg-dark-900 hover:bg-brand-cyan hover:text-slate-950 text-slate-200 border border-slate-700'
                  }`}
                >
                  {isSuccess ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Saved</span>
                    </>
                  ) : isDownloading ? (
                    <span>Packaging...</span>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Offline Air-gap Footer */}
        <div className="p-3 rounded-lg bg-dark-900 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Cryptographic SHA-256 sidecar hashes verified locally.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
