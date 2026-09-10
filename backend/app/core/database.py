from sqlalchemy import create_engine, event
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from backend.app.config import settings
from backend.app.core.logger import logger

Base = declarative_base()

# Async Engine for FastAPI Routes
async_engine = create_async_engine(settings.DATABASE_URL, echo=False, future=True)

AsyncSessionLocal = async_sessionmaker(bind=async_engine, class_=AsyncSession, expire_on_commit=False)

# Sync Engine for Background Workers & Migrations
sync_engine = create_engine(settings.SQLITE_SYNC_URL, echo=False, connect_args={"check_same_thread": False})


# Enable SQLite Write-Ahead Logging (WAL) for high concurrency
@event.listens_for(sync_engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.execute("PRAGMA synchronous=NORMAL")
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


SyncSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)


async def init_db():
    """Initializes SQLite database tables with WAL mode."""
    # Ensure sync engine tables are created
    Base.metadata.create_all(sync_engine)
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("SQLite database tables initialized successfully (WAL mode active).")


async def get_db():
    """Async database session dependency for FastAPI routes."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
