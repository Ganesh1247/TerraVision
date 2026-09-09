from pathlib import Path
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "Terra Vision Edge Backend"
    VERSION: str = "1.0.0-edge"
    API_V1_STR: str = "/api/v1"
    
    # Offline Air-Gap Hard Constraint
    AIR_GAP_MODE: bool = True
    ALLOW_ONLINE_FALLBACKS: bool = False
    
    # Storage & Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    STORAGE_DIR: Path = BASE_DIR / "storage"
    UPLOADS_DIR: Path = STORAGE_DIR / "uploads"
    EXPORTS_DIR: Path = STORAGE_DIR / "exports"
    MODELS_DIR: Path = BASE_DIR / "offline_weights"
    TRT_ENGINES_DIR: Path = STORAGE_DIR / "trt_engines"
    
    # Database
    DATABASE_URL: str = f"sqlite+aiosqlite:///{STORAGE_DIR / 'terravision.db'}"
    SQLITE_SYNC_URL: str = f"sqlite:///{STORAGE_DIR / 'terravision.db'}"
    
    # Security
    API_SECRET_TOKEN: str = "terravision-edge-secret-key-sih26158"
    REQUIRE_AUTH: bool = False  # Enabled in field deployments, default false for local
    
    # Pipeline Concurrency & Tuning
    MAX_CONCURRENT_JOBS: int = 2
    KEYFRAME_EXTRACTION_STEP: int = 1  # 1 = every frame, N = every Nth frame
    DEFAULT_OPTICAL_MOTION_THRESHOLD: float = 0.04
    TRT_FP16_ENABLED: bool = True
    TRT_INT8_ENABLED: bool = False  # Enabled when calibration cache is available
    
    # Target Hardware Info (Jetson Orin)
    TARGET_HARDWARE: str = "NVIDIA Jetson AGX Orin / CUDA Edge"

    model_config = {"extra": "ignore", "env_prefix": "TV_", "case_sensitive": True}

settings = Settings()

# Ensure required directories exist
settings.STORAGE_DIR.mkdir(parents=True, exist_ok=True)
settings.UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
settings.EXPORTS_DIR.mkdir(parents=True, exist_ok=True)
settings.MODELS_DIR.mkdir(parents=True, exist_ok=True)
settings.TRT_ENGINES_DIR.mkdir(parents=True, exist_ok=True)
