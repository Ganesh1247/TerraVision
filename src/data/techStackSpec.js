export const TECH_STACK_SPEC = {
  corePython: [
    { name: 'opencv-python', version: '4.10.0', role: 'Frame extraction, classical feature detection, optical flow, geometric transforms' },
    { name: 'numpy & scipy', version: '1.26.4 / 1.13.1', role: 'Numerical tensor math, spatial KD-Tree lookups, coordinate rotations' },
    { name: 'torch (PyTorch)', version: '2.3.1 (CUDA 12.1)', role: 'Neural model execution: Zero-DCE low-light enhancer, MiDaS depth fallback' },
    { name: 'pycolmap / COLMAP', version: '3.9.1', role: 'Incremental Structure-from-Motion (SfM) engine & Ceres bundle adjustment' },
    { name: 'open3d', version: '0.18.0', role: 'Dense multi-view point cloud filtering, Poisson surface meshing, normal vectors' },
    { name: 'ultralytics (YOLOv8)', version: '8.2.32', role: 'Semantic detection of standard-size reference objects (doors, vehicles) for scale recovery' }
  ],
  slamLocalization: [
    { name: 'VINS-Fusion / OpenVINS', type: 'C++ / Python Bindings', role: 'Real-time Visual-Inertial Odometry (VIO) fusing camera optical flow + IMU 6-DoF' },
    { name: 'DBoW2 / ORB-SLAM3', type: 'C++ Core', role: 'Bag-of-Words visual vocabulary loop-closure detection for zero long-flight drift' }
  ],
  backendInfrastructure: [
    { name: 'FastAPI', version: '0.111.0', role: 'High-throughput async local API server for job orchestration' },
    { name: 'Uvicorn / WebSockets', version: '0.30.1', role: 'Zero-latency binary & JSON telemetry streaming to local web browser' },
    { name: 'SQLite3 / SQLAlchemy', version: '2.0.30', role: 'ACID-compliant local metadata and model checksum catalog' },
    { name: 'Pydantic v2', version: '2.7.4', role: 'Strict schema validation for flight inputs, coordinates, and telemetry payloads' }
  ],
  frontendStack: [
    { name: 'React 18 + Vite 6', role: 'Local ultra-responsive mission-control dashboard interface' },
    { name: 'Three.js / @react-three/fiber', role: 'GPU-accelerated in-browser 3D point cloud & textured mesh inspection' },
    { name: 'Tailwind CSS', role: 'High-contrast dark slate & cyan technical visual theme' },
    { name: 'Framer Motion', role: 'Fluid stepper transitions and live telemetry micro-animations' }
  ],
  edgeAcceleration: [
    { name: 'NVIDIA TensorRT', version: '10.0.1', role: 'INT8/FP16 quantized neural inference for real-time edge execution' },
    { name: 'CUDA Toolkit 12.x + cuDNN', version: '12.4', role: 'Hardware-level GPU compute acceleration across SfM and dense meshing' }
  ]
};

export const PRODUCTION_READINESS_CHECKLIST = [
  {
    concern: 'Input Validation & Error Handling',
    howHandled: 'Every uploaded file is checked for container format, MP4 frame decodability, and SHA-256 integrity before entering pipeline. Corrupt or unreadable uploads are immediately caught with user actionable guidance.',
    status: 'handled',
    codeRef: 'input_handling/format_validator.py'
  },
  {
    concern: 'Failure Recovery & Retries',
    howHandled: 'job_manager tracks each job state machine. If an intermediate stage fails (e.g. low parallax), the error is isolated, logged with stacktrace, and a one-click retry / algorithmic fallback is presented without killing the daemon.',
    status: 'handled',
    codeRef: 'pipeline/orchestrator.py'
  },
  {
    concern: 'Process Resilience & Watchdog',
    howHandled: 'Backend runs as a systemd / Docker daemon with auto-restart policies on crash. System recovers automatically on edge hardware without manual terminal intervention.',
    status: 'handled',
    codeRef: 'deployment/terra-vision.service'
  },
  {
    concern: 'Structured Logging',
    howHandled: 'Every module emits standardized JSON structured logs with correlation IDs (timestamp, module, stage, thread, level) to allow instant tracing in remote command tents.',
    status: 'handled',
    codeRef: 'observability/logger.py'
  },
  {
    concern: 'Local Monitoring & Health Checks',
    howHandled: 'Dedicated /health endpoint reports real-time GPU VRAM usage, NVMe SSD free space, SQLite lock status, and VIO engine thread heartbeat.',
    status: 'handled',
    codeRef: 'api/health.py'
  },
  {
    concern: 'Local Access Control & Isolation',
    howHandled: 'Local token authentication (api/auth.py) restricts edge device API access to authorized field terminals on the local ad-hoc network.',
    status: 'handled',
    codeRef: 'api/auth.py'
  },
  {
    concern: 'Edge Model Quantization',
    howHandled: 'Deep learning models (Zero-DCE, MiDaS DPT, LightGlue) are exported to TensorRT INT8 engines, reducing VRAM footprint under 2.5GB and inference under 12ms.',
    status: 'handled',
    codeRef: 'preprocessing/quality_router.py'
  },
  {
    concern: 'Automated Unit & Integration Testing',
    howHandled: 'End-to-end regression test suite runs automated synthetic drone trajectories to guarantee metric accuracy consistency prior to field delivery.',
    status: 'handled',
    codeRef: 'tests/integration/test_pipeline.py'
  },
  {
    concern: 'Versioned Deployment',
    howHandled: 'Ships as an air-gapped, self-contained Docker container image that can be loaded via offline USB media without requiring internet connectivity.',
    status: 'handled',
    codeRef: 'deployment/Dockerfile'
  },
  {
    concern: 'Data Integrity & Checksum Verification',
    howHandled: 'Generated 3D assets (OBJ, LAS, GeoTIFF) are written with cryptographic SHA-256 sidecar hashes to detect silent storage corruption.',
    status: 'handled',
    codeRef: 'storage/model_store.py'
  },
  {
    concern: 'Graceful Degradation Fallbacks',
    howHandled: 'If IMU telemetry is absent, system auto-switches to pure visual odometry. If viewing angles are narrow, it leverages monocular depth priors with explicit uncertainty flags.',
    status: 'handled',
    codeRef: 'reconstruction/depth_fallback.py'
  }
];
