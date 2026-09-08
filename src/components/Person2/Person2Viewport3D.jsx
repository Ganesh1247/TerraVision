import React, { useRef, Component } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import Scene3D from '../Viewer3D/Scene3D';
import { Target, Crosshair, Scale, Ruler, RefreshCw, Maximize2, AlertTriangle } from 'lucide-react';

/**
 * Robust React Error Boundary for 3D WebGL Canvas
 */
class CanvasErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorInfo: error.message };
  }

  componentDidCatch(error, errorInfo) {
    console.error("3D Viewport Canvas Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-dark-950 p-6 text-center space-y-3 font-mono">
          <AlertTriangle className="w-8 h-8 text-amber-400 animate-bounce" />
          <div className="text-sm font-bold text-white">3D Viewport Renderer Encountered Context Error</div>
          <p className="text-xs text-slate-400 max-w-md">
            {this.state.errorInfo || 'WebGL context or 3D geometry buffer failed to initialize.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, errorInfo: null })}
            className="py-1.5 px-4 rounded bg-brand-cyan text-dark-950 font-bold text-xs cursor-pointer hover:bg-brand-cyan/80 transition-colors"
          >
            Reload 3D Canvas
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Main 3D Viewport for Person 2 Engine
 */
export default function Person2Viewport3D({
  customModelGroup,
  selectedDataset,
  renderMode,
  isPickingScalePoints,
  pickedScalePoints,
  onPickScalePoint,
  isPickingMeasurePoints,
  pickedMeasurePoints,
  onPickMeasurePoint,
  measurements,
  scaleFactor,
  axisOrientation
}) {
  const controlsRef = useRef();

  const isPicking = isPickingScalePoints || isPickingMeasurePoints;

  const handlePointPick = (point) => {
    if (isPickingScalePoints) {
      onPickScalePoint(point);
    } else if (isPickingMeasurePoints) {
      onPickMeasurePoint(point);
    }
  };

  return (
    <div className="relative w-full h-[500px] lg:h-[560px] bg-dark-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col select-none">
      {/* Viewport Header Overlay */}
      <div className="absolute top-3 left-4 z-20 flex items-center gap-3 text-xs font-mono bg-dark-950/90 backdrop-blur-md px-3.5 py-2 rounded-lg border border-slate-800 text-slate-300">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-cyan animate-pulse" />
          <span className="font-bold text-white uppercase">Person 2 Inspection Viewport</span>
        </div>
        <span className="text-slate-600">|</span>
        <span className="text-slate-400">
          Axis: <strong className="text-brand-cyan">{axisOrientation}</strong>
        </span>
        <span className="text-slate-600">|</span>
        <span className="text-slate-400">
          Scale:{' '}
          {scaleFactor ? (
            <strong className="text-emerald-400">{scaleFactor} m/unit</strong>
          ) : (
            <strong className="text-amber-400">Uncalibrated</strong>
          )}
        </span>
      </div>

      {/* Point Picking Mode Alert Badge */}
      {isPicking && (
        <div className="absolute top-3 right-4 z-20 bg-emerald-500/90 text-dark-950 backdrop-blur-md px-3.5 py-1.5 rounded-lg text-xs font-mono font-black flex items-center gap-2 shadow-lg animate-pulse">
          <Crosshair className="w-4 h-4" />
          {isPickingScalePoints ? 'POINT PICKING: SCALE CALIBRATION' : 'POINT PICKING: MEASUREMENT'}
        </div>
      )}

      {/* Canvas */}
      <div className="relative flex-1 w-full h-full cursor-crosshair">
        <CanvasErrorBoundary>
          <Canvas
            shadows
            camera={{ position: [6.5, 5.2, 6.5], fov: 44 }}
            gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
          >
            <color attach="background" args={['#06080C']} />
            <ambientLight intensity={0.8} />
            <directionalLight position={[10, 15, 8]} intensity={1.4} castShadow />
            <directionalLight position={[-8, 10, -8]} intensity={0.4} color="#22D3EE" />

            {/* Metric Grid Helper */}
            <gridHelper args={[16, 32, '#22D3EE', '#1E293B']} position={[0, -0.01, 0]} />

            {/* Interactive Raycast Event Handler Group */}
            <group
              onClick={(e) => {
                if (isPicking && e.point) {
                  e.stopPropagation();
                  handlePointPick([e.point.x, e.point.y, e.point.z]);
                }
              }}
            >
              {/* Render uploaded custom model if present, otherwise render current scene */}
              {customModelGroup ? (
                <primitive object={customModelGroup} />
              ) : (
                <Scene3D
                  renderMode={renderMode || 'textured'}
                  selectedDataset={selectedDataset}
                  showTrajectory={false}
                />
              )}
            </group>

            {/* Render Active Picked Scale Points */}
            {pickedScalePoints.map((pt, idx) => (
              <group key={`scale_pt_${idx}`} position={pt}>
                <mesh>
                  <sphereGeometry args={[0.12, 16, 16]} />
                  <meshStandardMaterial color="#F59E0B" emissive="#F59E0B" emissiveIntensity={1} />
                </mesh>
                <Html distanceFactor={10}>
                  <div className="bg-amber-500 text-dark-950 text-[10px] font-mono font-black px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                    Scale Pt #{idx + 1}
                  </div>
                </Html>
              </group>
            ))}

            {/* Scale Line connecting picked scale points */}
            {pickedScalePoints.length === 2 && (
              <Line
                points={pickedScalePoints}
                color="#F59E0B"
                lineWidth={3}
              />
            )}

            {/* Render Picked Measure Points */}
            {pickedMeasurePoints.map((pt, idx) => (
              <group key={`meas_pt_${idx}`} position={pt}>
                <mesh>
                  <sphereGeometry args={[0.12, 16, 16]} />
                  <meshStandardMaterial color="#22D3EE" emissive="#22D3EE" emissiveIntensity={1} />
                </mesh>
                <Html distanceFactor={10}>
                  <div className="bg-brand-cyan text-dark-950 text-[10px] font-mono font-black px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                    Pin #{idx + 1}
                  </div>
                </Html>
              </group>
            ))}

            {/* Active Measurement Draft Line */}
            {pickedMeasurePoints.length === 2 && (
              <Line
                points={pickedMeasurePoints}
                color="#22D3EE"
                lineWidth={3}
              />
            )}

            {/* Render Saved Measurements Lines and 3D Floating Badges */}
            {measurements.map((m) => {
              const p1 = new THREE.Vector3(...m.point_a);
              const p2 = new THREE.Vector3(...m.point_b);
              const mid = p1.clone().add(p2).multiplyScalar(0.5);

              return (
                <group key={m.id}>
                  {/* Endpoint Markers */}
                  <mesh position={m.point_a}>
                    <sphereGeometry args={[0.08, 12, 12]} />
                    <meshStandardMaterial color="#10B981" />
                  </mesh>
                  <mesh position={m.point_b}>
                    <sphereGeometry args={[0.08, 12, 12]} />
                    <meshStandardMaterial color="#10B981" />
                  </mesh>

                  {/* Connecting Line */}
                  <Line
                    points={[m.point_a, m.point_b]}
                    color="#10B981"
                    lineWidth={2}
                  />

                  {/* 3D Floating Measurement Callout Tag */}
                  <Html position={[mid.x, mid.y + 0.25, mid.z]} distanceFactor={12}>
                    <div className="bg-dark-950/90 backdrop-blur-md border border-emerald-500/50 text-white px-2 py-1 rounded text-[10px] font-mono shadow-xl flex flex-col items-center whitespace-nowrap">
                      <span className="text-emerald-400 font-bold">{m.label}</span>
                      <span className="text-xs font-black text-white">
                        {m.distance_m !== null ? `${m.distance_m} m` : `${m.distance_model_units} units`}
                      </span>
                    </div>
                  </Html>
                </group>
              );
            })}

            <OrbitControls ref={controlsRef} makeDefault enableDamping dampingFactor={0.06} />
          </Canvas>
        </CanvasErrorBoundary>

        {/* Viewport Controls Instructions */}
        <div className="absolute bottom-3 left-4 z-10 text-[11px] font-mono text-slate-400 bg-dark-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 pointer-events-none flex items-center gap-3">
          <span>Rotate: Left Click + Drag</span>
          <span className="text-slate-600">|</span>
          <span>Pan: Right Click + Drag</span>
          <span className="text-slate-600">|</span>
          <span>Zoom: Scroll</span>
        </div>
      </div>
    </div>
  );
}
