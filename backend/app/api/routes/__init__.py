from fastapi import APIRouter

from .confidence import router as confidence_router
from .health import router as health_router
from .history import router as history_router
from .jobs import router as jobs_router
from .metrics import router as metrics_router

api_router = APIRouter()

api_router.include_router(jobs_router, prefix="/jobs", tags=["Jobs"])
api_router.include_router(confidence_router, prefix="/jobs", tags=["Confidence"])
api_router.include_router(history_router, prefix="/history", tags=["History"])
api_router.include_router(health_router, tags=["Health"])
api_router.include_router(metrics_router, tags=["Metrics"])
