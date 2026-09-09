import React, { useState } from 'react';
import { Compass, Scale, CheckCircle2, AlertTriangle, RefreshCw, HelpCircle, Layers } from 'lucide-react';

export default function ScaleCalibrationCard({
  axisOrientation,
  setAxisOrientation,
  scaleFactor,
  scaleConfidence,
  scaleResidual,
  referenceCount,
  onCalibrateFromUserRef,
  onResetCalibration,
  isPickingScalePoints,
  setIsPickingScalePoints,
  pickedScalePoints
}) {
  const [knownDistanceInput, setKnownDistanceInput] = useState('10.0');

  const handleApplyCalibration = () => {
    if (pickedScalePoints.length < 2) return;
    const knownMeters = parseFloat(knownDistanceInput);
    if (!isNaN(knownMeters) && knownMeters > 0) {
      onCalibrateFromUserRef(pickedScalePoints[0], pickedScalePoints[1], knownMeters);
      setIsPickingScalePoints(false);
    }
  };

  const isCalibrated = scaleFactor !== null && scaleFactor > 0;

  return (
    <div className="bg-dark-950/90 border border-slate-800 rounded-xl p-4 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Metric Scale Calibration
              {isCalibrated ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> CALIBRATED
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> UNCALIBRATED
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400">Establish scale ratio (meters / model unit)</p>
          </div>
        </div>

        {isCalibrated && (
          <button
            onClick={onResetCalibration}
            className="p-1.5 rounded bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
            title="Reset Scale Calibration"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
      </div>

      {/* Axis Orientation Selector */}
      <div className="space-y-1.5">
        <label className="text-xs text-slate-400 font-mono flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-brand-cyan" />
            Vertical Axis Orientation
          </span>
          <span className="text-[11px] text-brand-cyan font-bold">{axisOrientation}</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['Y-up', 'Z-up', 'X-up'].map((axis) => (
            <button
              key={axis}
              onClick={() => setAxisOrientation(axis)}
              className={`py-1.5 px-2 rounded-lg text-xs font-mono font-semibold transition-all border cursor-pointer ${
                axisOrientation === axis
                  ? 'bg-brand-cyan/20 text-brand-cyan border-brand-cyan/50 shadow-md shadow-brand-cyan/10'
                  : 'bg-dark-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              {axis} {axis === 'Y-up' ? '(Three.js Default)' : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Reference A: Interactive 2-Point Calibrator */}
      <div className="bg-dark-900/90 rounded-lg p-3 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-200 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-brand-cyan" />
            Reference A — Known Distance Calibration
          </span>
          {referenceCount > 0 && (
            <span className="text-[10px] text-emerald-400 font-bold">
              {referenceCount} Pair{referenceCount > 1 ? 's' : ''} Stored
            </span>
          )}
        </div>

        <div className="space-y-2">
          <button
            onClick={() => setIsPickingScalePoints(!isPickingScalePoints)}
            className={`w-full py-2 px-3 rounded-lg text-xs font-mono font-bold transition-all border flex items-center justify-center gap-2 cursor-pointer ${
              isPickingScalePoints
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse'
                : 'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/30 hover:bg-brand-cyan/20'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            {isPickingScalePoints
              ? `Click 2 Points in 3D Viewport (${pickedScalePoints.length}/2 Picked)`
              : 'Pick 2 Points in 3D Viewport to Calibrate Scale'}
          </button>

          {/* Points Status */}
          {pickedScalePoints.length > 0 && (
            <div className="text-[11px] font-mono text-slate-300 bg-dark-950/80 p-2 rounded border border-slate-800 space-y-1">
              <div className="flex justify-between">
                <span>Point 1: [{pickedScalePoints[0].map(n => n.toFixed(2)).join(', ')}]</span>
                <span className="text-emerald-400">Selected</span>
              </div>
              {pickedScalePoints.length > 1 && (
                <div className="flex justify-between">
                  <span>Point 2: [{pickedScalePoints[1].map(n => n.toFixed(2)).join(', ')}]</span>
                  <span className="text-emerald-400">Selected</span>
                </div>
              )}
            </div>
          )}

          {/* Input Known Real-World Distance */}
          {pickedScalePoints.length === 2 && (
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <label className="text-[11px] font-mono text-slate-300 block">
                Enter Known Real-World Distance (Meters):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="0.01"
                  value={knownDistanceInput}
                  onChange={(e) => setKnownDistanceInput(e.target.value)}
                  className="flex-1 bg-dark-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-white font-mono focus:border-brand-cyan outline-none"
                  placeholder="e.g. 10.0"
                />
                <button
                  onClick={handleApplyCalibration}
                  className="py-1.5 px-4 rounded bg-brand-cyan hover:bg-brand-cyan/80 text-dark-950 font-bold font-mono text-xs cursor-pointer transition-colors"
                >
                  Apply Scale
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scale Calibration Output Metrics */}
      {isCalibrated ? (
        <div className="space-y-2 text-xs font-mono bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/20">
          <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-emerald-500/20 pb-1.5">
            <span>✓ CALIBRATED</span>
            <span className="text-[10px] text-slate-400">Scale Conf: {(scaleConfidence * 100).toFixed(0)}%</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Scale</div>
              <div className="font-bold text-emerald-400 mt-0.5">{typeof scaleFactor === 'number' ? scaleFactor.toFixed(3) : scaleFactor} <span className="text-[9px] text-slate-400">m / unit</span></div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Ref Distance</div>
              <div className="font-bold text-slate-200 mt-0.5">
                {pickedScalePoints.length === 2 && knownDistanceInput ? `${parseFloat(knownDistanceInput).toFixed(3)} m` : 'User Pair'}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Model Dist</div>
              <div className="font-bold text-slate-200 mt-0.5">
                {pickedScalePoints.length === 2 ? `${Math.hypot(pickedScalePoints[1][0]-pickedScalePoints[0][0], pickedScalePoints[1][1]-pickedScalePoints[0][1], pickedScalePoints[1][2]-pickedScalePoints[0][2]).toFixed(3)} units` : 'Computed'}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-[11px] font-mono text-amber-400/90 bg-amber-500/10 p-2.5 rounded border border-amber-500/20 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <div>
            <div className="font-bold text-amber-400 uppercase text-[10px] tracking-wider mb-0.5">⚠ UNCALIBRATED</div>
            Raw model units active. Pick 2 points above to establish real-world meters scale.
          </div>
        </div>
      )}
    </div>
  );
}
