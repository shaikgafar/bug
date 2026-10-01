from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.bugs import router as bugs_router
from app.api.triage import router as triage_router
from app.api.admin import router as admin_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(bugs_router)
api_router.include_router(triage_router)
api_router.include_router(admin_router)

__all__ = ["api_router"]
