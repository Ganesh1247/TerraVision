import numpy as np
import pytest

from backend.app.pipeline.stages.base import StageContext
from backend.app.pipeline.stages.s2_preprocessing import PreprocessingStage


@pytest.mark.asyncio
async def test_adaptive_preprocessing_normal_pass():
    stage = PreprocessingStage()
    dummy_frame = np.full((120, 160, 3), 128, dtype=np.uint8)
    ctx = StageContext(
        job_id="TEST-003",
        dataset_name="Test Preproc",
        config={},
        shared_state={"keyframes": [dummy_frame]},
    )
    result = await stage.run(ctx)
    assert result["status"] == "complete"
    assert "enhanced_frames" in ctx.shared_state
    assert len(ctx.shared_state["enhanced_frames"]) == 1


@pytest.mark.asyncio
async def test_low_light_enhancement_trigger():
    stage = PreprocessingStage()
    dark_frame = np.full((120, 160, 3), 15, dtype=np.uint8)  # Dark
    ctx = StageContext(
        job_id="TEST-004",
        dataset_name="Test Dark",
        config={"force_low_light": True},
        shared_state={"keyframes": [dark_frame]},
    )
    result = await stage.run(ctx)
    assert result["status"] == "complete"
    assert "low_light" in ctx.shared_state.get("active_fallbacks", [])
    enhanced = ctx.shared_state["enhanced_frames"][0]
    assert np.mean(enhanced) > np.mean(dark_frame)
