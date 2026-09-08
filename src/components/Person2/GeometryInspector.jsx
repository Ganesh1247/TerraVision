import React from 'react';
import { Box, Layers, Cpu, Maximize2, MoveHorizontal, MoveVertical, Globe, CheckCircle2, AlertCircle } from 'lucide-react';

export default function GeometryInspector({
  inspection,
  heightWidthDepth,
  areaVolume,
  scaleFactor,
  axisOrientation
}) {
  const isCalibrated = scaleFactor !== null && scaleFactor > 0;

  const { height, width, depth, dimensions } = heightWidthDepth;

  return (
    <div className="bg-dark-950/90 border border-slate-800 rounded-xl p-4 space-y-4 shadow-xl">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Box className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">3D Model Geometry Inspector</h3>
            <p className="text-[11px] text-slate-400">Vertex positions, faces, bounding box & spatial extent</p>
          </div>
        </div>
      </div>

      {/* Primary Statistics Grid */}
      <div className="grid grid-cols-3 gap-2 text-xs font-mono">
        <div className="bg-dark-900/90 p-2.5 rounded-lg border border-slate-800 text-center">
          <div className="text-[10px] text-slate-400 uppercase">Meshes</div>
          <div className="text-base font-black text-brand-cyan mt-0.5">{inspection.meshCount}</div>
        </div>
        <div className="bg-dark-900/90 p-2.5 rounded-lg border border-slate-800 text-center">
          <div className="text-[10px] text-slate-400 uppercase">Vertices</div>
          <div className="text-base font-black text-emerald-400 mt-0.5">{inspection.totalVertices.toLocaleString()}</div>
        </div>
        <div className="bg-dark-900/90 p-2.5 rounded-lg border border-slate-800 text-center">
          <div className="text-[10px] text-slate-400 uppercase">Triangles</div>
          <div className="text-base font-black text-amber-400 mt-0.5">{inspection.totalTriangles.toLocaleString()}</div>
        </div>
      </div>

      {/* Axis-Based Automatic Dimension Output (Height, Width, Depth) */}
      <div className="space-y-2 font-mono text-xs">
        <div className="flex justify-between items-center text-slate-300">
          <span className="font-semibold text-white flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-brand-cyan" />
            Automatic Extent Calculations
          </span>
          <span className="text-[10px] text-brand-cyan bg-brand-cyan/10 px-1.5 py-0.5 rounded border border-brand-cyan/20">
            Axis: {axisOrientation}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Height Card */}
          <div className="bg-dark-900 p-3 rounded-lg border border-slate-800 space-y-1">
            <div className="text-[10px] uppercase font-bold text-brand-cyan flex items-center gap-1">
              <MoveVertical className="w-3 h-3" /> Height
            </div>
            <div className="text-slate-300">
              Model Units: <strong className="text-white">{height.model_units}</strong>
            </div>
            <div className="text-slate-300">
              Meters:{' '}
              {height.meters !== null ? (
                <strong className="text-emerald-400">{height.meters} m</strong>
              ) : (
                <span className="text-amber-400 text-[10px]">null (uncalibrated)</span>
              )}
            </div>
            {height.confidence && (
              <div className="text-[9px] text-slate-400 pt-0.5">Conf: {(height.confidence * 100).toFixed(0)}%</div>
            )}
          </div>

          {/* Width Card */}
          <div className="bg-dark-900 p-3 rounded-lg border border-slate-800 space-y-1">
            <div className="text-[10px] uppercase font-bold text-blue-400 flex items-center gap-1">
              <MoveHorizontal className="w-3 h-3" /> Width
            </div>
            <div className="text-slate-300">
              Model Units: <strong className="text-white">{width.model_units}</strong>
            </div>
            <div className="text-slate-300">
              Meters:{' '}
              {width.meters !== null ? (
                <strong className="text-emerald-400">{width.meters} m</strong>
              ) : (
                <span className="text-amber-400 text-[10px]">null (uncalibrated)</span>
              )}
            </div>
          </div>

          {/* Depth Card */}
          <div className="bg-dark-900 p-3 rounded-lg border border-slate-800 space-y-1">
            <div className="text-[10px] uppercase font-bold text-purple-400 flex items-center gap-1">
              <Box className="w-3 h-3" /> Depth
            </div>
            <div className="text-slate-300">
              Model Units: <strong className="text-white">{depth.model_units}</strong>
            </div>
            <div className="text-slate-300">
              Meters:{' '}
              {depth.meters !== null ? (
                <strong className="text-emerald-400">{depth.meters} m</strong>
              ) : (
                <span className="text-amber-400 text-[10px]">null (uncalibrated)</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Surface Area & Bounding Volume */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-dark-900/60 p-3 rounded-lg border border-slate-800">
        <div>
          <div className="text-[10px] text-slate-400">Total Mesh Surface Area:</div>
          <div className="text-slate-200 font-bold">
            {areaVolume?.surfaceArea?.model_units_sq ?? 0} <span className="text-[10px] text-slate-400 font-normal">units²</span>
          </div>
          {areaVolume?.surfaceArea?.square_meters !== null && areaVolume?.surfaceArea?.square_meters !== undefined && (
            <div className="text-emerald-400 font-bold text-[11px]">
              {areaVolume.surfaceArea.square_meters} m²
            </div>
          )}
        </div>
        <div>
          <div className="text-[10px] text-slate-400">Bounding Box Volume:</div>
          <div className="text-slate-200 font-bold">
            {areaVolume?.boundingVolume?.model_units_cu ?? 0} <span className="text-[10px] text-slate-400 font-normal">units³</span>
          </div>
          {areaVolume?.boundingVolume?.cubic_meters !== null && areaVolume?.boundingVolume?.cubic_meters !== undefined && (
            <div className="text-emerald-400 font-bold text-[11px]">
              {areaVolume.boundingVolume.cubic_meters} m³
            </div>
          )}
        </div>
      </div>

      {/* Bounding Box Min/Max Coordinates */}
      <div className="text-[11px] font-mono text-slate-400 bg-dark-950 p-2.5 rounded border border-slate-800 space-y-1">
        <div className="flex justify-between text-slate-300 font-semibold">
          <span>Bounding Box Spatial Limits:</span>
          <span>Sphere R: {inspection.boundingBox.boundingSphereRadius.toFixed(2)}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div>Min XYZ: [{inspection.boundingBox.min.map(n => n.toFixed(2)).join(', ')}]</div>
          <div>Max XYZ: [{inspection.boundingBox.max.map(n => n.toFixed(2)).join(', ')}]</div>
        </div>
      </div>
    </div>
  );
}
