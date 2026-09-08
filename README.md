# Terra Vision — Offline Drone 3D Reconstruction System (SIH26158)

> **Production-grade edge software for single-pass drone video to accurate metric 3D model generation without GPS or network dependencies.**

![Terra Vision Mission Control](https://img.shields.io/badge/System-Air--Gapped%20Offline-22C55E?style=for-the-badge)
![SIH Problem Statement](https://img.shields.io/badge/SIH-26158%20Software-22D3EE?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Three.js%20%7C%20Tailwind-06B6D4?style=for-the-badge)

---

## 🌟 Overview

**Terra Vision** is a mission-control web interface and edge processing pipeline designed for field operators in GPS-denied and network-disconnected environments (e.g., disaster response, structural inspection, open-pit mines, defense corridors).

The system accepts uncalibrated drone-captured video footage (and optional IMU telemetry), extracts high-overlap keyframes, performs Visual-Inertial Odometry (VIO) pose estimation, triangulates sparse geometry with incremental Structure-from-Motion (SfM), resolves true physical metric scale, and densifies the result into a full 3D textured mesh — all running **100% offline**.

---

## 🚀 Key Features

### 1. 🛡️ Multi-Dimensional Confidence Framework (Core Differentiator)
Rather than treating confidence as a single flat number, Terra Vision computes **5 independent confidence dimensions** per region:
- **Geometry Confidence**: Constrained by feature match density and viewing-angle diversity.
- **Depth Confidence**: Triangulation reliability vs monocular depth fallback priors.
- **Scale Confidence**: Agreement across ground-plane geometry, IMU acceleration, and object priors.
- **Semantic Confidence**: Object segmentation classification certainty.
- **Composite Measurement Confidence**: Statistical uncertainty bounds (e.g., `Estimated Height: 18.4 m ± 0.35 m`) visualized with Gaussian probability density curves.

### 2. 🎮 Interactive 3D Mission Viewport
- Built with **Three.js** and **@react-three/fiber**.
- **5 Render Modes**: *Textured Mesh*, *Dense Point Cloud* (12,000+ particles), *Wireframe*, *5D Confidence Heatmap*, and *Elevation Contours*.
- Animated drone flight trajectory spline with camera frustum pyramids.
- Clickable 3D asset inspection beacons.

### 3. 🔄 9-Stage Sequential Pipeline Stepper
1. **Input Ingestion** (`input_handling/`)
2. **Adaptive Preprocessing** (`preprocessing/`)
3. **Feature Extraction & Matching** (`feature_extraction/`)
4. **VIO Pose Estimation (No GPS)** (`vio/`)
5. **Structure-from-Motion** (`reconstruction/`)
6. **Metric Scale Recovery** (`scale_recovery/`)
7. **Scale Validation & Uncertainty** (`scale_recovery/`)
8. **Dense Mesh Reconstruction** (`reconstruction/`)
9. **Live 3D Delivery & API Export** (`api/`)

### 4. ⚡ Software Fallback Matrix (Input-Quality Handling)
- **Zero-DCE / CLAHE**: Night / low-light contrast enhancement.
- **Dark Channel Prior (DCP)**: Atmospheric fog, rain, and dust dehazing.
- **Wiener Deconvolution**: Drone propeller vibration and motion blur filtering.
- **MiDaS DPT Learned Depth**: Monocular fallback for single-angle / sparse overlap.
- **Adaptive IMU Weighting**: Increased inertial weighting over low-texture surfaces.
- **DBoW2 Loop Closure**: Re-anchoring trajectory against visual landmarks for zero long-flight drift.

### 5. 📦 Production Readiness & Edge Diagnostics
- Air-gap verified (zero cloud calls).
- Hardware diagnostics: GPU VRAM, TensorRT INT8/FP16 status, NVMe PCIe Gen4 I/O, SQLite WAL database.
- Export deliverables: Wavefront `.OBJ`, georeferenced `.LAS` point cloud, `.GeoTIFF` DEM, and certified PDF inspection report.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite 6, Tailwind CSS, Framer Motion, Lucide Icons, Canvas Confetti
- **3D Engine**: Three.js, `@react-three/fiber`, `@react-three/drei`
- **Backend Architecture (Edge Target)**: Python 3.11, FastAPI, OpenCV, PyTorch, pycolmap (COLMAP / Ceres Solver), Open3D, VINS-Fusion / OpenVINS, SQLite3

---

## 💻 Getting Started Locally

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation & Run

```bash
# 1. Clone the repository
git clone https://github.com/Ganesh1247/TerraVision.git
cd TerraVision

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open your browser and navigate to:
👉 **`http://localhost:5173/`**

---

## 🏗️ Production Build

```bash
# Compile optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 📜 Problem Statement Reference
**SIH26158 | Software Category | Single-Pass Drone Video to Accurate 3D Model Generation System**
