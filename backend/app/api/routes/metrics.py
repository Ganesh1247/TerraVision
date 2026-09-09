from fastapi import APIRouter
from backend.app.core.metrics import metrics_tracker
from backend.app.models.schemas import MetricsResponse

router = APIRouter()

@router.get("/metrics", response_model=MetricsResponse)
async def get_system_metrics():
    """
    Returns edge kernel observability metrics:
    - Processing duration per stage
    - Average throughput (fps, MP/s, pts/s)
    - Error rates & hardware resource utilization
    """
    return metrics_tracker.get_summary()
