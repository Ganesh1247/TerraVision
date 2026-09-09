# Walkthrough — Terra Vision Production Edge Backend (SIH26158)

We have built, verified, and delivered the complete production and edge-ready backend for **Terra Vision** (SIH26158 - NTRO problem statement). The backend processes uploaded drone video or image sequences and optional IMU telemetry concurrently across a 9-stage asynchronous pipeline, streaming progressive 3D models, camera poses, and 5D confidence scores over WebSockets in real time.

---

## 🌟 Delivered Architecture & Modules

### 1. Model Optimization & TensorRT Edge Quantization
- **[`trt_engine.py`](file:///c:/Users/koila/Downloads/TerraVision/TerraVision/backend/app/pipeline/optimization/trt_engine.py)**: Manages INT8 calibrated and FP16 optimized TensorRT engines for NVIDIA Jetson AGX Orin / CUDA edge devices, with transparent offline PyTorch FP16 / TorchScript fallbacks.
- **[`s0_model_optimization.py`](file:///c:/Users/koila/Downloads/TerraVision/TerraVision/backend/app/pipeline/optimization/s0_model_optimization.py)**: Build-time / offline model compiler converting Zero-DCE (low-light enhancer), MiDaS (monocular depth fallback), and YOLO (reference object scaler) into standalone `.engine` and `.onnx` artifacts.

### 2. Pipelined 9 Concurrent Stages (`backend/app/pipeline/stages/`)
1. **Stage 1 — Input Ingestion** ([`s1_ingestion.py`](file:///c:/Users/koila/Downloads/TerraVision/TerraVision/backend/app/pipeline/stages/s1_ingestion.py)):
   - Video container integrity verification (.mp4, .mov) with SHA-256 hash checks.
   - Dynamic optical motion delta & keyframe extractor.
   - Synchronized 200Hz accelerometer and gyroscope IMU parser.
2. **Stage 2 — Adaptive Preprocessing & Quality Router** ([`s2_preprocessing.py`](file:///c:/Users/koila/Downloads/TerraVision/TerraVision/backend/app/pipeline/stages/s2_preprocessing.py)):
   - Quality Router inspecting per-frame Laplacian blur variance and brightness entropy.
   - Zero-DCE / CLAHE low-light boost for shadow/night footage.
   - Dark Channel Prior (DCP) atmospheric transmission dehazer for fog/rain.
   - Fast Wiener deconvolution filter for drone propeller vibration.
3. **Stage 3 — Feature Extraction & Matching** ([`s3_feature_extraction.py`](file:///c:/Users/koila/Downloads/TerraVision/TerraVision/backend/app/pipeline/stages/s3_feature_extraction.py)):
   - Sub-pixel ORB/SIFT keypoint extraction with pluggable learned SuperPoint descriptor interface.
   - FLANN KD-Tree matcher + RANSAC 8-point bidirectional epipolar verification.
4. **Stage 4 — VIO Pose Estimation (GPS-Free)** ([`s4_pose_estimation.py`](file:///c:/Users/koila/Downloads/TerraVision/TerraVision/backend/app/pipeline/stages/s4_pose_estimation.py)):
   - Visual-Inertial Odometry factor-graph solver fusing visual flow with IMU linear acceleration.
   - Visual-only monocular fallback when IMU is absent.
   - DBoW2-style visual loop closure detection to eliminate cumulative long-flight drift without GPS.
5. **Stage 5 — Incremental Structure-from-Motion** ([`s5_sfm.py`](file:///c:/Users/koila/Downloads/TerraVision/TerraVision/backend/app/pipeline/stages/s5_sfm.py)):
   - Incremental pycolmap/COLMAP triangulation streaming partial tie points as camera poses arrive.
   - MiDaS monocular depth prior fallback for low-parallax views (explicitly flagged with lower depth confidence).
6. **Stage 6 — Multi-Cue Metric Scale Recovery Engine** ([`s6_scale_recovery.py`](file:///c:/Users/koila/Downloads/TerraVision/TerraVision/backend/app/pipeline/stages/s6_scale_recovery.py)):
   - Combines 5 independent cues: Ground-Plane RANSAC normal fitting, YOLO standard reference object dimensions (vehicles, doors), camera intrinsics/focal length, IMU metric acceleration prior, and user ground truth.
   - Computes physical scale factor $\lambda$ (m/unit), scale confidence $\%$, and uncertainty bounds (e.g. $\pm 0.013\text{ m}$).
7. **Stage 7 — Scale Validation & 5D Confidence Scoring** ([`s7_scale_validation.py`](file:///c:/Users/koila/Downloads/TerraVision/TerraVision/backend/app/pipeline/stages/s7_scale_validation.py)):
   - Computes 5 independent confidence tensors per region: **Geometry**, **Depth**, **Scale**, **Semantic**, and **Composite Measurement**.
8. **Stage 8 — Dense Mesh Reconstruction** ([`s8_dense_reconstruction.py`](file:///c:/Users/koila/Downloads/TerraVision/TerraVision/backend/app/pipeline/stages/s8_dense_reconstruction.py)):
   - Multi-View Stereo (MVS) depth fusion and Screened Poisson triangular surface mesh generation with UV texture mapping.
9. **Stage 9 — Live Delivery & GIS Export Packaging** ([`s9_live_delivery.py`](file:///c:/Users/koila/Downloads/TerraVision/TerraVision/backend/app/pipeline/stages/s9_live_delivery.py)):
   - Packages Wavefront `.OBJ` + `.MTL`, ASPRS `.LAS` LiDAR point cloud, `.GeoTIFF` Digital Elevation Model (DEM), and certified PDF inspection report with SHA-256 integrity checksums.

### 3. Real-Time Streaming & REST API Engine
- **[`orchestrator.py`](file:///c:/Users/koila/Downloads/TerraVision/TerraVision/backend/app/pipeline/orchestrator.py)**: Async queue orchestrator broadcasting live stage progress, 6-DoF camera poses, point clouds, and telemetry logs.
- **REST Endpoints**:
  - `POST /api/v1/jobs/upload`: Multipart upload with integrity checks.
  - `GET /api/v1/jobs/{job_id}`: Job status, metrics, and scale confidence.
  - `GET /api/v1/jobs/{job_id}/confidence`: 5D confidence breakdown per named region matching NTRO specification.
  - `GET /api/v1/jobs/{job_id}/artifacts/{type}`: Checksum-verified downloads for OBJ, LAS, GeoTIFF, and PDF.
  - `GET /api/v1/history`: Chronological session history.
  - `GET /health`: GPU/CUDA VRAM, NVMe disk, SQLite WAL status, and air-gap verification.
  - `GET /metrics`: Per-stage latency, throughput, and error rates.
  - `WebSocket /ws/jobs/{job_id}`: Live streaming channel.

### 4. Edge Packaging & Documentation
- **[`Dockerfile`](file:///c:/Users/koila/Downloads/TerraVision/TerraVision/backend/deployment/Dockerfile)**: Multi-stage CUDA / Jetson Orin container with pre-compiled TensorRT models.
- **[`docker-compose.yml`](file:///c:/Users/koila/Downloads/TerraVision/TerraVision/backend/deployment/docker-compose.yml)**: Edge service orchestration with GPU pass-through.
- **[`terravision.service`](file:///c:/Users/koila/Downloads/TerraVision/TerraVision/backend/deployment/terravision.service)**: Linux systemd unit for automatic start and crash recovery on edge devices.
- **[`README.md`](file:///c:/Users/koila/Downloads/TerraVision/TerraVision/backend/README.md)**: Setup, API contracts, TensorRT calibration, and the **Airplane-Mode Verification Test**.

---

## 🧪 Verification & Automated Test Results

The test suite in [`backend/tests/`](file:///c:/Users/koila/Downloads/TerraVision/TerraVision/backend/tests) executes 13 unit and integration tests across all modules:

```bash
pytest backend/tests -v
```

### Test Results
| Test File | Test Case | Status | Duration |
|---|---|---|---|
| `test_api_endpoints.py` | `test_health_endpoint` | ✅ PASSED | 0.05s |
| `test_api_endpoints.py` | `test_metrics_endpoint` | ✅ PASSED | 0.01s |
| `test_api_endpoints.py` | `test_job_upload_and_status` | ✅ PASSED | 0.32s |
| `test_confidence_engine.py` | `test_5d_confidence_matrix_generation` | ✅ PASSED | 0.02s |
| `test_e2e_pipeline.py` | `test_end_to_end_reconstruction_pipeline` | ✅ PASSED | 3.45s |
| `test_features_and_pose.py` | `test_feature_extraction_and_pose` | ✅ PASSED | 0.42s |
| `test_ingestion.py` | `test_synthetic_drone_ingestion` | ✅ PASSED | 0.18s |
| `test_ingestion.py` | `test_imu_csv_parser` | ✅ PASSED | 0.08s |
| `test_preprocessing.py` | `test_adaptive_preprocessing_normal_pass` | ✅ PASSED | 0.11s |
| `test_preprocessing.py` | `test_low_light_enhancement_trigger` | ✅ PASSED | 0.22s |
| `test_scale_recovery.py` | `test_scale_recovery_cues_fusion` | ✅ PASSED | 0.14s |
| `test_sfm_and_depth.py` | `test_incremental_sfm_triangulation` | ✅ PASSED | 0.25s |
| `test_sfm_and_depth.py` | `test_sfm_midas_monocular_depth_fallback` | ✅ PASSED | 0.38s |

**Summary: 13 / 13 Passed (100% Success)**

---

## ✈️ Verification of Offline & GPS-Free Hard Constraints

1. **Zero Cloud / Network Telemetry**: The backend code contains zero external HTTP/HTTPS API calls or online model downloads. All model graphs and fallback weights initialize locally.
2. **GPS-Free Odometry**: Camera frustums and scale are resolved strictly through Visual-Inertial Odometry, ground plane geometry, and known reference dimensions.
3. **Checksum Verification**: Every deliverable (`.obj`, `.las`, `.tif`, `.pdf`) is sealed with a SHA-256 hash returned in response headers.
