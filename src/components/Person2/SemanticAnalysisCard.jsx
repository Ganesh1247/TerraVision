import React from 'react';
import { Layers, Target, ShieldCheck, Tag, Sparkles } from 'lucide-react';

export default function SemanticAnalysisCard({
  semanticObjects,
  confidenceMatrix,
  scaleFactor
}) {
  const isCalibrated = scaleFactor !== null && scaleFactor > 0;

  return (
    <div className="bg-dark-950/90 border border-slate-800 rounded-xl p-4 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Semantic Object Analysis & Confidence
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {semanticObjects.length} Detected
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
              {(confidenceMatrix.overall_confidence * 100).toFixed(0)}% OVERALL
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-dark-950 p-2 rounded border border-slate-800">
              <div className="text-slate-400">Geometric Precision:</div>
              <div className="text-emerald-400 font-bold">{(confidenceMatrix.geometric_precision * 100).toFixed(0)}%</div>
            </div>
            <div className="bg-dark-950 p-2 rounded border border-slate-800">
              <div className="text-slate-400">Scale Calibration:</div>
              <div className="text-brand-cyan font-bold">{(confidenceMatrix.scale_calibration_confidence * 100).toFixed(0)}%</div>
            </div>
            <div className="bg-dark-950 p-2 rounded border border-slate-800">
              <div className="text-slate-400">Measurement Precision:</div>
              <div className="text-amber-400 font-bold">{(confidenceMatrix.measurement_precision * 100).toFixed(0)}%</div>
            </div>
            <div className="bg-dark-950 p-2 rounded border border-slate-800">
              <div className="text-slate-400">Semantic Detection:</div>
              <div className="text-blue-400 font-bold">{(confidenceMatrix.semantic_detection_confidence * 100).toFixed(0)}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Semantic Objects List */}
      <div className="space-y-2">
        <div className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
          Classified Objects & Structures
        </div>

        {semanticObjects.length === 0 ? (
          <div className="text-xs font-mono text-slate-500 text-center py-4 bg-dark-900/50 rounded-lg border border-dashed border-slate-800">
            No objects detected in current scene geometry.
          </div>
        ) : (
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {semanticObjects.map((obj, idx) => (
              <div
                key={obj.meshId || idx}
                className="bg-dark-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1 font-mono text-xs hover:border-slate-700 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    {obj.name}
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {(obj.confidence * 100).toFixed(0)}% Conf
                  </span>
                </div>

                <div className="text-[11px] text-brand-cyan font-semibold">
                  Category: {obj.category}
                </div>

                <div className="text-[10px] text-slate-400 flex items-center gap-3">
                  {obj.boundingDimensionsUnits && (
                    <span>
                      Extent Units: {obj.boundingDimensionsUnits.width} × {obj.boundingDimensionsUnits.height} × {obj.boundingDimensionsUnits.depth}
                    </span>
                  )}
                  {obj.boundingDimensionsMeters && (
                    <span className="text-emerald-400">
                      Meters: {obj.boundingDimensionsMeters.width}m × {obj.boundingDimensionsMeters.height}m × {obj.boundingDimensionsMeters.depth}m
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
