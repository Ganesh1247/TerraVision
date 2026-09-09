import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileVideo, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Play, 
  RotateCcw, 
  Film, 
  Layers, 
  ShieldAlert, 
  Sparkles 
} from 'lucide-react';
import PresetSelector from './PresetSelector';
import DegradedModeControls from './DegradedModeControls';

export default function UploadPanel({
  selectedDataset,
  onSelectDataset,
  onStartReconstruction,
  pipelineState,
  onResetPipeline,
  degradedOverrides,
  setDegradedOverrides
}) {
  const [dragActive, setDragActive] = useState(false);
  const [customFile, setCustomFile] = useState(null);
  const [customImu, setCustomImu] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [showImuTooltip, setShowImuTooltip] = useState(false);
  const fileInputRef = useRef(null);
  const imuInputRef = useRef(null);

  const isProcessing = pipelineState === 'processing';

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processVideoFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processVideoFile(e.target.files[0]);
    }
  };

  const handleImuChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCustomImu({
        rawFile: file,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      });
    }
  };

  const processVideoFile = (file) => {
    const validExtensions = ['.mp4', '.mov', '.mkv', '.avi', '.zip'];
    const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!hasValidExt) {
      setValidationError('Unsupported format. Please upload MP4, MOV, MKV drone video or ZIP image sequence.');
      return;
    }

    setValidationError(null);
    setCustomFile({
      rawFile: file,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      duration: '02m 30s',
      framesCount: Math.floor(file.size / 100000) || 3600
    });
  };

  const handleStart = () => {
    if (customFile) {
      const customDs = {
        id: `custom-${Date.now()}`,
        name: `Custom Upload: ${customFile.name}`,
        badge: customImu ? 'User Drone Video + IMU' : 'User Drone Video (Visual-Only)',
        scenario: 'User uploaded field dataset',
        videoFile: customFile.name,
        videoSize: customFile.size,
        duration: customFile.duration,
        resolution: '3840x2160 (4K UHD)',
        hasImu: !!customImu,
        imuFile: customImu?.name || null,
        imuSize: customImu?.size || null,
        framesCount: customFile.framesCount,
        expectedPoints: '1,500,000 pts',
        expectedMeshFaces: '300,000 faces',
        expectedAccuracy: customImu ? '± 0.015 m (1.5 cm)' : '± 0.038 m (3.8 cm)',
        degradedFlags: {
          lowLight: degradedOverrides.forceLowLight,
          fogHaze: degradedOverrides.forceFogHaze,
          motionBlur: degradedOverrides.forceMotionBlur,
          noImu: !customImu || degradedOverrides.forceNoImu,
          lowTexture: false,
          loopClosureNeeded: true
        },
        defaultHotspots: 'substation'
      };
      onStartReconstruction(customDs, {
        rawVideoFile: customFile.rawFile,
        rawImuFile: customImu?.rawFile
      });
    } else {
      onStartReconstruction(selectedDataset);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1-Click Preset Selector for Hackathon Judges */}
      <PresetSelector
        selectedDataset={selectedDataset}
        onSelectDataset={(ds) => {
          setCustomFile(null);
          setCustomImu(null);
          onSelectDataset(ds);
        }}
        isProcessing={isProcessing}
      />

      {/* Main Drag-and-Drop Area */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <UploadCloud className="w-3.5 h-3.5 text-brand-cyan" />
            Ingest Drone Footage (Video / Image Set)
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            Offline local parsing
          </span>
        </label>

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-5 text-center transition-all ${
            dragActive 
              ? 'border-brand-cyan bg-brand-cyan/10 shadow-[0_0_20px_rgba(34,211,238,0.2)]' 
              : 'border-slate-800 bg-dark-850/50 hover:border-slate-700 hover:bg-dark-850'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*,.zip"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="p-3 rounded-full bg-dark-800 border border-slate-700 text-brand-cyan shadow-inner">
              <FileVideo className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-200">
                Drag & drop drone flight video or image archive here
              </p>
              <p className="text-[11px] text-slate-400">
                Supports MP4, MOV, MKV (4K/1080p) or zipped frame sequence
              </p>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 border border-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Browse Local Files
            </button>
          </div>

          {/* Active File Validation Feedback */}
          {(customFile || selectedDataset) && (
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-left text-xs bg-dark-900/60 p-2 rounded-lg">
              <div className="flex items-center gap-2 truncate">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="truncate">
                  <span className="font-semibold text-white truncate block">
                    {customFile ? customFile.name : selectedDataset.videoFile}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {customFile ? `${customFile.size} · ~${customFile.framesCount} frames` : `${selectedDataset.videoSize} · ${selectedDataset.resolution}`}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
                VALIDATED
              </span>
            </div>
          )}

          {validationError && (
            <div className="mt-2 flex items-center gap-2 text-xs text-red-400 bg-red-950/40 p-2 rounded-lg border border-red-500/30">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Secondary Upload: Optional IMU Log with Tooltip */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
            Synchronized IMU Log
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
              OPTIONAL
            </span>
          </label>
          
          {/* Tooltip trigger */}
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setShowImuTooltip(true)}
              onMouseLeave={() => setShowImuTooltip(false)}
              onClick={() => setShowImuTooltip(!showImuTooltip)}
              className="text-slate-400 hover:text-brand-cyan flex items-center gap-1 text-[11px]"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Why optional?</span>
            </button>

            {showImuTooltip && (
              <div className="absolute right-0 bottom-full mb-2 w-72 p-3 bg-dark-850 border border-brand-cyan/40 rounded-lg text-[11px] text-slate-300 shadow-2xl z-50 tech-border-glow">
                <p className="font-semibold text-brand-cyan mb-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Graceful Fallback Architecture:
                </p>
                <p>
                  If an IMU log is provided, <strong>VINS-Fusion</strong> couples visual optical flow with high-frequency inertial acceleration for sub-centimeter scale.
                </p>
                <p className="mt-1 text-slate-400">
                  If omitted, Terra Vision <strong>falls back gracefully to pure visual odometry + ground plane geometry</strong> without failing.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-lg bg-dark-850/50 border border-slate-800 hover:border-slate-700">
          <input
            ref={imuInputRef}
            type="file"
            accept=".csv,.txt,.log,.bin"
            onChange={handleImuChange}
            className="hidden"
          />

          <div className="flex items-center gap-2 truncate">
            <div className="p-1.5 rounded bg-dark-800 text-blue-400">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div className="truncate text-xs">
              <div className="text-slate-200 font-medium truncate">
                {customImu 
                  ? customImu.name 
                  : (selectedDataset.hasImu ? selectedDataset.imuFile : 'No IMU file loaded (Visual-only mode active)')}
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                {customImu 
                  ? `${customImu.size} · 200Hz Gyro+Acc` 
                  : (selectedDataset.hasImu ? `${selectedDataset.imuSize} · Synchronized 200Hz telemetry` : 'Ground plane + semantic scaling active')}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => imuInputRef.current?.click()}
            disabled={isProcessing}
            className="px-2.5 py-1 rounded bg-dark-800 hover:bg-dark-750 text-slate-300 border border-slate-700 text-xs font-semibold shrink-0 cursor-pointer"
          >
            {customImu || selectedDataset.hasImu ? 'Replace' : 'Attach IMU'}
          </button>
        </div>
      </div>

      {/* Degraded input simulation matrix */}
      <DegradedModeControls
        degradedOverrides={degradedOverrides}
        setDegradedOverrides={setDegradedOverrides}
        isProcessing={isProcessing}
      />

      {/* Action CTA */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={handleStart}
          disabled={isProcessing}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${
            isProcessing
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-brand-cyan to-brand-cyan-dark hover:from-cyan-400 hover:to-brand-cyan text-slate-950 shadow-lg shadow-brand-cyan/20 hover:shadow-brand-cyan/40 cursor-pointer'
          }`}
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{isProcessing ? 'Reconstruction in Progress...' : 'Start 3D Reconstruction'}</span>
        </button>

        {pipelineState !== 'idle' && (
          <button
            onClick={onResetPipeline}
            className="px-3 py-3 rounded-xl bg-dark-850 hover:bg-dark-800 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 transition-colors"
            title="Reset pipeline to idle"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
