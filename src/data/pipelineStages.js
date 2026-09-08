export const PIPELINE_STAGES = [
  {
    id: 'ingestion',
    index: 1,
    name: 'Input Ingestion',
    shortName: 'Ingestion',
    module: 'input_handling/upload_receiver.py & format_validator.py',
    coreTechnique: 'File integrity checksums + dynamic frame extractor & IMU parser',
    description: 'Accepts uploaded video file or image set through the local web interface; validates integrity, extracts high-overlap keyframes, and checks for synchronized IMU high-rate telemetry.',
    actions: [
      'Validating MP4 container and metadata integrity (0 corrupted blocks)',
      'Extracting keyframes at 4.2 FPS based on optical motion delta',
      'Parsing 200Hz accelerometer and gyroscope telemetry log',
      'Establishing synchronized timestamp baseline (t0 = 0.000s)'
    ],
    throughputLabel: 'Keyframe Extraction',
    throughputUnit: 'fps',
    normalThroughput: '185 fps'
  },
  {
    id: 'preprocessing',
    index: 2,
    name: 'Adaptive Preprocessing',
    shortName: 'Preprocessing',
    module: 'preprocessing/quality_router.py & low_light_enhancer.py',
    coreTechnique: 'Adaptive enhancement (CLAHE / Zero-DCE, Dark Channel Prior dehaze, Wiener deblur)',
    description: 'Analyzes per-frame photometric quality (entropy, blur metric, dynamic range). Routes degraded frames through real-time PyTorch/TensorRT enhancement before keypoint detection.',
    actions: [
      'Computing Laplacian variance blur metric per frame',
      'Applying Zero-DCE illumination enhancement to underexposed shadow regions',
      'Dark Channel Prior atmospheric transmission estimation & dehazing',
      'Fast Wiener kernel deconvolution for rotary vibration compensation'
    ],
    throughputLabel: 'Enhancement Rate',
    throughputUnit: 'MP/s',
    normalThroughput: '48.2 MP/s'
  },
  {
    id: 'feature_extraction',
    index: 3,
    name: 'Feature Extraction & Matching',
    shortName: 'Features',
    module: 'feature_extraction/keypoint_detector.py & feature_matcher.py',
    coreTechnique: 'Illumination-robust learned descriptors (SuperPoint/SIFT) & LightGlue matching',
    description: 'Extracts scale-invariant and rotation-invariant keypoints across sequential and loop-candidate frames. Performs bidirectional epipolar-constrained feature matching.',
    actions: [
      'Extracting 4,096 dense keypoints per frame using learned sub-pixel detector',
      'Building KD-Tree FLANN index for wide-baseline cross-frame matching',
      'Bidirectional epipolar geometry verification via RANSAC 8-point solver',
      'Filtering out dynamic moving objects (vehicles, swaying foliage)'
    ],
    throughputLabel: 'Keypoints Matched',
    throughputUnit: 'pts/sec',
    normalThroughput: '94,200 pts/s'
  },
  {
    id: 'pose_estimation',
    index: 4,
    name: 'VIO Pose Estimation (No GPS)',
    shortName: 'Pose (VIO)',
    module: 'vio/imu_fusion.py & loop_closure.py',
    coreTechnique: 'Visual-Inertial Odometry + DBoW2 visual loop-closure re-anchoring',
    description: 'Fuses high-frequency visual optical flow with IMU 6-DOF angular rate and linear acceleration inside a sliding-window factor graph. Detects loop closures to eliminate long-flight positional drift without GPS.',
    actions: [
      'Solving nonlinear factor graph over 10-frame sliding window',
      'Pre-integrating IMU accelerometer & gyro biases',
      'DBoW2 bag-of-words place recognition loop-closure candidate test',
      'Global 6-DoF pose graph optimization & drift eradication'
    ],
    throughputLabel: 'Pose Solver Latency',
    throughputUnit: 'ms/frame',
    normalThroughput: '6.4 ms'
  },
  {
    id: 'sfm',
    index: 5,
    name: 'Structure-from-Motion',
    shortName: 'SfM',
    module: 'reconstruction/sfm_engine.py (wraps COLMAP/GLOMAP)',
    coreTechnique: 'Incremental SfM triangulation & multi-camera bundle adjustment',
    description: 'Triangulates matched 2D features across verified camera poses into a high-precision 3D point cloud. Refines 3D coordinates and camera intrinsics using Ceres bundle adjustment.',
    actions: [
      'Triangulating initial 2-view seed reconstruction with 99.2% inlier ratio',
      'Incrementally registering subsequent camera frustums into global coordinate frame',
      'Running Levenberg-Marquardt Ceres global bundle adjustment',
      'Generating sparse spatial tie-point cloud (reprojection error < 0.62 px)'
    ],
    throughputLabel: 'Reprojection Error',
    throughputUnit: 'px',
    normalThroughput: '0.48 px'
  },
  {
    id: 'scale_recovery',
    index: 6,
    name: 'Metric Scale Recovery',
    shortName: 'Scale Recovery',
    module: 'scale_recovery/ground_plane_estimator.py & imu_scale_estimator.py',
    coreTechnique: 'Ground-plane estimation + IMU metric motion + YOLO reference object scaling',
    description: 'Monocular SfM alone only recovers shape up to an unknown scale factor. This stage resolves true physical metric scale (meters) using 4 independent geometric, inertial, and semantic cues.',
    actions: [
      'Fitting RANSAC ground-plane normal & estimating drone flight altitude $h$',
      'Integrating double-differentiated IMU accelerometer scale metric $\\lambda_{imu}$',
      'Detecting standard reference objects (standard shipping doors, vehicles)',
      'Calculating scale coefficient: $\\lambda = 1.000\\text{ m/unit} \\pm 0.008\\text{ m}$'
    ],
    throughputLabel: 'Scale Factor Agreement',
    throughputUnit: '%',
    normalThroughput: '98.8%'
  },
  {
    id: 'scale_validation',
    index: 7,
    name: 'Scale Validation & Uncertainty',
    shortName: 'Scale Validation',
    module: 'scale_recovery/scale_validator.py & confidence_scorer.py',
    coreTechnique: 'Multi-cue agreement scoring & covariance uncertainty bounding',
    description: 'Cross-checks recovered metric scale against multiple independent cues. Calculates 5-dimensional uncertainty bounds rather than silently trusting a single unverified estimate.',
    actions: [
      'Cross-validating scale across Ground Plane vs IMU vs Camera Intrinsics',
      'Computing 5-dimensional confidence tensors (Geometry, Depth, Scale, Semantic, Measurement)',
      'Constructing covariance ellipses & 95% confidence intervals per sub-region',
      'Flagging low-certainty / reflective zones in spatial index'
    ],
    throughputLabel: 'Uncertainty Margin',
    throughputUnit: '%',
    normalThroughput: '± 1.4%'
  },
  {
    id: 'dense_reconstruction',
    index: 8,
    name: 'Dense Mesh Reconstruction',
    shortName: 'Dense Mesh',
    module: 'reconstruction/dense_mesh_builder.py (wraps Open3D / MVS)',
    coreTechnique: 'Multi-view stereo (MVS) depth fusion & Poisson surface reconstruction',
    description: 'Densifies sparse tie points into millions of 3D depth samples and extracts an airtight, textured, photorealistic 3D triangular polygon mesh with UV coordinate texture atlas.',
    actions: [
      'Multi-View Stereo (MVS) patch-match photometric stereo disparity fusion',
      'Generating 1.8M dense 3D spatial points with normal vector estimates',
      'Executing Screened Poisson Surface Reconstruction (octree depth 11)',
      'UV unwrap & high-resolution photographic texture projection blending'
    ],
    throughputLabel: 'Dense Point Rate',
    throughputUnit: 'pts/sec',
    normalThroughput: '185,000 pts/s'
  },
  {
    id: 'live_delivery',
    index: 9,
    name: 'Live 3D Delivery & API Export',
    shortName: 'Live Delivery',
    module: 'api/websocket_manager.py & storage/model_store.py',
    coreTechnique: 'Zero-copy memory streaming + glTF/OBJ/LAS/GeoTIFF export packaging',
    description: 'Streams the live 3D textured mesh and confidence point cloud to the local browser viewer. Packages exportable GIS deliverables with SHA-256 integrity checksums.',
    actions: [
      'Streaming progressive LOD binary buffer to WebGL/Three.js context',
      'Compiling geospatial GeoTIFF orthomosaic and digital elevation model (DEM)',
      'Generating standard OBJ mesh, LAS LiDAR point cloud, and glTF bundles',
      'Reconstruction complete — 100% offline verification passed'
    ],
    throughputLabel: 'WebStream Rate',
    throughputUnit: 'MB/s',
    normalThroughput: '84.0 MB/s'
  }
];

export const SOFTWARE_FALLBACKS = [
  {
    id: 'low_light',
    name: 'Low-Light Enhancement',
    algorithm: 'Zero-DCE / Adaptive CLAHE',
    condition: 'Underexposed night/shadow frames (< 25 cd/m²)',
    module: 'preprocessing/low_light_enhancer.py',
    description: 'Boosts contrast and dynamic range without noise amplification before keypoint extraction.'
  },
  {
    id: 'dehazing',
    name: 'Atmospheric Dehazing',
    algorithm: 'Dark Channel Prior (DCP)',
    condition: 'Fog, mist, smoke, or heavy dust scattering',
    module: 'preprocessing/dehazer.py',
    description: 'Recovers scene transmission map and removes atmospheric veil for crisp edge detection.'
  },
  {
    id: 'deblurring',
    name: 'Motion Blur Compensation',
    algorithm: 'Wiener Deconvolution Filter',
    condition: 'High-speed drone pitch or propeller vibration',
    module: 'preprocessing/deblurrer.py',
    description: 'Compensates rotary and motion smearing on high-velocity linear passes.'
  },
  {
    id: 'mono_depth',
    name: 'Monocular Depth Fallback',
    algorithm: 'MiDaS DPT Learned Depth Prior',
    condition: 'Single-angle or insufficient multi-view overlap',
    module: 'reconstruction/depth_fallback.py',
    description: 'Prevents total SfM pipeline failure by estimating dense depth from monocular priors with flagged confidence.'
  },
  {
    id: 'imu_weighting',
    name: 'Adaptive IMU Weighting',
    algorithm: 'Dynamic Covariance Adjustment',
    condition: 'Low-texture surfaces (water, asphalt, glass)',
    module: 'vio/imu_fusion.py',
    description: 'Increases inertial measurement Kalman weight when visual feature matches drop below threshold.'
  },
  {
    id: 'loop_closure',
    name: 'Visual Loop Closure',
    algorithm: 'DBoW2 Bag-of-Words & Pose Graph',
    condition: 'Long-duration flight accumulated drift (> 200m)',
    module: 'vio/loop_closure.py',
    description: 'Re-anchors trajectory against previously recognized landmarks, eliminating cumulative drift without GPS.'
  }
];
