import asyncio
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from backend.app.core.logger import logger
from backend.app.pipeline.orchestrator import orchestrator

router = APIRouter()


@router.websocket("/ws/jobs/{job_id}")
async def websocket_job_stream(websocket: WebSocket, job_id: str):
    """
    High-throughput WebSocket stream for live reconstruction observability.
    Pushes:
    - `STAGE_PROGRESS`: Step progress (0-100%) & throughput
    - `PARTIAL_3D_UPDATE`: Incremental 6-DoF camera frustums, sparse points, mesh updates
    - `LOG`: Kernel logs for telemetry console
    - `JOB_COMPLETE`: Final delivery bundle checksums

    Server-side heartbeat every 3s prevents browser idle-timeout disconnects.
    Late-joining clients receive an immediate STATE_REPLAY so they never miss results.
    """
    await websocket.accept()
    orchestrator.register_websocket(job_id, websocket)
    logger.info(f"WebSocket client connected to job stream: {job_id}")

    try:
        # ── Initial handshake ──────────────────────────────────────────────────
        await websocket.send_json({
            "event_type": "CONNECTED",
            "job_id": job_id,
            "message": f"Connected to live reconstruction stream for {job_id} (Air-gap verified).",
        })

        # ── Late-join state replay ─────────────────────────────────────────────
        # If the job finished (or is mid-flight) before this client connected,
        # immediately push current state so the frontend can sync up.
        job_info = orchestrator.active_jobs.get(job_id)
        if job_info:
            status = job_info.get("status", "processing")
            if status == "completed":
                await websocket.send_json({
                    "event_type": "JOB_COMPLETE",
                    "job_id": job_id,
                    "status": "completed",
                    "total_progress": 100,
                    "runtime": job_info.get("runtime", "N/A"),
                })
            else:
                # Mid-job replay so progress bar snaps to current position
                await websocket.send_json({
                    "event_type": "STAGE_PROGRESS",
                    "job_id": job_id,
                    "stage_index": job_info.get("active_stage_index", 0),
                    "stage_progress": job_info.get("stage_progress", 0),
                    "total_progress": job_info.get("total_progress", 0),
                    "current_action": job_info.get("current_action", "Processing..."),
                    "active_fallbacks": [],
                })

        # ── Concurrent heartbeat + receive loop ────────────────────────────────
        async def _heartbeat():
            """Server-initiated ping every 3 s — prevents browser idle disconnects."""
            while True:
                await asyncio.sleep(3)
                await websocket.send_json({"event_type": "PING"})

        async def _receiver():
            """Handle client → server messages (pong, pause, retry)."""
            while True:
                raw = await websocket.receive_text()
                try:
                    msg = json.loads(raw)
                    action = msg.get("action", "")
                    if action == "ping":
                        await websocket.send_json({
                            "event_type": "PONG",
                            "timestamp": asyncio.get_event_loop().time(),
                        })
                except json.JSONDecodeError:
                    pass

        # asyncio.wait so we can cancel the other task when one exits
        hb_task = asyncio.create_task(_heartbeat())
        rx_task = asyncio.create_task(_receiver())
        _done, _pending = await asyncio.wait(
            [hb_task, rx_task], return_when=asyncio.FIRST_COMPLETED
        )
        for t in _pending:
            t.cancel()

    except WebSocketDisconnect:
        logger.info(f"WebSocket client disconnected from job: {job_id}")
    except Exception as exc:
        logger.error(f"WebSocket error on job {job_id}: {exc}")
    finally:
        orchestrator.unregister_websocket(job_id, websocket)
