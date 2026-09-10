import numpy as np
import pytest

from backend.app.pipeline.stages.base import StageContext
from backend.app.pipeline.stages.s6_scale_recovery import ScaleRecoveryStage


@pytest.mark.asyncio
async def test_scale_recovery_cues_fusion():
    # 3D points forming a ground plane plus raised structures
    points = []
    for x in np.linspace(-10, 10, 20):
        for y in np.linspace(-10, 10, 20):
            points.append([x, y, 0.0])  # ground
    for _ in range(50):
        points.append([np.random.uniform(-5, 5), np.random.uniform(-5, 5), np.random.uniform(2, 8)])

    ctx = StageContext(
        job_id="TEST-006",
        dataset_name="Test Scale",
        config={"user_reference_dimension": 18.4},
        shared_state={
            "sparse_points": points,
            "keyframes": [np.zeros((100, 100, 3), dtype=np.uint8)],
            "has_imu": True,
            "imu_telemetry": [{"ax": 0.0, "ay": 0.0, "az": 9.81}],
        },
    )

    stage = ScaleRecoveryStage()
    result = await stage.run(ctx)
    assert result["status"] == "complete"
    assert "scale_factor" in ctx.shared_state
    assert 0.7 <= ctx.shared_state["scale_factor"] <= 1.3
    assert ctx.shared_state["scale_confidence"] >= 70.0
    assert "±" in ctx.shared_state["scale_uncertainty"]
