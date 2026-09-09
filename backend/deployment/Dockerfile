# ==============================================================================
# Terra Vision Edge Reconstruction Backend Dockerfile (SIH26158)
# Target Architecture: NVIDIA Jetson AGX Orin (aarch64) / x86_64 CUDA 12.4
# 100% Offline Air-Gapped Image — Bundles all weights and dependencies at build time
# ==============================================================================

FROM nvcr.io/nvidia/l4t-tensorrt:r8.6.2-devel AS base

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    AIR_GAP_MODE=1 \
    TV_AIR_GAP_MODE=True

# Install system runtime libraries (OpenCV, FFmpeg, OpenGL, Ceres, SQLite)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3-pip \
    python3-dev \
    python3-setuptools \
    build-essential \
    cmake \
    ffmpeg \
    libsm6 \
    libxext6 \
    libgl1-mesa-glx \
    libglib2.0-0 \
    sqlite3 \
    libsqlite3-dev \
    libceres-dev \
    libeigen3-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python requirements
COPY backend/requirements.txt /app/requirements.txt
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy backend codebase
COPY backend/ /app/backend/

# Pre-compile TensorRT INT8/FP16 models at container build time
RUN python3 /app/backend/app/pipeline/optimization/s0_model_optimization.py --out /app/backend/storage/trt_engines --fp16

EXPOSE 8000

# Health check ensuring offline server readiness
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD python3 -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health')" || exit 1

ENTRYPOINT ["python3", "/app/backend/run_backend.py"]
