import React, { useState } from 'react';
import { Ruler, Plus, Trash2, Crosshair, Check, ShieldCheck, Tag } from 'lucide-react';

export default function MeasurementPanel({
  measurements,
  onAddMeasurement,
  onRemoveMeasurement,
  isPickingMeasurePoints,
  setIsPickingMeasurePoints,
  pickedMeasurePoints,
  onClearPickedPoints,
  scaleFactor
}) {
  const [customLabel, setCustomLabel] = useState('');

  const isCalibrated = scaleFactor !== null && scaleFactor > 0;

  const handleSavePickedMeasurement = () => {
    if (pickedMeasurePoints.length < 2) return;
    const label = customLabel.trim() || `Distance #${measurements.length + 1}`;
    onAddMeasurement(pickedMeasurePoints[0], pickedMeasurePoints[1], label);
    setCustomLabel('');
    onClearPickedPoints();
    setIsPickingMeasurePoints(false);
  };

  return (
    <div className="bg-dark-950/90 border border-slate-800 rounded-xl p-4 space-y-4 shadow-xl">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Ruler className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Point-to-Point 3D Distance Engine
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
                {measurements.length} Saved
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Euclidean 3D distance calculation (dx² + dy² + dz²)^½</p>
          </div>
        </div>
      </div>

      {/* Point Selection Mode Toggle Button */}
      <div className="space-y-2">
        <button
          onClick={() => setIsPickingMeasurePoints(!isPickingMeasurePoints)}
          className={`w-full py-2.5 px-3 rounded-lg text-xs font-mono font-bold transition-all border flex items-center justify-center gap-2 cursor-pointer ${
            isPickingMeasurePoints
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 animate-pulse'
              : 'bg-dark-900 text-brand-cyan border-brand-cyan/40 hover:bg-brand-cyan/10'
          }`}
        >
          <Crosshair className="w-4 h-4" />
          {isPickingMeasurePoints
            ? `Click 2 Points in 3D Viewer (${pickedMeasurePoints.length}/2 Picked)`
            : '+ Pick 2 Points for Point-to-Point Measurement'}
        </button>

        {/* Live picked points status */}
        {pickedMeasurePoints.length > 0 && (
          <div className="bg-dark-900 p-3 rounded-lg border border-slate-800 space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-[11px] font-semibold text-brand-cyan">Active 3D Pins:</span>
              <button
                onClick={onClearPickedPoints}
                className="text-[10px] text-red-400 hover:underline cursor-pointer"
              >
                Clear Pins
              </button>
            </div>

            <div className="space-y-1 text-[11px] text-slate-400">
              <div>Point A: [{pickedMeasurePoints[0].map(n => n.toFixed(2)).join(', ')}]</div>
              {pickedMeasurePoints.length > 1 && (
                <div>Point B: [{pickedMeasurePoints[1].map(n => n.toFixed(2)).join(', ')}]</div>
              )}
            </div>

            {pickedMeasurePoints.length === 2 && (
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                    placeholder="Measurement Label (e.g. Transformer Span)"
                    className="flex-1 bg-dark-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-white outline-none focus:border-brand-cyan"
                  />
                  <button
                    onClick={handleSavePickedMeasurement}
                    className="py-1 px-3 bg-emerald-500 hover:bg-emerald-400 text-dark-950 font-bold rounded text-xs cursor-pointer transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Measurement List Table */}
      <div className="space-y-2">
        <div className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
          Saved 3D Measurements
        </div>

        {measurements.length === 0 ? (
          <div className="text-xs font-mono text-slate-500 text-center py-4 bg-dark-900/50 rounded-lg border border-dashed border-slate-800">
            No measurements recorded yet. Click above to pick points in 3D viewer.
          </div>
        ) : (
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {measurements.map((m) => (
              <div
                key={m.id}
                className="bg-dark-900/80 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs font-mono hover:border-slate-700 transition-colors"
              >
                <div className="space-y-0.5 min-w-0 pr-2">
                  <div className="font-bold text-white truncate flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-brand-cyan" />
                    {m.label}
                  </div>
                  <div className="text-slate-400 text-[11px] flex items-center gap-3">
                    {m.distance_m !== null ? (
                      <>
                        <span className="text-emerald-400 font-bold">
                          {m.distance_m} m {m.uncertainty_m !== null && <span className="text-[10px] text-slate-400 font-normal">±{m.uncertainty_m}m</span>}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ({m.distance_model_units} model units)
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-slate-200 font-bold">
                          {m.distance_model_units} model units
                        </span>
                        <span className="text-amber-400/80 text-[10px]">≈ — m</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                    {(m.confidence * 100).toFixed(0)}% Conf
                  </span>
                  <button
                    onClick={() => onRemoveMeasurement(m.id)}
                    className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 cursor-pointer transition-colors"
                    title="Remove Measurement"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
