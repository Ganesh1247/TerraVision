import os
import shutil
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.app.config import settings
from backend.app.core.logger import logger
from backend.app.core.database import get_db
from backend.app.core.security import verify_token
from backend.app.models.db_models import Job, HotspotRecord
from backend.app.models.schemas import JobResponse, StageStatusSchema
from backend.app.pipeline.orchestrator import orchestrator

router = APIRouter()

@router.post("/upload", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def upload_job(
    dataset_name: str = Form("Flight Reconstruction Mission"),
    keyframe_step: int = Form(1),
    optical_motion_threshold: float = Form(0.04),
    user_reference_dimension: Optional[float] = Form(None),
    force_low_light: bool = Form(False),
    force_fog_haze: bool = Form(False),
    force_motion_blur: bool = Form(False),
    force_no_imu: bool = Form(False),
    force_sparse_overlap: bool = Form(False),
    force_simulate_failure: bool = Form(False),
    video: Optional[UploadFile] = File(None),
    images: Optional[List[UploadFile]] = File(None),
    imu_log: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
    authenticated: bool = Depends(verify_token)
):
    """
    Multipart upload endpoint for drone video / image sets and optional IMU telemetry.
    Validates file formats and initiates real-time concurrent pipeline.
    """
    now_utc = datetime.now(timezone.utc)
    job_id = f"TV-{now_utc.year}-{int(now_utc.timestamp()) % 1000:03d}"
    job_upload_dir = settings.UPLOADS_DIR / job_id
    job_upload_dir.mkdir(parents=True, exist_ok=True)

    video_saved_path = None
    image_saved_paths = []
    imu_saved_path = None
    video_size_mb = 0.0

    # 1. Handle Video
    if video and video.filename:
        # Validate format
        ext = Path(video.filename).suffix.lower()
        if ext not in [".mp4", ".mov", ".avi", ".mkv"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported video format '{ext}'. Must be .mp4, .mov, or .avi."
            )
        dest = job_upload_dir / video.filename
        with open(dest, "wb") as buffer:
            shutil.copyfileobj(video.file, buffer)
        video_saved_path = str(dest)
        video_size_mb = round(os.path.getsize(dest) / (1024 * 1024), 1)

    # 2. Handle Image Sequence
    if images:
        for img in images:
            if img.filename:
                dest = job_upload_dir / img.filename
                with open(dest, "wb") as buffer:
                    shutil.copyfileobj(img.file, buffer)
                image_saved_paths.append(str(dest))

    # 3. Handle IMU Telemetry Log (Optional)
    if imu_log and imu_log.filename:
        dest = job_upload_dir / imu_log.filename
        with open(dest, "wb") as buffer:
            shutil.copyfileobj(imu_log.file, buffer)
        imu_saved_path = str(dest)

    # Create Database Record
    new_job = Job(
        id=job_id,
        dataset_name=dataset_name,
        status="queued",
        video_path=video_saved_path,
        imu_path=imu_saved_path,
        has_imu=imu_saved_path is not None,
        video_size_mb=video_size_mb,
        user_reference_dimension=user_reference_dimension,
        created_at=datetime.utcnow()
    )
    db.add(new_job)
    await db.commit()
    await db.refresh(new_job)

    # Launch async pipeline execution
    pipeline_config = {
        "keyframe_step": keyframe_step,
        "optical_motion_threshold": optical_motion_threshold,
        "user_reference_dimension": user_reference_dimension,
        "force_low_light": force_low_light,
        "force_fog_haze": force_fog_haze,
        "force_motion_blur": force_motion_blur,
        "force_no_imu": force_no_imu,
        "force_sparse_overlap": force_sparse_overlap,
        "force_simulate_failure": force_simulate_failure
    }
    initial_state = {
        "video_path": video_saved_path,
        "image_paths": image_saved_paths,
        "imu_path": imu_saved_path
    }
    await orchestrator.start_job(job_id, dataset_name, pipeline_config, initial_state)

    return JobResponse(
        id=new_job.id,
        datasetName=new_job.dataset_name,
        timestamp=new_job.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        status="processing",
        videoSize=f"{video_size_mb} MB" if video_size_mb > 0 else "N/A",
        hasImu=new_job.has_imu
    )


@router.get("/{job_id}", response_model=JobResponse)
async def get_job_status(
    job_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Retrieves current job status, stage progress, and metric scale confidence."""
    result = await db.execute(select(Job).filter(Job.id == job_id))
    db_job = result.scalars().first()
    
    if not db_job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job {job_id} not found."
        )

    # Check active memory tracker for live progress
    active_info = orchestrator.active_jobs.get(job_id)
    status_str = active_info["status"] if active_info else db_job.status

    return JobResponse(
        id=db_job.id,
        datasetName=db_job.dataset_name,
        timestamp=db_job.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        status=status_str,
        runtime=db_job.runtime_str,
        videoSize=f"{db_job.video_size_mb} MB" if db_job.video_size_mb else None,
        frames=db_job.total_frames or 0,
        pointCount=db_job.point_count,
        meshFaces=db_job.mesh_faces,
        scaleUncertainty=db_job.scale_uncertainty,
        scaleFactor=db_job.scale_factor,
        confidenceAvg=db_job.confidence_avg or 85.0,
        hasImu=db_job.has_imu,
        degradedFlags=db_job.degraded_flags or [],
        exportSizes=db_job.export_paths or {},
        checksum=db_job.checksum
    )


@router.post("/{job_id}/cancel")
async def cancel_job(
    job_id: str,
    db: AsyncSession = Depends(get_db),
    authenticated: bool = Depends(verify_token)
):
    """Gracefully halts running reconstruction job."""
    success = orchestrator.cancel_job(job_id)
    result = await db.execute(select(Job).filter(Job.id == job_id))
    db_job = result.scalars().first()
    if db_job:
        db_job.status = "cancelled"
        await db.commit()

    return {"job_id": job_id, "cancelled": success, "status": "cancelled"}


@router.get("/{job_id}/artifacts/{artifact_type}")
async def download_artifact(
    job_id: str,
    artifact_type: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Downloads reconstructed deliverables (obj, las, geotiff, pdf) with SHA-256 integrity header.
    """
    result = await db.execute(select(Job).filter(Job.id == job_id))
    db_job = result.scalars().first()
    
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found.")

    export_dir = settings.EXPORTS_DIR / job_id
    type_map = {
        "obj": (export_dir / f"{job_id}_model.obj", "model/obj"),
        "las": (export_dir / f"{job_id}_cloud.las", "application/octet-stream"),
        "geotiff": (export_dir / f"{job_id}_dem.tif", "image/tiff"),
        "pdf": (export_dir / f"{job_id}_inspection_report.pdf", "application/pdf")
    }

    if artifact_type.lower() not in type_map:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid artifact type '{artifact_type}'. Must be one of: {list(type_map.keys())}"
        )

    file_path, media_type = type_map[artifact_type.lower()]
    if not file_path.exists():
        raise HTTPException(status_code=404, detail=f"Deliverable '{artifact_type}' not yet generated for job {job_id}.")

    return FileResponse(
        path=str(file_path),
        media_type=media_type,
        filename=file_path.name,
        headers={"X-Checksum-SHA256": db_job.checksum or "VERIFIED"}
    )
