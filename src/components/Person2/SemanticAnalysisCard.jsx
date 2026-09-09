import React from 'react';
import { Layers, Target, ShieldCheck, Tag, Sparkles, AlertCircle } from 'lucide-react';

export default function SemanticAnalysisCard({
  semanticObjects = [],
  confidenceMatrix = {},
  scaleFactor = null
}) {
  const isCalibrated = scaleFactor !== null && scaleFactor > 0;

  const objectsList = Array.isArray(semanticObjects) ? semanticObjects : (semanticObjects?.objects || []);
  const isDetectorAvailable = Array.isArray(semanticObjects) ? (semanticObjects.length > 0) : Boolean(semanticObjects?.detector_available);
  const detectorName = (!Array.isArray(semanticObjects) && semanticObjects?.detector) ? semanticObjects.detector : "Offline YOLO";

  // Safe percentage formatter (always returns a finite 'X%' string)
  const formatPct = (pctVal, decVal) => {
    if (typeof pctVal === 'number' && !isNaN(pctVal) && isFinite(pctVal)) {
      return `${Math.round(pctVal)}%`;
    }
    if (typeof decVal === 'number' && !isNaN(decVal) && isFinite(decVal)) {
      return `${Math.round(decVal * 100)}%`;
    }
    return '0%';
  };

  const overallStr = formatPct(confidenceMatrix?.overall, confidenceMatrix?.overall_confidence);
  const geomStr = formatPct(confidenceMatrix?.geometry, confidenceMatrix?.geometric_precision);
  const scaleStr = formatPct(confidenceMatrix?.scale, confidenceMatrix?.scale_calibration_confidence);
  const measStr = formatPct(confidenceMatrix?.measurement, confidenceMatrix?.measurement_precision);
  const semStr = formatPct(confidenceMatrix?.semantic, confidenceMatrix?.semantic_detection_confidence);

  return (
    <div className="bg-dark-950/90 border border-slate-800 rounded-xl p-4 space-y-4 shadow-xl select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Semantic Object Analysis & Confidence
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                {objectsList.length} Detected
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Offline spatial heuristics & multi-dimensional confidence matrix</p>
          </div>
        </div>
      </div>

      {/* Multi-Dimensional Confidence Matrix Overview */}
      {confidenceMatrix && (
        <div className="bg-dark-900/90 p-3 rounded-lg border border-slate-800 space-y-2 font-mono text-xs">
          <div className="flex justify-between items-center text-slate-300">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
              Multi-Dimensional Uncertainty Score
            </span>
            <span className="text-sm font-black text-brand-cyan">
              {overallStr} OVERALL
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-dark-950 p-2 rounded border border-slate-800">
              <div className="text-slate-400">Geometric Precision:</div>
              <div className="text-emerald-400 font-bold">{geomStr}</div>
            </div>
            <div className="bg-dark-950 p-2 rounded border border-slate-800">
              <div className="text-slate-400">Scale Calibration:</div>
              <div className="text-brand-cyan font-bold">{scaleStr}</div>
            </div>
            <div className="bg-dark-950 p-2 rounded border border-slate-800">
              <div className="text-slate-400">Measurement Precision:</div>
              <div className="text-amber-400 font-bold">{measStr}</div>
            </div>
            <div className="bg-dark-950 p-2 rounded border border-slate-800">
              <div className="text-slate-400">Semantic Detection:</div>
              <div className="text-blue-400 font-bold">{semStr}</div>
            </div>
          </div>
        </div>
      )}

      {/* Semantic Objects List */}
      <div className="space-y-2">
        <div className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Classified Objects & Structures</span>
          {isDetectorAvailable && (
            <span className="text-[10px] text-emerald-400 font-normal">Source: {detectorName}</span>
          )}
        </div>

        {!isDetectorAvailable || objectsList.length === 0 ? (
          <div className="text-xs font-mono text-slate-400 text-center py-4 bg-dark-900/50 rounded-lg border border-dashed border-slate-800 space-y-1">
            <div className="text-amber-400 font-semibold flex items-center justify-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              Offline semantic detector unavailable
            </div>
            <div className="text-[11px] text-slate-500">
              No local model weights found in /public/models/semantic/. Detector disabled in 100% offline mode.
            </div>
          </div>
        ) : (
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {objectsList.map((obj, idx) => (
              <div
                key={obj.id || idx}
                className="bg-dark-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1 font-mono text-xs hover:border-slate-700 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    {obj.class || obj.name}
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {formatPct(null, obj.confidence)} Conf {obj.views_detected && `(${obj.views_detected}/6 views)`}
                  </span>
                </div>

                <div className="text-[11px] text-brand-cyan font-semibold">
                  Source: {obj.source || "offline_yolo"}
                </div>

                {obj.world_position && (
                  <div className="text-[10px] text-slate-400">
                    3D Pos: [{obj.world_position.x?.toFixed(2)}, {obj.world_position.y?.toFixed(2)}, {obj.world_position.z?.toFixed(2)}]
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
