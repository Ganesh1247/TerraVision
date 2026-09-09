import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from backend.app.config import settings
from backend.app.core.logger import logger
from backend.app.core.database import init_db
from backend.app.api.routes import api_router
from backend.app.api.routes.stream import router as stream_router
from backend.app.api.routes.health import router as health_router
from backend.app.api.routes.metrics import router as metrics_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize SQLite WAL and offline directories
    logger.info(f"Starting {settings.PROJECT_NAME} (v{settings.VERSION})...")
    logger.info("Air-gap verification: Hard constraint active (Zero external cloud calls).")
    await init_db()
    yield
    # Shutdown
    logger.info(f"Stopping {settings.PROJECT_NAME} daemon...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Edge-ready offline drone video 3D reconstruction system (SIH26158 NTRO).",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Timing & Error Boundary Middleware
@app.middleware("http")
async def request_timing_and_error_boundary(request: Request, call_next):
    t0 = time.perf_counter()
    try:
        response = await call_next(request)
        elapsed_ms = (time.perf_counter() - t0) * 1000.0
        response.headers["X-Response-Time-MS"] = f"{elapsed_ms:.2f}"
        return response
    except Exception as exc:
        logger.exception(f"Unhandled server error on path {request.url.path}: {exc}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "Internal Processing Error",
                "detail": str(exc),
                "path": request.url.path,
                "timestamp": time.time()
            }
        )

# Mount API Routers
app.include_router(health_router)
app.include_router(metrics_router)
app.include_router(stream_router)
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root_index():
    return {
        "system": "Terra Vision Edge Reconstruction Backend",
        "version": settings.VERSION,
        "mode": "100% Offline (GPS-Free)",
        "hardware_target": settings.TARGET_HARDWARE,
        "docs_url": "/docs",
        "health_url": "/health",
        "metrics_url": "/metrics"
    }
