import asyncio
import time
from abc import ABC, abstractmethod
from collections.abc import Callable
from dataclasses import dataclass, field
from typing import Any

from backend.app.core.logger import current_job_id, current_stage_name, logger
from backend.app.core.metrics import metrics_tracker


@dataclass
class StageContext:
    job_id: str
    dataset_name: str
    config: dict[str, Any] = field(default_factory=dict)
    shared_state: dict[str, Any] = field(default_factory=dict)
    event_callback: Callable[[dict[str, Any]], Any] | None = None
    log_callback: Callable[[str, str, str], Any] | None = None
    partial_3d_callback: Callable[[dict[str, Any]], Any] | None = None
    is_cancelled: bool = False

    def emit_log(self, tag: str, message: str, level: str = "info"):
        current_job_id.set(self.job_id)
        if level == "error":
            logger.error(f"[{tag}] {message}")
        elif level == "warning":
            logger.warning(f"[{tag}] {message}")
        else:
            logger.info(f"[{tag}] {message}")

        if self.log_callback:
            try:
                self.log_callback(tag, message, level)
            except Exception as e:
                logger.error(f"Failed to execute log callback: {e}")

    def emit_progress(self, stage_id: str, stage_name: str, stage_progress: int, current_action: str):
        if self.event_callback:
            try:
                self.event_callback({
                    "stage_id": stage_id,
                    "stage_name": stage_name,
                    "stage_progress": stage_progress,
                    "current_action": current_action,
                })
            except Exception as e:
                logger.error(f"Failed to execute progress callback: {e}")

    def emit_partial_3d(self, payload: dict[str, Any]):
        if self.partial_3d_callback:
            try:
                self.partial_3d_callback(payload)
            except Exception as e:
                logger.error(f"Failed to execute 3d stream callback: {e}")


class BasePipelineStage(ABC):
    """Abstract base class for all concurrent pipeline stages."""

    def __init__(self, stage_id: str, stage_index: int, stage_name: str, normal_throughput: str):
        self.stage_id = stage_id
        self.stage_index = stage_index
        self.stage_name = stage_name
        self.normal_throughput = normal_throughput

    async def run(self, ctx: StageContext) -> dict[str, Any]:
        """Wraps stage execution with structured logging, timing, and error boundaries."""
        current_job_id.set(ctx.job_id)
        current_stage_name.set(self.stage_name.upper().replace(" ", "_"))

        ctx.emit_log("STAGE_START", f"Starting Stage {self.stage_index + 1}/9: [{self.stage_name}]", "info")
        t0 = time.perf_counter()

        try:
            if ctx.is_cancelled:
                raise asyncio.CancelledError("Job was cancelled by operator.")

            result = await self.execute(ctx)
            duration_sec = time.perf_counter() - t0

            throughput = result.get("throughput", self.normal_throughput)
            metrics_tracker.record_stage_run(self.stage_id, duration_sec, throughput_val=1.0, error=False)

            ctx.emit_log(
                self.stage_name.upper().replace(" ", "_"),
                f"Stage {self.stage_index + 1}/9 [{self.stage_name}] completed in {duration_sec:.2f}s ({throughput}).",
                "success",
            )

            return {
                "status": "complete",
                "duration_sec": duration_sec,
                "duration_str": f"{duration_sec:.1f}s",
                "throughput": throughput,
                "data": result,
            }

        except Exception as exc:
            duration_sec = time.perf_counter() - t0
            metrics_tracker.record_stage_run(self.stage_id, duration_sec, throughput_val=0.0, error=True)
            ctx.emit_log("STAGE_FAIL", f"Stage [{self.stage_name}] failed: {str(exc)}", "error")
            logger.exception(f"Unhandled error in pipeline stage [{self.stage_name}]")
            raise

    @abstractmethod
    async def execute(self, ctx: StageContext) -> dict[str, Any]:
        """Concrete execution logic for this stage."""
