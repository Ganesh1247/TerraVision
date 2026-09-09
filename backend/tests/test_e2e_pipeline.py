import pytest
import asyncio
from backend.app.pipeline.orchestrator import orchestrator
from backend.app.core.database import init_db, SyncSessionLocal
from backend.app.models.db_models import Job, HotspotRecord

@pytest.mark.asyncio
async def test_end_to_end_reconstruction_pipeline():
    await init_db()
    
    job_id = "TV-TEST-E2E-999"
    dataset_name = "End-to-End Test Substation Flight"
    
    # Create DB entry
    with SyncSessionLocal() as db:
        existing = db.query(Job).filter(Job.id == job_id).first()
        if not existing:
            new_job = Job(
                id=job_id,
                dataset_name=dataset_name,
                status="queued"
            )
            db.add(new_job)
            db.commit()

    # Track progress and partial 3D events
    events_received = []
    def on_progress(p):
        events_received.append(p)

    task = await orchestrator.start_job(
        job_id=job_id,
        dataset_name=dataset_name,
        config={"keyframe_step": 1, "user_reference_dimension": 18.4},
        initial_state={}
    )

    # Wait for pipeline execution to complete
    await task

    # Assertions
    with SyncSessionLocal() as db:
        job = db.query(Job).filter(Job.id == job_id).first()
        assert job is not None
        assert job.status == "completed"
        assert job.scale_factor is not None
        assert job.scale_factor > 0.0
        assert job.scale_confidence is not None
        assert job.scale_uncertainty is not None
        assert job.checksum is not None
        assert len(job.checksum) == 64 # Valid SHA-256

        # Check Hotspots
        hotspots = db.query(HotspotRecord).filter(HotspotRecord.job_id == job_id).all()
        assert len(hotspots) > 0
        for h in hotspots:
            assert h.measurement_confidence > 0.0
            assert h.geometry_confidence > 0.0
            assert h.depth_confidence > 0.0
            assert h.scale_confidence > 0.0
            assert h.uncertainty_m >= 0.0
