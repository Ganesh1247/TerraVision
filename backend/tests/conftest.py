# ==============================================================================
# conftest.py — Shared pytest fixtures for TerraVision test suite
# Provides async-capable DB setup, temp directories, and common mocks.
# ==============================================================================

import pytest
import asyncio
import tempfile
from pathlib import Path


# ── Event loop policy for asyncio tests ───────────────────────────────────────
@pytest.fixture(scope="session")
def event_loop_policy():
    """Use the default event loop policy for all async tests."""
    return asyncio.DefaultEventLoopPolicy()


# ── Temporary working directory ───────────────────────────────────────────────
@pytest.fixture
def tmp_workspace(tmp_path: Path) -> Path:
    """Provides a fresh temporary directory for each test."""
    workspace = tmp_path / "tv_workspace"
    workspace.mkdir(parents=True, exist_ok=True)
    return workspace


# ── Shared minimal job config ─────────────────────────────────────────────────
@pytest.fixture
def minimal_job_config() -> dict:
    """Minimal pipeline configuration suitable for fast unit tests."""
    return {
        "keyframe_step": 5,
        "user_reference_dimension": 18.4,
        "scale_recovery_mode": "monocular",
    }


# ── DB initialisation fixture (async) ────────────────────────────────────────
@pytest.fixture(scope="session", autouse=True)
async def init_test_database():
    """
    Initialize the SQLite test database once per test session.
    Uses an in-memory or temp file path so tests are fully isolated.
    """
    from backend.app.core.database import init_db
    await init_db()
    yield
