import React, { useState } from 'react';
import { TECH_STACK_SPEC } from '../../data/techStackSpec';
import ProductionReadiness from './ProductionReadiness';
import { 
  Cpu, 
  Layers, 
  Code, 
  Workflow, 
  ShieldCheck, 
  Zap, 
  Boxes, 
  Server, 
  Database,
  ArrowRight,
  Terminal,
  Activity
} from 'lucide-react';

export default function ArchitectureOverview() {
  const [activeSection, setActiveSection] = useState('pipeline');

  const pipelineBlocks = [
    {
      num: '01',
      title: 'Input Ingestion',
      module: 'input_handling/',
      tech: 'OpenCV / PyAV',
      desc: 'Video keyframe extraction & IMU 200Hz parsing with integrity checks'
    },
    {
      num: '02',
      title: 'Adaptive Preprocessing',
      module: 'preprocessing/',
      tech: 'Zero-DCE / DCP / Wiener',
      desc: 'Real-time low-light brightening, dehazing, and motion deblur filters'
    },
    {
      num: '03',
      title: 'Feature Extraction',
      module: 'feature_extraction/',
      tech: 'SuperPoint + LightGlue',
      desc: 'Sub-pixel rotation/scale-invariant descriptor detection and matching'
    },
    {
      num: '04',
      title: 'VIO Pose Estimation',
      module: 'vio/',
      tech: 'VINS-Fusion / DBoW2',
      desc: 'Factor-graph visual-inertial odometry + loop-closure drift correction'
    },
    {
      num: '05',
      title: 'Structure-from-Motion',
      module: 'reconstruction/',
      tech: 'pycolmap (Ceres Solver)',
      desc: 'Incremental ray triangulation and global non-linear bundle adjustment'
    },
    {
      num: '06',
      title: 'Metric Scale Recovery',
      module: 'scale_recovery/',
      tech: 'IMU + Ground RANSAC + YOLO',
      desc: 'Multi-cue physical scale recovery resolving metric ambiguity'
    },
    {
      num: '07',
      title: 'Scale Validation & 5D Confidence',
      module: 'scale_recovery/ & pipeline/',
      tech: 'Covariance Tensor Engine',
      desc: 'Cross-checks cues into 5 confidence scores & ±δ uncertainty bounds'
    },
    {
      num: '08',
      title: 'Dense Mesh Reconstruction',
      module: 'reconstruction/',
      tech: 'Open3D Screened Poisson',
      desc: 'Multi-View Stereo (MVS) depth densification and watertight meshing'
    },
    {
      num: '09',
      title: 'Real-Time Delivery & Export',
      module: 'api/ & storage/',
      tech: 'FastAPI / WebSockets / glTF',
      desc: 'Zero-copy binary 3D streaming and SHA-256 verified file packaging'
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Sub-navigation tabs */}
      <div className="flex items-center gap-2 p-1 bg-dark-850 rounded-xl border border-slate-800 w-fit">
        <button
          onClick={() => setActiveSection('pipeline')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeSection === 'pipeline'
              ? 'bg-brand-cyan text-slate-950 font-bold shadow-md shadow-brand-cyan/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Visual Pipeline Architecture
        </button>

        <button
          onClick={() => setActiveSection('techstack')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeSection === 'techstack'
              ? 'bg-brand-cyan text-slate-950 font-bold shadow-md shadow-brand-cyan/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Tech Stack & Libraries
        </button>

        <button
          onClick={() => setActiveSection('readiness')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeSection === 'readiness'
              ? 'bg-brand-cyan text-slate-950 font-bold shadow-md shadow-brand-cyan/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Production Readiness Matrix
        </button>
      </div>

      {/* SECTION 1: Pipeline Flowchart */}
      {activeSection === 'pipeline' && (
        <div className="space-y-6">
          <div className="p-4 sm:p-6 rounded-xl bg-dark-850 border border-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <Workflow className="w-5 h-5 text-brand-cyan" />
              <h2 className="text-lg font-bold text-white tracking-wide">
                Single-Pass Offline Reconstruction Architecture (SIH26158)
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              End-to-end data flow from raw uncalibrated drone video files to certified metric 3D assets with 5-dimensional uncertainty bounds.
            </p>
          </div>

          {/* Flowchart Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pipelineBlocks.map((block, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-dark-850 border border-slate-800 hover:border-brand-cyan/40 transition-all flex flex-col justify-between space-y-3 relative group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan">
                      STAGE {block.num}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {block.tech}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white">
                    {block.title}
                  </h3>

                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {block.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-brand-cyan flex items-center justify-between">
                  <span>{block.module}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-brand-cyan group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>

          {/* Edge Architecture Diagram Card */}
          <div className="p-5 rounded-xl bg-dark-900 border border-brand-cyan/30 tech-border-glow space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-brand-cyan" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Edge Device Hardware Acceleration Path
              </h3>
            </div>
            <div className="p-3 bg-dark-950 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 space-y-2">
              <div className="flex items-center gap-2 text-brand-cyan">
                <span>[INPUT VIDEO]</span>
                <span>→</span>
                <span>[CUDA NVDEC DECODE]</span>
                <span>→</span>
                <span>[TENSORRT INT8 Zero-DCE & SuperPoint]</span>
                <span>→</span>
                <span>[CERES GPU BUNDLE ADJUSTMENT]</span>
                <span>→</span>
                <span>[OPEN3D POISSON SURFACE]</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Optimized for NVIDIA RTX 3060/4070 laptops and Jetson Orin modules. Sustained 185,000 dense points/sec throughput at sub-45W power.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: Tech Stack & Libraries */}
      {activeSection === 'techstack' && (
        <div className="space-y-6">
          <div className="p-4 sm:p-6 rounded-xl bg-dark-850 border border-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <Code className="w-5 h-5 text-brand-cyan" />
              <h2 className="text-lg font-bold text-white tracking-wide">
                Complete Library & Software Dependency Specifications
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              All tools, frameworks, and C++/Python bindings utilized across the offline edge pipeline.
            </p>
          </div>

          {/* Core Processing Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-brand-cyan" /> Core Python & Computer Vision Processing
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-dark-900 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                    <th className="p-3">Library / Tool</th>
                    <th className="p-3">Target Version</th>
                    <th className="p-3">Pipeline Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-dark-850">
                  {TECH_STACK_SPEC.corePython.map((lib, i) => (
                    <tr key={i} className="hover:bg-dark-800/50">
                      <td className="p-3 font-mono font-bold text-white">{lib.name}</td>
                      <td className="p-3 font-mono text-brand-cyan">{lib.version}</td>
                      <td className="p-3 text-slate-300">{lib.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SLAM & Infrastructure */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SLAM Localization */}
            <div className="p-4 rounded-xl bg-dark-850 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Workflow className="w-4 h-4 text-emerald-400" /> SLAM & GPS-Free Localization
              </h3>
              <div className="space-y-2">
                {TECH_STACK_SPEC.slamLocalization.map((item, i) => (
                  <div key={i} className="p-2.5 rounded bg-dark-900 border border-slate-800 text-xs">
                    <div className="flex justify-between font-mono font-bold text-white mb-1">
                      <span>{item.name}</span>
                      <span className="text-[10px] text-emerald-400">{item.type}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{item.role}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Backend & Real-Time */}
            <div className="p-4 rounded-xl bg-dark-850 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Server className="w-4 h-4 text-brand-cyan" /> Backend & Edge Streaming
              </h3>
              <div className="space-y-2">
                {TECH_STACK_SPEC.backendInfrastructure.map((item, i) => (
                  <div key={i} className="p-2.5 rounded bg-dark-900 border border-slate-800 text-xs">
                    <div className="flex justify-between font-mono font-bold text-white mb-1">
                      <span>{item.name}</span>
                      {item.version && <span className="text-[10px] text-brand-cyan">{item.version}</span>}
                    </div>
                    <p className="text-[11px] text-slate-400">{item.role}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: Production Readiness Matrix */}
      {activeSection === 'readiness' && (
        <ProductionReadiness />
      )}
    </div>
  );
}
