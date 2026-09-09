# Terra Vision Edge Backend (SIH26158)

> **Production-grade edge backend for real-time, GPS-free drone video to metric 3D model reconstruction.**  
> Built for SIH26158 (NTRO) software category. Runs 100% offline with zero cloud dependencies.

---

## 🚀 Key Architectural Capabilities

1. **Real-Time Pipelined Concurrency**: As soon as keyframes are extracted, feature extraction, VIO pose estimation, incremental SfM triangulation, and metric scale recovery begin immediately across async queues.
2. **GPS-Free Odometry (VIO)**: Fuses visual optical flow and 200Hz IMU accelerometer/gyroscope measurements in a sliding-window factor graph, with DBoW2-style visual loop-closure to eliminate long-flight positional drift.
3. **Multi-Cue Metric Scale Recovery Engine**: Resolves true physical metric scale from 5 independent cues (Ground Plane RANSAC, YOLO reference objects, camera intrinsics, IMU metric motion, and user ground truth).
4. **5-Dimensional Confidence Matrix**: Computes Geometry, Depth, Scale, Semantic, and Composite Measurement confidence per region.
5. **TensorRT Edge Quantization**: INT8/FP16 compiled neural inference for Zero-DCE (low-light), MiDaS (monocular depth fallback), and YOLO (object scaling) on NVIDIA Jetson Orin.
6. **Live Binary & WebSocket Streaming**: Streams camera poses, sparse points, dense mesh chunks, and kernel telemetry directly to WebGL/Three.js frontends.

---

## 🛠️ Tech Stack

- **Framework**: Python 3.11+, FastAPI, Uvicorn, WebSockets, Pydantic v2
- **Database**: SQLite with Write-Ahead Logging (`PRAGMA journal_mode=WAL`) via SQLAlchemy 2.0
- **Computer Vision**: OpenCV, NumPy, SciPy, Trimesh, Scikit-Image, Tifffile
- **Deep Learning & Edge Optimization**: PyTorch, TorchScript, NVIDIA TensorRT (FP16/INT8)
- **Deployment**: Docker, Docker Compose, Linux systemd

---

## 💻 Getting Started Locally

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Pre-Compile TensorRT / ONNX Optimized Engines (Optional for GPU)

```bash
python app/pipeline/optimization/s0_model_optimization.py --out storage/trt_engines --fp16
```

### 3. Start the Backend Server

```bash
python run_backend.py
```

The API will be live at:  
👉 **`http://127.0.0.1:8000`**  
👉 Interactive API Documentation: **`http://127.0.0.1:8000/docs`**

---

## ✈️ The Airplane-Mode Verification Test (Offline Air-Gap Proof)

To verify that the backend operates **100% offline with ZERO external network calls**:

1. **Physically disconnect all network interfaces** or enable Airplane Mode on your machine:
   ```bash
   # Linux / Jetson:
   sudo nmcli networking off
   # Or disconnect Ethernet / WiFi
   ```
2. **Launch the backend**:
   ```bash
   python run_backend.py
   ```
3. **Run the Automated Air-Gap Test Suite**:
   ```bash
   pytest tests/test_e2e_pipeline.py -v
   ```
4. **Verify Health Endpoint**:
   ```bash
   curl http://127.0.0.1:8000/health
   ```
   Expected response confirms: `"air_gap_verified": true`, `"gps_signals_blocked": true`.

---

## 📡 API Endpoints Reference

### REST Endpoints
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/v1/jobs/upload` | Multipart upload for video/images + IMU log + scale flags |
| `GET` | `/api/v1/jobs/{job_id}` | Retrieve job lifecycle status and progress |
| `POST` | `/api/v1/jobs/{job_id}/cancel` | Gracefully cancel running pipeline |
| `GET` | `/api/v1/jobs/{job_id}/confidence` | 5D multi-dimensional confidence report per region |
| `GET` | `/api/v1/jobs/{job_id}/artifacts/{type}` | Download OBJ, LAS, GeoTIFF, or PDF deliverables |
| `GET` | `/api/v1/history` | Chronological session history of prior missions |
| `GET` | `/health` | Edge diagnostics (GPU, VRAM, NVMe, SQLite WAL status) |
| `GET` | `/metrics` | Processing duration and throughput per pipeline stage |

### WebSocket Endpoint
`ws://127.0.0.1:8000/ws/jobs/{job_id}`  
Streams `STAGE_PROGRESS`, `PARTIAL_3D_UPDATE`, and `LOG` telemetry frames.

---

## 📦 Edge Deployment on Jetson AGX Orin

### Systemd Auto-Start Service
```bash
sudo cp backend/deployment/terravision.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable terravision.service
sudo systemctl start terravision.service
```

### Docker Container Deployment
```bash
cd backend/deployment
docker-compose up -d --build
```
