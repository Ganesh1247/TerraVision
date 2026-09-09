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
            <div className="text-[10px] uppercase font-bold text-brand-cyan flex items-center justify-between">
              <span className="flex items-center gap-1"><MoveVertical className="w-3 h-3" /> Height</span>
              {!isCalibrated && <span className="text-[9px] text-amber-400 font-normal">⚠ Uncalibrated</span>}
            </div>
            {isCalibrated ? (
              <>
                <div className="text-sm font-black text-emerald-400">
                  {height.meters} m {height.uncertainty_m !== null && <span className="text-[10px] text-slate-400 font-normal">±{height.uncertainty_m}m</span>}
                </div>
                <div className="text-[11px] text-slate-400">
                  {height.model_units} model units
                </div>
              </>
            ) : (
              <>
                <div className="text-sm font-black text-white">
                  {height.model_units} model units
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  ≈ — m
                </div>
              </>
            )}
          </div>

          {/* Width Card */}
          <div className="bg-dark-900 p-3 rounded-lg border border-slate-800 space-y-1">
            <div className="text-[10px] uppercase font-bold text-blue-400 flex items-center justify-between">
              <span className="flex items-center gap-1"><MoveHorizontal className="w-3 h-3" /> Width</span>
              {!isCalibrated && <span className="text-[9px] text-amber-400 font-normal">⚠ Uncalibrated</span>}
            </div>
            {isCalibrated ? (
              <>
                <div className="text-sm font-black text-emerald-400">
                  {width.meters} m {width.uncertainty_m !== null && <span className="text-[10px] text-slate-400 font-normal">±{width.uncertainty_m}m</span>}
                </div>
                <div className="text-[11px] text-slate-400">
                  {width.model_units} model units
                </div>
              </>
            ) : (
              <>
                <div className="text-sm font-black text-white">
                  {width.model_units} model units
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  ≈ — m
                </div>
              </>
            )}
          </div>

          {/* Depth Card */}
          <div className="bg-dark-900 p-3 rounded-lg border border-slate-800 space-y-1">
            <div className="text-[10px] uppercase font-bold text-purple-400 flex items-center justify-between">
              <span className="flex items-center gap-1"><Box className="w-3 h-3" /> Depth</span>
              {!isCalibrated && <span className="text-[9px] text-amber-400 font-normal">⚠ Uncalibrated</span>}
            </div>
            {isCalibrated ? (
              <>
                <div className="text-sm font-black text-emerald-400">
                  {depth.meters} m {depth.uncertainty_m !== null && <span className="text-[10px] text-slate-400 font-normal">±{depth.uncertainty_m}m</span>}
                </div>
                <div className="text-[11px] text-slate-400">
                  {depth.model_units} model units
                </div>
              </>
            ) : (
              <>
                <div className="text-sm font-black text-white">
                  {depth.model_units} model units
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  ≈ — m
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Surface Area & Volume Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono bg-dark-900/60 p-3 rounded-lg border border-slate-800">
        <div className="space-y-0.5">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Surface Area</div>
          {isCalibrated && areaVolume?.surfaceArea?.square_meters !== null ? (
            <>
              <div className="text-sm font-black text-emerald-400">
                {areaVolume.surfaceArea.square_meters} m² {areaVolume.surfaceArea.uncertainty_m2 !== null && <span className="text-[10px] text-slate-400 font-normal">±{areaVolume.surfaceArea.uncertainty_m2}m²</span>}
              </div>
              <div className="text-[11px] text-slate-400">
                {areaVolume?.surfaceArea?.model_units_sq ?? 0} model units²
              </div>
            </>
          ) : (
            <>
              <div className="text-sm font-black text-white">
                {areaVolume?.surfaceArea?.model_units_sq ?? 0} model units²
              </div>
              <div className="text-[11px] text-slate-500">
                ≈ — m²
              </div>
            </>
          )}
        </div>

        <div className="space-y-0.5">
          <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-between">
            <span>{areaVolume?.volume?.label || "Volume"}</span>
            {areaVolume?.volume?.source && (
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Source: {areaVolume.volume.source}
              </span>
            )}
          </div>

          {areaVolume?.volume?.value_m3 !== null && areaVolume?.volume?.value_m3 !== undefined ? (
            isCalibrated ? (
              <>
                <div className="text-sm font-black text-emerald-400">
                  {areaVolume.volume.value_m3} m³ {areaVolume.volume.uncertainty_m3 !== null && <span className="text-[10px] text-slate-400 font-normal">±{areaVolume.volume.uncertainty_m3}m³</span>}
                </div>
                <div className="text-[11px] text-slate-400">
                  {areaVolume.volume.model_units3} model units³
                </div>
              </>
            ) : (
              <>
                <div className="text-sm font-black text-white">
                  {areaVolume.volume.model_units3} model units³
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  ≈ — m³
                </div>
              </>
            )
          ) : areaVolume?.volume?.status === 'estimated_voxel' ? (
            isCalibrated ? (
              <>
                <div className="text-sm font-black text-amber-400">
                  ESTIMATED {areaVolume.volume.value_m3} m³
                </div>
                <div className="text-[10px] text-slate-400">
                  Method: {areaVolume.volume.method || 'voxel estimate'} ({areaVolume.volume.model_units3} units³)
                </div>
              </>
            ) : (
              <>
                <div className="text-sm font-black text-amber-300">
                  {areaVolume.volume.model_units3} model units³ (Voxel Est.)
                </div>
                <div className="text-[10px] text-slate-500">
                  ≈ — m³ (Method: voxel/occupancy estimate)
                </div>
              </>
            )
          ) : (
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-amber-400">
                Unavailable
              </div>
              <div className="text-[10px] text-slate-400 leading-tight">
                Reason: Mesh is not closed/watertight and no reliable volume estimate is available.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bounding Box Volume (strictly separated from mesh physical volume) */}
      <div className="text-[11px] font-mono text-slate-300 bg-dark-900/60 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
        <div>
          <div className="text-[10px] text-slate-400 uppercase font-semibold">BOUNDING BOX VOLUME (EXTENT ENVELOPE)</div>
          <div className="text-slate-200">
            Width × Height × Depth = <strong className="text-white">{areaVolume?.boundingVolume?.model_units_cu ?? 0} model units³</strong>
          </div>
        </div>
        {areaVolume?.boundingVolume?.cubic_meters !== null && (
          <div className="text-right">
            <div className="text-emerald-400 font-bold text-xs">{areaVolume.boundingVolume.cubic_meters} m³</div>
            <div className="text-[9px] text-slate-500">(Extent only)</div>
          </div>
        )}
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
