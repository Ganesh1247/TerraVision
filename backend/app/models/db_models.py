from datetime import datetime, timezone

from sqlalchemy import JSON, Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from backend.app.core.database import Base


class Job(Base):
    __tablename__ = "jobs"

    id = Column(String, primary_key=True, index=True)
    dataset_name = Column(String, nullable=False)
    status = Column(String, default="queued", index=True)  # queued, processing, completed, failed, cancelled

    # Input stats
    video_path = Column(String, nullable=True)
    imu_path = Column(String, nullable=True)
    has_imu = Column(Boolean, default=False)
    total_frames = Column(Integer, default=0)
    video_size_mb = Column(Float, default=0.0)
    user_reference_dimension = Column(Float, nullable=True)

    # Metric scale results
    scale_factor = Column(Float, nullable=True)  # e.g., 0.985 m/unit
    scale_confidence = Column(Float, nullable=True)  # e.g., 94.2 %
    scale_uncertainty = Column(String, nullable=True)  # e.g., "± 0.012 m (1.2 cm)"
    uncertainty_m = Column(Float, nullable=True)  # raw float in meters

    # 3D output metrics
    point_count = Column(String, nullable=True)  # e.g., "1,420,000 pts"
    mesh_faces = Column(String, nullable=True)  # e.g., "280,000 faces"
    confidence_avg = Column(Float, default=85.0)
    runtime_str = Column(String, nullable=True)  # e.g., "04m 18s"

    # Flags and degraded fallback indicators
    degraded_flags = Column(JSON, default=list)
    export_paths = Column(JSON, default=dict)
    checksum = Column(String, nullable=True)
    error_reason = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    stages = relationship("PipelineStageRecord", back_populates="job", cascade="all, delete-orphan")
    hotspots = relationship("HotspotRecord", back_populates="job", cascade="all, delete-orphan")


class PipelineStageRecord(Base):
    __tablename__ = "pipeline_stages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(String, ForeignKey("jobs.id", ondelete="CASCADE"), index=True)
    stage_id = Column(String, nullable=False)  # ingestion, preprocessing, feature_extraction, etc.
    stage_name = Column(String, nullable=False)
    status = Column(String, default="idle")  # idle, active, complete, failed
    duration_sec = Column(Float, nullable=True)
    throughput = Column(String, nullable=True)
    error_msg = Column(Text, nullable=True)

    job = relationship("Job", back_populates="stages")


class HotspotRecord(Base):
    __tablename__ = "hotspots"

    id = Column(String, primary_key=True)
    job_id = Column(String, ForeignKey("jobs.id", ondelete="CASCADE"), index=True)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)
    position = Column(JSON, default=list)  # [x, y, z]

    # Measurements
    measurement_type = Column(String, default="Estimated Height")
    measurement_value = Column(Float, default=0.0)
    measurement_unit = Column(String, default="m")
    uncertainty_m = Column(Float, default=0.0)
    secondary_metric = Column(JSON, default=dict)

    # 5D Confidences (0.0 to 1.0)
    geometry_confidence = Column(Float, default=0.85)
    depth_confidence = Column(Float, default=0.85)
    scale_confidence = Column(Float, default=0.85)
    semantic_confidence = Column(Float, default=0.85)
    measurement_confidence = Column(Float, default=0.85)

    quality_assessment = Column(String, default="High Confidence")
    status_color = Column(String, default="emerald")
    explanation = Column(Text, nullable=True)
    recommended_action = Column(Text, nullable=True)

    job = relationship("Job", back_populates="hotspots")
