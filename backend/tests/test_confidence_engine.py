import pytest
from backend.app.pipeline.stages.s7_scale_validation import ScaleValidationStage
from backend.app.pipeline.stages.base import StageContext

@pytest.mark.asyncio
async def test_5d_confidence_matrix_generation():
    ctx = StageContext(
        job_id="TEST-009",
        dataset_name="Substation Mission",
        config={},
        shared_state={
            "scale_factor": 0.985,
            "scale_confidence": 94.2,
            "uncertainty_m": 0.012,
            "mono_depth_fallback_used": False,
            "has_imu": True
        }
    )

    stage = ScaleValidationStage()
    result = await stage.run(ctx)
    assert result["status"] == "complete"
    assert "hotspots" in ctx.shared_state
    hotspots = ctx.shared_state["hotspots"]
    assert len(hotspots) == 4

    # Verify 5 independent confidence dimensions exist on each hotspot
    first_hs = hotspots[0]
    assert "geometry_confidence" in first_hs
    assert "depth_confidence" in first_hs
    assert "scale_confidence" in first_hs
    assert "semantic_confidence" in first_hs
    assert "measurement_confidence" in first_hs
    assert "estimated_dimension_m" in first_hs
    assert "uncertainty_m" in first_hs
    assert first_hs["measurement_confidence"] >= 0.70
