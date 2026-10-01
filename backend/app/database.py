import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import create_engine
from app.config import settings

# Determine async vs sync URLs
raw_db_url = settings.DATABASE_URL
if raw_db_url.startswith("postgres://"):
    raw_db_url = raw_db_url.replace("postgres://", "postgresql://", 1)

if raw_db_url.startswith("postgresql://"):
    async_db_url = raw_db_url.replace("postgresql://", "postgresql+asyncpg://")
    sync_db_url = raw_db_url
elif raw_db_url.startswith("sqlite"):
    if "aiosqlite" not in raw_db_url:
        async_db_url = raw_db_url.replace("sqlite:///", "sqlite+aiosqlite:///")
    else:
        async_db_url = raw_db_url
    sync_db_url = async_db_url.replace("sqlite+aiosqlite:///", "sqlite:///")
else:
    async_db_url = raw_db_url
    sync_db_url = raw_db_url

# Async Engine and Session
connect_args = {"check_same_thread": False} if "sqlite" in async_db_url else {}

async_engine = create_async_engine(
    async_db_url,
    echo=False,
    connect_args=connect_args,
    future=True
)

AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

# Sync Engine and Session (useful for seeding, tests, and Alembic)
sync_engine = create_engine(
    sync_db_url,
    connect_args=connect_args,
    future=True
)
SyncSessionLocal = sessionmaker(bind=sync_engine, autoflush=False, autocommit=False)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
