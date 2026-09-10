import asyncio
import time
from datetime import datetime, timezone
from typing import Any

from fastapi import WebSocket

from backend.app.core.database import SyncSessionLocal
from backend.app.core.logger import logger
from backend.app.models.db_models import HotspotRecord, Job
from backend.app.pipeline.stages import (
    DenseReconstructionStage,
    FeatureExtractionStage,
    IngestionStage,
    LiveDeliveryStage,
    PoseEstimationStage,
    PreprocessingStage,
    ScaleRecoveryStage,
    ScaleValidationStage,
    SfMStage,
    StageContext,
)


class PipelineOrchestrator:
    """Pipelined Concurrent Orchestrator for Terra Vision Edge Backend.

    Manages job lifecycle, runs asynchronous pipeline stages, connects stages via queues,
    and streams live 3D updates & stage progress to connected WebSocket clients.
    """

    def __init__(self):
        self.active_jobs: dict[str, dict[str, Any]] = {}
        self.active_websockets: dict[str, set[WebSocket]] = {}
        self.stage_instances = [
            IngestionStage(),
            PreprocessingStage(),
            FeatureExtractionStage(),
            PoseEstimationStage(),
            SfMStage(),
            ScaleRecoveryStage(),
            ScaleValidationStage(),
            DenseReconstructionStage(),
            LiveDeliveryStage(),
        ]

    def register_websocket(self, job_id: str, ws: WebSocket):
        if job_id not in self.active_websockets:
            self.active_websockets[job_id] = set()
        self.active_websockets[job_id].add(ws)

    def unregister_websocket(self, job_id: str, ws: WebSocket):
        if job_id in self.active_websockets:
            self.active_websockets[job_id].discard(ws)
            if not self.active_websockets[job_id]:
                del self.active_websockets[job_id]

    def get_job_state(self, job_id: str) -> dict | None:
        """Returns a snapshot of the current job state for late-joining WebSocket clients."""
        return self.active_jobs.get(job_id)

    async def broadcast_to_job(self, job_id: str, message: dict[str, Any]):
        if job_id in self.active_websockets:
            dead_sockets = set()
            for ws in self.active_websockets[job_id]:
                try:
                    await ws.send_json(message)
                except Exception:
                    dead_sockets.add(ws)
            for dead in dead_sockets:
                self.active_websockets[job_id].discard(dead)

    async def start_job(
        self,
        job_id: str,
        dataset_name: str,
        config: dict[str, Any],
        initial_state: dict[str, Any] | None = None,
    ):
        """Launches pipeline execution as a background asyncio task."""
        task = asyncio.create_task(self._run_pipeline(job_id, dataset_name, config, initial_state or {}))
        self.active_jobs[job_id] = {
            "task": task,
            "status": "processing",
            "active_stage_index": 0,
            "stage_progress": 0,
            "total_progress": 0,
            "current_action": "Pipeline initialized.",
            "start_time": time.time(),
            "context": None,
        }
        return task

    def cancel_job(self, job_id: str) -> bool:
        job_info = self.active_jobs.get(job_id)
        if job_info and job_info.get("task"):
            job_info["task"].cancel()
            if job_info.get("context"):
                job_info["context"].is_cancelled = True
            job_info["status"] = "cancelled"
            logger.info(f"Job {job_id} cancelled by operator.")
            return True
        return False

    async def _run_pipeline(
        self,
        job_id: str,
        dataset_name: str,
        config: dict[str, Any],
        initial_state: dict[str, Any],
    ):
        t_start = time.time()

        # Callbacks for live event streaming
        def handle_progress(prog_data: dict[str, Any]):
            stage_idx = next((i for i, s in enumerate(self.stage_instances) if s.stage_id == prog_data["stage_id"]), 0)
            stage_prog = prog_data["stage_progress"]
            total_prog = int(((stage_idx * 100) + stage_prog) / len(self.stage_instances))

            if job_id in self.active_jobs:
                self.active_jobs[job_id]["active_stage_index"] = stage_idx
                self.active_jobs[job_id]["stage_progress"] = stage_prog
                self.active_jobs[job_id]["total_progress"] = total_prog
                self.active_jobs[job_id]["current_action"] = prog_data["current_action"]

            asyncio.create_task(
                self.broadcast_to_job(
                    job_id,
                    {
                        "event_type": "STAGE_PROGRESS",
                        "job_id": job_id,
                        "stage_index": stage_idx,
                        "stage_id": prog_data["stage_id"],
                        "stage_name": prog_data["stage_name"],
                        "stage_progress": stage_prog,
                        "total_progress": total_prog,
                        "current_action": prog_data["current_action"],
                        "active_fallbacks": ctx.shared_state.get("active_fallbacks", []),
                    },
                )
            )

        def handle_log(tag: str, message: str, level: str):
            ts = datetime.now(timezone.utc).strftime("%H:%M:%S.%f")[:-3]
            asyncio.create_task(
                self.broadcast_to_job(
                    job_id,
                    {
                        "event_type": "LOG",
                        "timestamp": ts,
                        "tag": tag,
                        "message": message,
                        "level": level,
                    },
                )
            )

        def handle_partial_3d(partial_data: dict[str, Any]):
            payload = {
                "event_type": "PARTIAL_3D_UPDATE",
                "job_id": job_id,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                **partial_data,
            }
            asyncio.create_task(self.broadcast_to_job(job_id, payload))

        ctx = StageContext(
            job_id=job_id,
            dataset_name=dataset_name,
            config=config,
            shared_state=initial_state,
            event_callback=handle_progress,
            log_callback=handle_log,
            partial_3d_callback=handle_partial_3d,
        )
        if job_id in self.active_jobs:
            self.active_jobs[job_id]["context"] = ctx

        # Update DB Job Status to processing
        with SyncSessionLocal() as db:
            db_job = db.query(Job).filter(Job.id == job_id).first()
            if db_job:
                db_job.status = "processing"
                db_job.started_at = datetime.now(timezone.utc)
                db.commit()

        # Sequential Execution of Concurrent Stage Wrappers
        stage_records = []
        try:
            for stage in self.stage_instances:
                if ctx.is_cancelled:
                    raise asyncio.CancelledError()

                # Check for simulated failure toggle if requested
                if config.get("force_simulate_failure") and stage.stage_id == "sfm":
                    await asyncio.sleep(0.5)
                    raise RuntimeError(
                        "High epipolar residual divergence (0.94px > 0.60px threshold). Epipolar geometry ambiguous."
                    )

                stage_result = await stage.run(ctx)
                stage_records.append({
                    "stage_id": stage.stage_id,
                    "stage_name": stage.stage_name,
                    "status": "complete",
                    "duration": stage_result["duration_str"],
                    "throughput": stage_result["throughput"],
                    "error": None,
                })

                # Small yield for async event loop dispatch
                await asyncio.sleep(0.01)

            # Mark Job Completed
            total_runtime_sec = time.time() - t_start
            mins, secs = divmod(int(total_runtime_sec), 60)
            runtime_str = f"{mins:02d}m {secs:02d}s"

            with SyncSessionLocal() as db:
                db_job = db.query(Job).filter(Job.id == job_id).first()
                if db_job:
                    db_job.status = "completed"
                    db_job.runtime_str = runtime_str
                    db_job.completed_at = datetime.now(timezone.utc)
                    db_job.has_imu = ctx.shared_state.get("has_imu", False)
                    db_job.total_frames = ctx.shared_state.get("total_frames", 0)
                    db_job.scale_factor = ctx.shared_state.get("scale_factor", 1.0)
                    db_job.scale_confidence = ctx.shared_state.get("scale_confidence", 85.0)
                    db_job.scale_uncertainty = ctx.shared_state.get("scale_uncertainty", "± 0.012 m")
                    db_job.uncertainty_m = ctx.shared_state.get("uncertainty_m", 0.012)
                    db_job.point_count = ctx.shared_state.get("point_count_str", "1,420,000 pts")
                    db_job.mesh_faces = ctx.shared_state.get("mesh_faces_str", "280,000 faces")
                    db_job.confidence_avg = ctx.shared_state.get("confidence_avg", 85.0)
                    db_job.degraded_flags = ctx.shared_state.get("degraded_flags", [])
                    db_job.export_paths = ctx.shared_state.get("export_paths", {})
                    db_job.checksum = ctx.shared_state.get("checksum", "")

                    # Save hotspots
                    for h_dict in ctx.shared_state.get("hotspots", []):
                        meas = h_dict.get("measurement", {})
                        conf = h_dict.get("confidence", {})
                        h_rec = HotspotRecord(
                            id=f"{job_id}_{h_dict['id']}",
                            job_id=job_id,
                            title=h_dict["title"],
                            category=h_dict["category"],
                            position=h_dict.get("position", [0, 0, 0]),
                            measurement_type=meas.get("type", "Estimated Height"),
                            measurement_value=meas.get("value", 0.0),
                            measurement_unit=meas.get("unit", "m"),
                            uncertainty_m=meas.get("uncertainty", 0.0),
                            secondary_metric=meas.get("secondaryMetric", {}),
                            geometry_confidence=conf.get("geometry", 85) / 100.0,
                            depth_confidence=conf.get("depth", 85) / 100.0,
                            scale_confidence=conf.get("scale", 85) / 100.0,
                            semantic_confidence=conf.get("semantic", 85) / 100.0,
                            measurement_confidence=conf.get("measurement", 85) / 100.0,
                            quality_assessment=h_dict.get("qualityAssessment", "High Confidence"),
                            status_color=h_dict.get("statusColor", "emerald"),
                            explanation=h_dict.get("explanation"),
                            recommended_action=h_dict.get("recommendedAction"),
                        )
                        db.add(h_rec)

                    db.commit()

            if job_id in self.active_jobs:
                self.active_jobs[job_id]["status"] = "completed"
                self.active_jobs[job_id]["total_progress"] = 100
                self.active_jobs[job_id]["runtime"] = runtime_str

            await self.broadcast_to_job(
                job_id,
                {
                    "event_type": "JOB_COMPLETE",
                    "job_id": job_id,
                    "runtime": runtime_str,
                    "status": "completed",
                    "total_progress": 100,
                },
            )

        except Exception as exc:
            logger.error(f"Pipeline error for job {job_id}: {exc}")
            with SyncSessionLocal() as db:
                db_job = db.query(Job).filter(Job.id == job_id).first()
                if db_job:
                    db_job.status = "failed"
                    db_job.error_reason = str(exc)
                    db.commit()

            if job_id in self.active_jobs:
                self.active_jobs[job_id]["status"] = "failed"

            await self.broadcast_to_job(
                job_id,
                {
                    "event_type": "JOB_ERROR",
                    "job_id": job_id,
                    "error": str(exc),
                    "status": "failed",
                },
            )


orchestrator = PipelineOrchestrator()
