import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Person2Engine } from '../../engine/person2Engine';
import { loadModelFromFile } from '../../engine/modelLoaders';
import Person2Viewport3D from './Person2Viewport3D';
import ScaleCalibrationCard from './ScaleCalibrationCard';
import MeasurementPanel from './MeasurementPanel';
import GeometryInspector from './GeometryInspector';
import SemanticAnalysisCard from './SemanticAnalysisCard';
import ReferenceVideoPanel from './ReferenceVideoPanel';
import JsonOutputModal from './JsonOutputModal';
import Scene3D from '../Viewer3D/Scene3D';
import { 
  FileCode, 
  Upload, 
  Sparkles, 
  Box, 
  Scale, 
  Ruler, 
  Tag, 
  Download, 
  RefreshCw, 
  ShieldCheck,
  CheckCircle2,
  FileJson
} from 'lucide-react';

function Person2AnalysisStudio({ selectedDataset, renderMode }) {
  const engineRef = useRef(new Person2Engine());
  const engine = engineRef.current;

  // Custom uploaded 3D model state
  const [customModelGroup, setCustomModelGroup] = useState(null);
  const [customModelName, setCustomModelName] = useState(null);
  const [isUploadingModel, setIsUploadingModel] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Engine state triggers
  const [axisOrientation, setAxisOrientation] = useState('Y-up');
  const [scaleFactor, setScaleFactor] = useState(null);
  const [scaleConfidence, setScaleConfidence] = useState(0);
  const [scaleResidual, setScaleResidual] = useState(0);
  const [referenceCount, setReferenceCount] = useState(0);

  // Point picking state
  const [isPickingScalePoints, setIsPickingScalePoints] = useState(false);
  const [pickedScalePoints, setPickedScalePoints] = useState([]);

  const [isPickingMeasurePoints, setIsPickingMeasurePoints] = useState(false);
  const [pickedMeasurePoints, setPickedMeasurePoints] = useState([]);

  // Stored measurements
  const [measurements, setMeasurements] = useState([]);

  // Inspection & JSON Modal
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [jsonResult, setJsonResult] = useState(null);

  // Re-sync engine axis orientation
  useEffect(() => {
    engine.setAxisOrientation(axisOrientation);
  }, [axisOrientation, engine]);

  const [referenceImageFile, setReferenceImageFile] = useState(null);

  // Handle custom model file drop or selection
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingModel(true);
    setUploadError(null);

    try {
      const group = await loadModelFromFile(file);
      setCustomModelGroup(group);
      setCustomModelName(file.name);
      if (file.type.startsWith('image/') || file.name.match(/\.(png|jpg|jpeg|webp|bmp)$/i)) {
        setReferenceImageFile(file);
      }
      setIsUploadingModel(false);
    } catch (err) {
      setUploadError(err.message);
      setIsUploadingModel(false);
    }
  };

  // Calibration handlers
  const handleCalibrateFromUserRef = (pointA, pointB, knownMeters) => {
    try {
      const res = engine.calibrateScaleFromUserReference(pointA, pointB, knownMeters);
      setScaleFactor(res.scaleFactor);
      setScaleConfidence(res.scaleConfidence);
      setScaleResidual(res.scaleResidual);
      setReferenceCount(res.referenceCount);
      setPickedScalePoints([]);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleResetCalibration = () => {
    engine.scaleFactor = null;
    engine.scaleConfidence = 0;
    engine.scaleResidual = 0;
    engine.referencePairs = [];
    setScaleFactor(null);
    setScaleConfidence(0);
    setScaleResidual(0);
    setReferenceCount(0);
  };

  // Point picking callbacks
  const handlePickScalePoint = (pt) => {
    if (pickedScalePoints.length < 2) {
      setPickedScalePoints(prev => [...prev, pt]);
    }
  };

  const handlePickMeasurePoint = (pt) => {
    if (pickedMeasurePoints.length < 2) {
      setPickedMeasurePoints(prev => [...prev, pt]);
    }
  };

  // Measurements handlers
  const handleAddMeasurement = (pointA, pointB, label) => {
    const record = engine.calculateDistance(pointA, pointB, label);
    setMeasurements(prev => [...prev, record]);
  };

  const handleRemoveMeasurement = (id) => {
    setMeasurements(prev => prev.filter(m => m.id !== id));
  };

  // Inspection computation based on current model/scene
  const inspectionData = useMemo(() => {
    const targetObj = customModelGroup || null;
    return engine.inspectGeometry(targetObj);
  }, [customModelGroup, axisOrientation, scaleFactor, engine]);

  const heightWidthDepthData = useMemo(() => {
    const targetObj = customModelGroup || null;
    return engine.calculateHeightWidthDepth(targetObj);
  }, [customModelGroup, axisOrientation, scaleFactor, engine]);

  const areaVolumeData = useMemo(() => {
    const targetObj = customModelGroup || null;
    return engine.calculateAreaAndVolume(targetObj);
  }, [customModelGroup, scaleFactor, engine]);

  const semanticObjectsData = useMemo(() => {
    const targetObj = customModelGroup || null;
    return engine.performSemanticObjectAnalysis(targetObj);
  }, [customModelGroup, scaleFactor, engine]);

  const confidenceMatrixData = useMemo(() => {
    return engine.computeExplainableConfidence(
      inspectionData,
      measurements,
      areaVolumeData,
      { confidence: 0.90 },
      semanticObjectsData
    );
  }, [inspectionData, measurements, areaVolumeData, semanticObjectsData, scaleFactor, engine]);

  // Generate full JSON analysis result payload
  const handleGenerateJsonReport = () => {
    const targetObj = customModelGroup || null;
    const report = engine.generateAnalysisJsonResult(targetObj, measurements);
    setJsonResult(report);
    setIsJsonModalOpen(true);
  };

  const isDemoMode = useMemo(() => {
    if (referenceImageFile) return true;
    if (customModelName && customModelName.match(/\.(png|jpg|jpeg|webp|bmp)$/i)) return true;
    if (customModelGroup?.userData?.isDemoPlaceholder) return true;
    return false;
  }, [referenceImageFile, customModelName, customModelGroup]);

  return (
    <div className="space-y-5 select-none">
      {/* Active Mode Banner */}
      <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono ${
        isDemoMode 
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' 
          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg shrink-0 ${isDemoMode ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              MODE: {isDemoMode ? 'DEMO / PLACEHOLDER GEOMETRY' : 'REAL 3D MODEL MODE'}
              {isDemoMode && (
                <span className="px-2 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  PLACEHOLDER GEOMETRY ACTIVE
                </span>
              )}
            </div>
            <p className="text-[11px] opacity-90 mt-0.5">
              {isDemoMode 
                ? 'Current input is a reference image. Person 1 reconstructs real 3D meshes later. Demonstration values are computed on synthetic placeholder geometry.'
                : 'Loaded actual 3D model geometry. Computing real bounding dimensions, surface area, and watertight volume directly from mesh vertices.'}
            </p>
          </div>
        </div>
      </div>

      {/* Dedicated Section: 3D Image & Model Offline Input */}
      <div className="bg-dark-950/90 border border-brand-cyan/30 rounded-xl p-4 sm:p-5 space-y-4 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/30">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                Offline 3D Model & Image Input Channel
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  100% Offline Engine
                </span>
              </h3>
              <p className="text-xs text-slate-400">Input 3D models (.glb, .gltf, .obj, .ply, .stl) or reference image keyframes for instant metric analysis</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateJsonReport}
              className="py-2 px-4 rounded-lg bg-brand-cyan hover:bg-brand-cyan/80 text-dark-950 font-mono text-xs font-black cursor-pointer transition-colors flex items-center gap-2 shadow-lg shadow-brand-cyan/20"
            >
              <FileJson className="w-4 h-4" />
              Export JSON Result
            </button>
          </div>
        </div>

        {/* Input Dropzone Card */}
        <label className="flex flex-col sm:flex-row items-center justify-between p-4 border-2 border-dashed border-slate-700 hover:border-brand-cyan/60 rounded-xl cursor-pointer bg-dark-900/60 hover:bg-dark-900 transition-all gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-brand-cyan/10 text-brand-cyan shrink-0">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-mono text-white font-bold">
                {isUploadingModel
                  ? 'Parsing & Extracting 3D Geometry...'
                  : customModelName
                  ? `Active Input: ${customModelName} (${isDemoMode ? 'DEMO MODE' : 'REAL 3D MODEL'})`
                  : 'Click or Drag & Drop 3D Model / Image File Here'}
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Supports .glb, .gltf, .obj, .ply, .stl 3D mesh files & .png, .jpg reference keyframes
              </p>
            </div>
          </div>

          <span className="py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold shrink-0">
            Browse Files
          </span>

          <input
            type="file"
            accept=".glb,.gltf,.obj,.ply,.stl,image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        {/* Instant Automated Metrics & Confidence Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono bg-dark-900/80 p-3 rounded-lg border border-slate-800">
          <div>
            <div className="text-[10px] text-slate-400 uppercase">{isDemoMode ? 'DEMO HEIGHT' : 'HEIGHT'}</div>
            <div className="text-sm font-black text-brand-cyan mt-0.5">
              {heightWidthDepthData.height.meters !== null ? `${heightWidthDepthData.height.meters} m` : `${heightWidthDepthData.height.model_units} units`}
            </div>
            <div className="text-[9px] text-slate-500">Axis: {axisOrientation}</div>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 uppercase">{isDemoMode ? 'DEMO WIDTH × DEPTH' : 'WIDTH × DEPTH'}</div>
            <div className="text-sm font-black text-emerald-400 mt-0.5">
              {heightWidthDepthData.width.meters !== null ? `${heightWidthDepthData.width.meters}m × ${heightWidthDepthData.depth.meters}m` : `${heightWidthDepthData.width.model_units} × ${heightWidthDepthData.depth.model_units} units`}
            </div>
            <div className="text-[9px] text-slate-500">{inspectionData.totalVertices.toLocaleString()} Vertices</div>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 uppercase">{isDemoMode ? 'DEMO SURFACE / VOL' : 'SURFACE AREA / VOL'}</div>
            <div className="text-sm font-black text-amber-400 mt-0.5">
              {areaVolumeData?.volume?.value_m3 !== null && areaVolumeData?.volume?.value_m3 !== undefined ? `${areaVolumeData.volume.value_m3} m³` : (areaVolumeData?.volume?.status === 'mesh_not_closed' ? 'Unavailable' : `${areaVolumeData?.boundingVolume?.model_units_cu ?? 0} units³`)}
            </div>
            <div className="text-[9px] text-slate-500">Volume: {areaVolumeData?.volume?.status ?? 'uncalibrated'}</div>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 uppercase">Overall Confidence</div>
            <div className="text-sm font-black text-brand-cyan mt-0.5">
              {confidenceMatrixData.overall}%
            </div>
            <div className="text-[9px] text-emerald-400">Scale: {confidenceMatrixData.scale}%</div>
          </div>
        </div>
      </div>

      {uploadError && (
        <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg text-xs font-mono text-red-400">
          Error loading model: {uploadError}
        </div>
      )}

      {/* Main Studio Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: 3D Interactive Viewport & Scene (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Person2Viewport3D
            customModelGroup={customModelGroup}
            selectedDataset={selectedDataset}
            renderMode={renderMode}
            isPickingScalePoints={isPickingScalePoints}
            pickedScalePoints={pickedScalePoints}
            onPickScalePoint={handlePickScalePoint}
            isPickingMeasurePoints={isPickingMeasurePoints}
            pickedMeasurePoints={pickedMeasurePoints}
            onPickMeasurePoint={handlePickMeasurePoint}
            measurements={measurements}
            scaleFactor={scaleFactor}
            axisOrientation={axisOrientation}
          />

          {/* Interactive Reference Drone Video / Image Panel */}
          <ReferenceVideoPanel externalFile={referenceImageFile} />
        </div>

        {/* Right Column: Scale Calibration, Geometry Inspection, Measurements & Semantics (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Scale Calibration Card */}
          <ScaleCalibrationCard
            axisOrientation={axisOrientation}
            setAxisOrientation={setAxisOrientation}
            scaleFactor={scaleFactor}
            scaleConfidence={scaleConfidence}
            scaleResidual={scaleResidual}
            referenceCount={referenceCount}
            onCalibrateFromUserRef={handleCalibrateFromUserRef}
            onResetCalibration={handleResetCalibration}
            isPickingScalePoints={isPickingScalePoints}
            setIsPickingScalePoints={(val) => {
              setIsPickingScalePoints(val);
              if (val) setIsPickingMeasurePoints(false);
            }}
            pickedScalePoints={pickedScalePoints}
          />

          {/* Point-to-Point 3D Distance Engine */}
          <MeasurementPanel
            measurements={measurements}
            onAddMeasurement={handleAddMeasurement}
            onRemoveMeasurement={handleRemoveMeasurement}
            isPickingMeasurePoints={isPickingMeasurePoints}
            setIsPickingMeasurePoints={(val) => {
              setIsPickingMeasurePoints(val);
              if (val) setIsPickingScalePoints(false);
            }}
            pickedMeasurePoints={pickedMeasurePoints}
            onClearPickedPoints={() => setPickedMeasurePoints([])}
            scaleFactor={scaleFactor}
          />

          {/* 3D Geometry Inspector */}
          <GeometryInspector
            inspection={inspectionData}
            heightWidthDepth={heightWidthDepthData}
            areaVolume={areaVolumeData}
            scaleFactor={scaleFactor}
            axisOrientation={axisOrientation}
          />

          {/* Semantic Object Analysis & Confidence Matrix */}
          <SemanticAnalysisCard
            semanticObjects={semanticObjectsData}
            confidenceMatrix={confidenceMatrixData}
            scaleFactor={scaleFactor}
          />
        </div>
      </div>

      {/* Structured JSON Analysis Result Exporter Modal */}
      <JsonOutputModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        jsonResult={jsonResult}
      />
    </div>
  );
}

class Person2ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Person2 Studio Error Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center bg-dark-950/90 border border-slate-800 rounded-xl p-8 text-center space-y-4 font-mono shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Person 2 Metric Studio State Syncing...</h3>
            <p className="text-xs text-slate-400 max-w-md">
              {this.state.error?.message || 'Re-initializing offline metric scale engine viewport.'}
            </p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="py-2 px-5 rounded-lg bg-brand-cyan text-dark-950 font-bold text-xs cursor-pointer hover:bg-brand-cyan/80 transition-colors shadow-lg shadow-brand-cyan/20"
          >
            Reset Studio View
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function Person2AnalysisStudioWithErrorBoundary(props) {
  return (
    <Person2ErrorBoundary>
      <Person2AnalysisStudio {...props} />
    </Person2ErrorBoundary>
  );
}

