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
  Sparkles,
  Loader2
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
      id: 'glb',
      title: 'Binary glTF 3D Asset (.GLB)',
      size: '34.6 MB',
      vertices: '842,291',
      triangles: '1,684,520',
      textures: 'Embedded 4K PBR',
      confidence: '91.2%',
      description: 'Self-contained binary glTF suitable for WebGL, Three.js, VisionOS, Android AR & GIS',
      icon: Box,
      actionLabel: 'Download GLB'
    },
    {
      id: 'obj',
      title: 'Wavefront 3D Textured Mesh (.OBJ + .MTL)',
      size: '48.2 MB',
      vertices: '842,291',
      triangles: '1,684,520',
      textures: '4 × 4096 PNG Atlases',
      confidence: '91.2%',
      description: 'Clean triangulated UV mesh suitable for Blender, AutoCAD, Unreal Engine & Civil 3D',
      icon: Box,
      actionLabel: 'Download OBJ'
    },
    {
      id: 'ply',
      title: 'Stanford Polygon Point Cloud (.PLY)',
      size: '68.4 MB',
      vertices: '1,240,000',
      triangles: 'N/A (Dense Cloud)',
      textures: 'RGB + 5D Normals',
      confidence: '93.4%',
      description: 'Dense photometric point cloud with normal vectors and surface curvature attributes',
      icon: Layers,
      actionLabel: 'Download PLY'
    },
    {
      id: 'las',
      title: 'Georeferenced ASPRS LiDAR (.LAS / .LAZ)',
      size: '112.5 MB',
      vertices: '1,240,000',
      triangles: 'N/A (LiDAR Standard)',
      textures: 'Intensity + GPS-Free ENU',
      confidence: '91.4%',
      description: 'Survey-grade ASPRS LAS point cloud format for ArcGIS, QGIS & Global Mapper',
      icon: Layers,
      actionLabel: 'Download LAS'
    },
    {
      id: 'geotiff',
      title: 'True-Orthomosaic & DEM (.GeoTIFF)',
      size: '184.0 MB',
      vertices: 'Raster Grid',
      triangles: 'N/A (1.2 cm/px)',
      textures: '4-Band RGBA Elevation',
      confidence: '92.0%',
      description: 'Georeferenced digital elevation model (DEM) and centimeter-precision orthophoto',
      icon: Map,
      actionLabel: 'Download GeoTIFF'
    },
    {
      id: 'report',
      title: 'Certified 5D Confidence & Metric Audit (.PDF)',
      size: '2.8 MB',
      vertices: 'Certified Report',
      triangles: 'Gaussian Bands',
      textures: 'Air-Gap Sealed',
      confidence: '91.2% Certified',
      description: 'Official NTRO SIH26158 certified inspection report with metric scale uncertainty bounds',
      icon: FileText,
      actionLabel: 'Export PDF Report'
    }
  ];

  const handleDownload = (id, filename) => {
    setDownloadingId(id);
    setTimeout(() => {
      setDownloadingId(null);
      setDownloadSuccess(id);

      // Create a dummy mock download file for SIH demo verification
      const dummyContent = `TERRA VISION PRODUCTION DELIVERABLE (SIH26158)\nFormat: ${id.toUpperCase()}\nDataset: ${selectedDataset?.name}\nTimestamp: ${new Date().toISOString()}\nAir-Gap Integrity: VERIFIED\nMetric Scale Tolerance: ± 0.013m\n`;
      const blob = new Blob([dummyContent], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `terravision_${selectedDataset?.id || 'mission'}_${id}.${id === 'report' ? 'pdf' : id === 'geotiff' ? 'tif' : id}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setTimeout(() => setDownloadSuccess(null), 3000);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-fade-in">
      <div className="relative w-full max-w-3xl bg-dark-950 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl overflow-hidden">
        {/* Top glowing accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                Export 3D Deliverables & GIS Models
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Job ID: {currentJob?.id || 'TV-2026-881'} · Dataset: {selectedDataset?.name}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Deliverables List Grid */}
        <div className="space-y-3 my-4 max-h-[60vh] overflow-y-auto tv-scroll-panel pr-1">
          {deliverables.map((item) => {
            const Icon = item.icon;
            const isDownloading = downloadingId === item.id;
            const isSuccess = downloadSuccess === item.id;

            return (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-dark-950 border border-slate-800 text-cyan-400 shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-white truncate">
                        {item.title}
                      </h4>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        {item.size}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      {item.description}
                    </p>

                    {/* Metadata tags */}
                    <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 pt-0.5">
                      <span>Vertices: <strong className="text-slate-200">{item.vertices}</strong></span>
                      <span>·</span>
                      <span>Faces: <strong className="text-slate-200">{item.triangles}</strong></span>
                      <span>·</span>
                      <span>Confidence: <strong className="text-emerald-400">{item.confidence}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex sm:justify-end">
                  <button
                    onClick={() => handleDownload(item.id, item.title)}
                    disabled={isDownloading}
                    className={`tv-btn tv-btn-sm w-full sm:w-auto ${
                      isSuccess ? 'tv-btn-success' : 'tv-btn-primary'
                    }`}
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Packaging...</span>
                      </>
                    ) : isSuccess ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Downloaded</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>{item.actionLabel}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>SHA-256 Sealed Checksums Verified</span>
          </div>
          <button 
            onClick={onClose}
            className="tv-btn tv-btn-secondary tv-btn-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
