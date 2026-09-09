import pytest
import numpy as np
import tempfile
import csv
from pathlib import Path
from backend.app.pipeline.stages.s1_ingestion import IngestionStage
from backend.app.pipeline.stages.base import StageContext

@pytest.mark.asyncio
async def test_synthetic_drone_ingestion():
    stage = IngestionStage()
    ctx = StageContext(
        job_id="TEST-001",
        dataset_name="Test Substation",
        config={"keyframe_step": 1},
        shared_state={}
    )
    result = await stage.run(ctx)
    assert result["status"] == "complete"
    assert "keyframes" in ctx.shared_state
    assert len(ctx.shared_state["keyframes"]) > 0
    assert ctx.shared_state["total_frames"] == len(ctx.shared_state["keyframes"])

@pytest.mark.asyncio
async def test_imu_csv_parser():
    stage = IngestionStage()
    with tempfile.NamedTemporaryFile("w", delete=False, suffix=".csv") as f:
        writer = csv.writer(f)
        writer.writerow(["timestamp", "ax", "ay", "az", "gx", "gy", "gz"])
        writer.writerow(["0.005", "0.01", "0.02", "9.81", "0.001", "0.002", "0.003"])
        writer.writerow(["0.010", "0.02", "0.01", "9.80", "0.001", "0.001", "0.002"])
        csv_path = Path(f.name)

    ctx = StageContext(
        job_id="TEST-002",
        dataset_name="Test IMU",
        config={},
        shared_state={"imu_path": str(csv_path)}
    )
    result = await stage.run(ctx)
    assert result["status"] == "complete"
    assert ctx.shared_state["has_imu"] is True
    assert len(ctx.shared_state["imu_telemetry"]) == 2
    csv_path.unlink()
