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
  Sparkles,
  X,
  Radio,
  Clock,
  Maximize2,
  HardDrive,
  Camera
} from 'lucide-react';
import PresetSelector from './PresetSelector';

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
    const validExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.jpg', '.jpeg', '.png', '.zip'];
    const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!hasValidExt) {
      setValidationError('Unsupported format. Please upload MP4, MOV, AVI drone video or JPG/PNG image set.');
      return;
    }

    setValidationError(null);
    setCustomFile({
      rawFile: file,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      duration: '02m 45s',
      resolution: '3840 × 2160 (4K UHD)',
      fps: '60 fps',
      framesCount: Math.floor(file.size / 95000) || 3840
    });
  };

  const handleRemoveFile = () => {
    setCustomFile(null);
    setValidationError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImu = () => {
    setCustomImu(null);
    if (imuInputRef.current) imuInputRef.current.value = '';
  };

  const handleStart = () => {
    if (customFile) {
      const customDs = {
        id: `custom-${Date.now()}`,
        name: `Custom Upload: ${customFile.name}`,
        badge: customImu ? 'User Drone Video + IMU' : 'User Drone Video (Visual-Only)',
        scenario: 'User uploaded flight dataset',
        videoFile: customFile.name,
        videoSize: customFile.size,
        duration: customFile.duration,
        resolution: customFile.resolution,
        hasImu: !!customImu,
        imuFile: customImu?.name || null,
        imuSize: customImu?.size || null,
        framesCount: customFile.framesCount,
        expectedPoints: '1,500,000 pts',
        expectedMeshFaces: '320,000 faces',
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

  const activeVideoInfo = customFile || {
    name: selectedDataset.videoFile,
    size: selectedDataset.videoSize,
    duration: selectedDataset.duration,
    resolution: selectedDataset.resolution,
    fps: '30 fps',
    framesCount: selectedDataset.frames
  };

  const hasActiveImu = customImu || selectedDataset.hasImu;

  return (
    <div className="space-y-4 select-none">
      {/* 1-Click Preset Benchmark Scenarios */}
      <PresetSelector
        selectedDataset={selectedDataset}
        onSelectDataset={(ds) => {
          setCustomFile(null);
          setCustomImu(null);
          onSelectDataset(ds);
        }}
        isProcessing={isProcessing}
      />

      {/* Large Premium Drag & Drop Upload Zone */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-cyan-400" />
            <span>Drone Video / Image Ingestion</span>
          </label>
        </div>

        {/* The Drop Zone Box */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative rounded-2xl p-6 text-center transition-all duration-300 border-2 ${
            dragActive 
              ? 'tv-dropzone-active' 
              : 'tv-dashed-border bg-gradient-to-b from-dark-950/80 to-slate-950/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*,image/*,.zip"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Animated Drone / Reconstruction Icon */}
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/10 via-slate-800/40 to-blue-600/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.15)] group-hover:scale-105 group-hover:border-cyan-400 transition-all">
                <FileVideo className="w-7 h-7" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-white tracking-wide">
                DROP DRONE VIDEO OR IMAGE SET
              </h4>
              <p className="text-xs text-slate-400 font-mono">
                MP4, MOV, AVI, JPG, PNG, or ZIP sequence
              </p>
            </div>

            <div className="pt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="tv-btn tv-btn-secondary tv-btn-sm"
              >
                Browse Local Files
              </button>
            </div>
          </div>

          {/* Validation Error Banner */}
          {validationError && (
            <div className="mt-3 flex items-center gap-2 text-xs p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Selected Video File Preview Card */}
      <div className="tv-card p-3.5 rounded-xl border border-[var(--border-subtle)] bg-dark-950/70 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <Film className="w-3.5 h-3.5 text-cyan-400" />
            <span>Active Payload File</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              READY FOR PIPELINE
            </span>
            {customFile && (
              <button
                type="button"
                onClick={handleRemoveFile}
                disabled={isProcessing}
                className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-rose-400 transition-colors"
                title="Remove uploaded file"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Video metadata grid */}
        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
          <div>
            <span className="text-slate-500 block text-[9px]">FILE</span>
            <span className="text-slate-200 font-bold truncate block" title={activeVideoInfo.name}>
              {activeVideoInfo.name}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[9px]">DURATION / FPS</span>
            <span className="text-slate-200 font-bold">
              {activeVideoInfo.duration} · {activeVideoInfo.fps}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[9px]">RESOLUTION</span>
            <span className="text-slate-200 font-bold">
              {activeVideoInfo.resolution}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[9px]">SIZE / FRAMES</span>
            <span className="text-cyan-400 font-bold">
              {activeVideoInfo.size} (~{activeVideoInfo.framesCount})
            </span>
          </div>
        </div>
      </div>

      {/* Optional IMU Telemetry Log Upload */}
      <div className="tv-card p-3.5 rounded-xl border border-[var(--border-subtle)] bg-dark-950/70 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <FileSpreadsheet className="w-3.5 h-3.5 text-violet-400" />
            <span>IMU Log (Optional)</span>
          </label>

          {/* Tooltip trigger */}
          <div className="relative flex items-center gap-2">
            <button
              type="button"
              onMouseEnter={() => setShowImuTooltip(true)}
              onMouseLeave={() => setShowImuTooltip(false)}
              className="text-[11px] text-slate-400 hover:text-cyan-400 flex items-center gap-1 font-mono transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Info</span>
            </button>

            {showImuTooltip && (
              <div className="absolute right-0 bottom-full mb-2 w-72 p-3 rounded-xl text-[11px] bg-dark-950/95 border border-slate-700 text-slate-300 shadow-2xl z-50 animate-scale-in">
                <p className="font-bold text-cyan-400 mb-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Visual-Inertial Fusion:
                </p>
                <p>When an IMU CSV/LOG is attached, 200Hz accelerometer and gyroscope streams couple with optical flow for sub-centimeter metric scale.</p>
                <p className="mt-1 text-slate-400">If omitted, the system falls back gracefully to Ground Plane RANSAC and object priors without failing.</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
          <input
            ref={imuInputRef}
            type="file"
            accept=".csv,.txt,.log,.bin"
            onChange={handleImuChange}
            className="hidden"
          />

          <div className="flex items-center gap-2.5 min-w-0">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${hasActiveImu ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-slate-500'}`} />
            <div className="truncate text-xs">
              <div className="font-bold text-slate-200 truncate">
                {hasActiveImu ? '✓ IMU Telemetry Detected (200Hz)' : '○ No IMU data (Visual-Only fallback active)'}
              </div>
              <div className="text-[10px] font-mono text-slate-400 truncate">
                {customImu ? `${customImu.name} (${customImu.size})` : selectedDataset.hasImu ? selectedDataset.imuFile : 'Ground plane RANSAC + visual odometry active'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {customImu && (
              <button
                type="button"
                onClick={handleRemoveImu}
                disabled={isProcessing}
                className="p-1 text-slate-400 hover:text-rose-400"
                title="Remove IMU"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => imuInputRef.current?.click()}
              disabled={isProcessing}
              className="tv-btn tv-btn-secondary tv-btn-sm"
            >
              {hasActiveImu ? 'Replace IMU' : 'Attach CSV'}
            </button>
          </div>
        </div>
      </div>

      {/* Execution CTA Action Buttons */}
      <div className="flex gap-2.5 pt-1">
        <button
          onClick={handleStart}
          disabled={isProcessing}
          className="tv-btn tv-btn-primary tv-btn-lg flex-1 justify-center shadow-lg"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{isProcessing ? 'Reconstruction in Progress...' : 'Start 3D Reconstruction'}</span>
        </button>

        {pipelineState !== 'idle' && (
          <button
            onClick={onResetPipeline}
            className="tv-btn tv-btn-secondary tv-btn-lg px-4"
            title="Reset pipeline to idle state"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
