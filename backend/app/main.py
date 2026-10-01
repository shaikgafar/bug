import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select, func

from app.config import settings
from app.api import api_router
from app.database import AsyncSessionLocal
from app.models.user import User
from app.api.admin import seed_demo_data

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure evidence static folder exists
    static_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "static"))
    evidence_dir = os.path.join(static_dir, "evidence")
    os.makedirs(evidence_dir, exist_ok=True)
    
    # Auto-seed sample data if database is brand new
    try:
        async with AsyncSessionLocal() as session:
            count = (await session.execute(select(func.count(User.id)))).scalar_one() or 0
            if count == 0:
                await seed_demo_data(session)
    except Exception as e:
        print(f"[Lifespan Notice] Auto-seed status: {e}")
        
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Multi-Agent Software Bug Triage Platform powered by 4 specialized AI agents (Triage, Intelligence, Reproduction, Routing).",
    lifespan=lifespan
)

# CORS Middleware
cors_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
]
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    cors_origins.append(frontend_url.rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for screenshot evidence and test artifacts
static_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "static"))
os.makedirs(static_path, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_path), name="static")

# Mount API routes
app.include_router(api_router, prefix=settings.API_PREFIX)

@app.get("/")
async def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs_url": "/docs",
        "api_prefix": settings.API_PREFIX,
        "agents": [
            "Triage Agent",
            "Intelligence Agent",
            "Reproduction Agent",
            "Routing & Analysis Agent"
        ]
    }
