import time
from collections import defaultdict
from typing import Any

import psutil


class LocalMetricsTracker:
    """Thread-safe in-memory metrics tracker for edge hardware and pipeline stages."""

    def __init__(self):
        self.stage_durations: dict[str, list[float]] = defaultdict(list)
        self.stage_throughputs: dict[str, list[float]] = defaultdict(list)
        self.stage_errors: dict[str, int] = defaultdict(int)
        self.total_jobs_processed: int = 0
        self.total_jobs_failed: int = 0
        self.start_time: float = time.time()

    def record_stage_run(
        self, stage_name: str, duration_sec: float, throughput_val: float = 0.0, error: bool = False
    ):
        self.stage_durations[stage_name].append(duration_sec)
        if throughput_val > 0:
            self.stage_throughputs[stage_name].append(throughput_val)
        if error:
            self.stage_errors[stage_name] += 1

    def record_job_completion(self, success: bool):
        self.total_jobs_processed += 1
        if not success:
            self.total_jobs_failed += 1

    def get_summary(self) -> dict[str, Any]:
        uptime_sec = round(time.time() - self.start_time, 1)

        # Collect system resource utilization
        cpu_pct = psutil.cpu_percent(interval=None)
        mem = psutil.virtual_memory()
        disk = psutil.disk_usage("/")

        stages_summary = {}
        for stage, durations in self.stage_durations.items():
            avg_dur = round(sum(durations) / len(durations), 3) if durations else 0.0
            tp_list = self.stage_throughputs.get(stage, [])
            avg_tp = round(sum(tp_list) / len(tp_list), 1) if tp_list else 0.0
            stages_summary[stage] = {
                "invocations": len(durations),
                "avg_duration_sec": avg_dur,
                "latest_duration_sec": round(durations[-1], 3) if durations else 0.0,
                "avg_throughput": avg_tp,
                "errors": self.stage_errors.get(stage, 0),
            }

        return {
            "uptime_seconds": uptime_sec,
            "jobs_total": self.total_jobs_processed,
            "jobs_failed": self.total_jobs_failed,
            "system_resources": {
                "cpu_percent": cpu_pct,
                "ram_used_mb": round((mem.total - mem.available) / (1024 * 1024), 1),
                "ram_total_mb": round(mem.total / (1024 * 1024), 1),
                "ram_percent": mem.percent,
                "disk_free_gb": round(disk.free / (1024 * 1024 * 1024), 2),
                "disk_percent": disk.percent,
            },
            "stages": stages_summary,
        }


metrics_tracker = LocalMetricsTracker()
