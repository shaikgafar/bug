import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.bug import Bug
from app.models.triage import TriageRun
from app.agents.orchestrator import orchestrator

router = APIRouter(prefix="/triage", tags=["Triage Pipeline"])

@router.post("/{bug_id}/start")
async def start_triage_pipeline(bug_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    bug = await db.get(Bug, bug_id)
    if not bug:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bug not found")

    triage_run = await orchestrator.start_triage(str(bug_id))
    return {
        "status": "started",
        "bug_id": str(bug_id),
        "triage_run_id": str(triage_run.id),
        "stream_url": f"/api/triage/{bug_id}/stream"
    }

@router.get("/{bug_id}/stream")
async def stream_triage_progress(bug_id: uuid.UUID):
    """Server-Sent Events endpoint delivering real-time agent execution events."""
    return StreamingResponse(
        orchestrator.stream_events(str(bug_id)),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@router.get("/{bug_id}/report")
async def get_triage_report(bug_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(TriageRun)
        .options(selectinload(TriageRun.actions))
        .where(TriageRun.bug_id == bug_id)
        .order_by(TriageRun.started_at.desc())
    )
    triage_run = res.scalar_one_or_none()
    if not triage_run:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No triage runs found for this bug")

    return {
        "triage_run_id": str(triage_run.id),
        "bug_id": str(bug_id),
        "status": triage_run.status.value,
        "full_report": triage_run.full_report,
        "started_at": triage_run.started_at.isoformat() if triage_run.started_at else None,
        "completed_at": triage_run.completed_at.isoformat() if triage_run.completed_at else None,
        "actions_count": len(triage_run.actions)
    }
