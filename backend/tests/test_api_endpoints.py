import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from backend.app.core.database import init_db

@pytest.mark.asyncio
async def test_health_endpoint():
    await init_db()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["air_gap_verified"] is True
        assert data["gps_signals_blocked"] is True
        assert "gpu_available" in data

@pytest.mark.asyncio
async def test_metrics_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/metrics")
        assert resp.status_code == 200
        data = resp.json()
        assert "uptime_seconds" in data
        assert "system_resources" in data

@pytest.mark.asyncio
async def test_job_upload_and_status():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Submit job with form data
        resp = await client.post(
            "/api/v1/jobs/upload",
            data={"dataset_name": "Automated Test Flight"}
        )
        assert resp.status_code == 201
        job_data = resp.json()
        job_id = job_data["id"]
        assert job_id.startswith("TV-")

        # Query job status
        status_resp = await client.get(f"/api/v1/jobs/{job_id}")
        assert status_resp.status_code == 200
        status_data = status_resp.json()
        assert status_data["id"] == job_id
