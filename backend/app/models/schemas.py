from typing import Any

from pydantic import BaseModel, Field

# --- Job Requests & Responses ---


class JobCreateRequest(BaseModel):
    dataset_name: str = Field(default="Drone Recon Flight", description="Descriptive dataset name")
    keyframe_step: int = Field(default=1, ge=1, le=10, description="Extract every Nth frame")
    optical_motion_threshold: float = Field(default=0.04, ge=0.0, le=0.5)
    user_reference_dimension: float | None = Field(
        default=None, description="Known physical dimension in meters for scale anchoring"
    )
    force_low_light: bool = False
    force_fog_haze: bool = False
    force_motion_blur: bool = False
    force_no_imu: bool = False
    force_sparse_overlap: bool = False
    force_simulate_failure: bool = False


class StageStatusSchema(BaseModel):
    id: str
    name: str
    status: str  # idle, active, complete, failed
    duration: str | None = None
    throughput: str | None = None
    error: str | None = None


class JobResponse(BaseModel):
    id: str
    datasetName: str
    timestamp: str
    status: str
    runtime: str | None = None
    videoSize: str | None = None
    frames: int = 0
    pointCount: str | None = None
    meshFaces: str | None = None
    scaleUncertainty: str | None = None
    scaleFactor: float | None = None
    confidenceAvg: float = 85.0
    hasImu: bool = False
    degradedFlags: list[str] = []
    exportSizes: dict[str, str] = {}
    checksum: str | None = None
    stages: list[StageStatusSchema] | None = None


# --- 5-Dimensional Confidence Schemas ---


class SecondaryMetricSchema(BaseModel):
    label: str
    value: str
    uncertainty: str


class MeasurementSchema(BaseModel):
    type: str = "Estimated Height"
    value: float
    unit: str = "m"
    uncertainty: float
    secondaryMetric: SecondaryMetricSchema | None = None


class ConfidenceDictSchema(BaseModel):
    geometry: int = 85
    depth: int = 85
    scale: int = 85
    semantic: int = 85
    measurement: int = 85


class HotspotConfidenceReport(BaseModel):
    id: str
    title: str
    region: str
    position: list[float] = [0.0, 0.0, 0.0]
    category: str
    measurement: MeasurementSchema
    confidence: ConfidenceDictSchema

    # Prompt-specified flat keys
    geometry_confidence: float = 0.85
    depth_confidence: float = 0.85
    scale_confidence: float = 0.85
    semantic_confidence: float = 0.85
    measurement_confidence: float = 0.85
    estimated_dimension_m: float = 0.0
    uncertainty_m: float = 0.0

    qualityAssessment: str = "High Confidence"
    statusColor: str = "emerald"
    explanation: str | None = None
    recommendedAction: str | None = None


class RegionConfidenceSummary(BaseModel):
    job_id: str
    regions: list[HotspotConfidenceReport]
    overall_scale_factor: float
    overall_uncertainty_margin_m: float
    verified_gps_free: bool = True


# --- Real-Time Streaming & WebSocket Payloads ---


class StageProgressEvent(BaseModel):
    event_type: str = "STAGE_PROGRESS"
    job_id: str
    stage_index: int
    stage_id: str
    stage_name: str
    stage_progress: int  # 0 to 100
    total_progress: int  # 0 to 100
    current_action: str
    active_fallbacks: list[str] = []
    stage_statuses: list[dict[str, Any]] = []


class CameraPosePayload(BaseModel):
    frame_index: int
    timestamp_s: float
    position: list[float]  # [x, y, z]
    quaternion: list[float]  # [qx, qy, qz, qw]
    inlier_features: int
    is_keyframe: bool


class PointCloudChunk(BaseModel):
    points: list[list[float]]  # [[x, y, z], ...]
    colors: list[list[float]] | None = None  # [[r, g, b], ...]
    confidence_values: list[float] | None = None
    is_incremental: bool = True


class MeshUpdateChunk(BaseModel):
    vertices_count: int
    faces_count: int
    lod_level: int = 1
    mesh_base64: str | None = None


class Live3DPartialPayload(BaseModel):
    event_type: str = "PARTIAL_3D_UPDATE"
    job_id: str
    timestamp: str
    camera_poses: list[CameraPosePayload] = []
    sparse_points_added: int = 0
    total_sparse_points: int = 0
    point_chunk: PointCloudChunk | None = None
    mesh_update: MeshUpdateChunk | None = None
    hotspots: list[HotspotConfidenceReport] = []


class LogStreamEvent(BaseModel):
    event_type: str = "LOG"
    timestamp: str
    tag: str
    message: str
    level: str  # info, success, warning, error


# --- System Health & Diagnostics ---


class SystemHealthResponse(BaseModel):
    status: str
    gpu_available: bool
    gpu_name: str
    vram_used_mb: float
    vram_total_mb: float
    vram_percent: float
    tensorrt_status: str  # "Ready (INT8/FP16 Edge Pipeline)"
    cuda_version: str
    disk_free_gb: float
    disk_percent: float
    database_status: str
    air_gap_verified: bool
    gps_signals_blocked: bool
    target_hardware: str


HealthCheckResponse = SystemHealthResponse


class MetricsResponse(BaseModel):
    uptime_seconds: float
    jobs_total: int
    jobs_failed: int
    system_resources: dict[str, Any]
    stages: dict[str, Any]
