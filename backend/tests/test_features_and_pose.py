import pytest
import numpy as np
import cv2
from backend.app.pipeline.stages.s3_feature_extraction import FeatureExtractionStage
from backend.app.pipeline.stages.s4_pose_estimation import PoseEstimationStage
from backend.app.pipeline.stages.base import StageContext

@pytest.mark.asyncio
async def test_feature_extraction_and_pose():
    # Create two textured frames
    f1 = np.zeros((240, 320, 3), dtype=np.uint8)
    f2 = np.zeros((240, 320, 3), dtype=np.uint8)
    for x in range(20, 300, 30):
        for y in range(20, 220, 30):
            cv2.circle(f1, (x, y), 5, (255, 255, 255), -1)
            cv2.circle(f2, (x + 2, y), 5, (255, 255, 255), -1)

    ctx = StageContext(
        job_id="TEST-005",
        dataset_name="Test VO",
        config={},
        shared_state={"keyframes": [f1, f2], "enhanced_frames": [f1, f2]}
    )

    feat_stage = FeatureExtractionStage()
    feat_res = await feat_stage.run(ctx)
    assert feat_res["status"] == "complete"
    assert "keypoints" in ctx.shared_state
    assert len(ctx.shared_state["keypoints"]) == 2

    pose_stage = PoseEstimationStage()
    pose_res = await pose_stage.run(ctx)
    assert pose_res["status"] == "complete"
    assert "camera_poses" in ctx.shared_state
    assert len(ctx.shared_state["camera_poses"]) == 2
