import pytest
import numpy as np
from backend.app.pipeline.stages.s5_sfm import SfMStage
from backend.app.pipeline.stages.base import StageContext

@pytest.mark.asyncio
async def test_incremental_sfm_triangulation():
    # Pose 1 and Pose 2 with synthetic match points
    pose1 = {"frame_index": 0, "quaternion": [0, 0, 0, 1], "position": [0, 0, 10]}
    pose2 = {"frame_index": 1, "quaternion": [0, 0, 0, 1], "position": [1, 0, 10]}
    
    pts1 = np.array([[100, 100], [200, 100], [150, 200], [250, 200], [180, 150]], dtype=np.float32)
    pts2 = np.array([[95, 100], [195, 100], [145, 200], [245, 200], [175, 150]], dtype=np.float32)
    
    ctx = StageContext(
        job_id="TEST-007",
        dataset_name="Test SfM",
        config={},
        shared_state={
            "camera_poses": [pose1, pose2],
            "frame_matches": [{"pts1": pts1, "pts2": pts2}],
            "keyframes": [np.zeros((240, 320, 3), dtype=np.uint8), np.zeros((240, 320, 3), dtype=np.uint8)]
        }
    )

    stage = SfMStage()
    result = await stage.run(ctx)
    assert result["status"] == "complete"
    assert "sparse_points" in ctx.shared_state
    assert len(ctx.shared_state["sparse_points"]) > 0

@pytest.mark.asyncio
async def test_sfm_midas_monocular_depth_fallback():
    pose1 = {"frame_index": 0, "quaternion": [0, 0, 0, 1], "position": [0, 0, 10]}
    pose2 = {"frame_index": 1, "quaternion": [0, 0, 0, 1], "position": [0.01, 0, 10]} # tiny baseline
    
    ctx = StageContext(
        job_id="TEST-008",
        dataset_name="Test Single Angle",
        config={"force_sparse_overlap": True},
        shared_state={
            "camera_poses": [pose1, pose2],
            "frame_matches": [],
            "keyframes": [np.zeros((240, 320, 3), dtype=np.uint8), np.zeros((240, 320, 3), dtype=np.uint8)]
        }
    )

    stage = SfMStage()
    result = await stage.run(ctx)
    assert result["status"] == "complete"
    assert ctx.shared_state["mono_depth_fallback_used"] is True
    assert "mono_depth" in ctx.shared_state.get("active_fallbacks", [])
