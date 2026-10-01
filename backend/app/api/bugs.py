import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.bug import Bug, BugStatus, BugSeverity, BugPriority
from app.models.user import User, UserRole
from app.models.triage import (
    DuplicateMatch,
    Evidence,
    ClarificationMessage,
    ClarificationSender,
    TriageRun
)
from app.schemas.bug import (
    BugCreateRequest,
    BugUpdateRequest,
    BugClarifyRequest,
    BugConfirmDuplicateRequest,
    BugResponse,
    BugDetailResponse,
    DuplicateMatchResponse,
    EvidenceResponse
)
from app.schemas.triage import ClarificationMessageResponse, TriageRunResponse, AgentActionResponse
from app.schemas.user import UserResponse
from app.schemas.component import ComponentResponse
from app.utils.auth import get_current_user_optional, get_current_user
from app.agents.orchestrator import orchestrator
from app.services.vector_store import vector_store

router = APIRouter(prefix="/bugs", tags=["Bugs"])

async def get_or_create_demo_user(db: AsyncSession) -> User:
    res = await db.execute(select(User).where(User.email == "demo.reporter@bugtriage.ai"))
    user = res.scalar_one_or_none()
    if not user:
        user = User(
            email="demo.reporter@bugtriage.ai",
            password_hash="demo_hash",
            name="Demo Reporter",
            role=UserRole.REPORTER
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    return user

@router.post("", response_model=BugResponse, status_code=status.HTTP_201_CREATED)
async def create_bug(
    req: BugCreateRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    user = current_user or await get_or_create_demo_user(db)
    
    new_bug = Bug(
        title=req.title,
        raw_description=req.raw_description,
        status=BugStatus.SUBMITTED,
        severity=req.severity or BugSeverity.MEDIUM,
        priority=req.priority or BugPriority.P2,
        reporter_id=user.id,
        component_id=req.component_id
    )
    db.add(new_bug)
    await db.commit()
    await db.refresh(new_bug)

    # Index in vector store
    vector_store.add_bug(
        bug_id=str(new_bug.id),
        text=f"{new_bug.title}\n{new_bug.raw_description}",
        metadata={"title": new_bug.title, "status": new_bug.status.value}
    )

    return BugResponse.model_validate(new_bug)

@router.get("", response_model=List[BugResponse])
async def list_bugs(
    status_filter: Optional[BugStatus] = Query(None, alias="status"),
    severity_filter: Optional[BugSeverity] = Query(None, alias="severity"),
    priority_filter: Optional[BugPriority] = Query(None, alias="priority"),
    component_id: Optional[uuid.UUID] = None,
    assigned_to: Optional[uuid.UUID] = None,
    reporter_id: Optional[uuid.UUID] = None,
    search: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    query = select(Bug).order_by(desc(Bug.created_at))

    if status_filter:
        query = query.where(Bug.status == status_filter)
    if severity_filter:
        query = query.where(Bug.severity == severity_filter)
    if priority_filter:
        query = query.where(Bug.priority == priority_filter)
    if component_id:
        query = query.where(Bug.component_id == component_id)
    if assigned_to:
        query = query.where(Bug.assigned_to == assigned_to)
    if reporter_id:
        query = query.where(Bug.reporter_id == reporter_id)

    # If reporter role and not explicitly requesting all, filter by their own bugs
    if current_user and current_user.role == UserRole.REPORTER and not reporter_id:
        # Show bugs reported by user or public list
        pass

    query = query.limit(limit).offset(offset)
    res = await db.execute(query)
    bugs = res.scalars().all()
    
    if search:
        search_lower = search.lower()
        bugs = [b for b in bugs if search_lower in b.title.lower() or search_lower in b.raw_description.lower()]

    return [BugResponse.model_validate(b) for b in bugs]

@router.get("/{bug_id}", response_model=BugDetailResponse)
async def get_bug_detail(bug_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    query = (
        select(Bug)
        .options(
            selectinload(Bug.reporter),
            selectinload(Bug.assignee),
            selectinload(Bug.component),
            selectinload(Bug.duplicate_matches).selectinload(DuplicateMatch.matched_bug),
            selectinload(Bug.evidences),
            selectinload(Bug.clarification_messages),
            selectinload(Bug.triage_runs).selectinload(TriageRun.actions)
        )
        .where(Bug.id == bug_id)
    )
    res = await db.execute(query)
    bug = res.scalar_one_or_none()
    if not bug:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bug not found")

    # Build response with matched bug titles
    dup_responses = []
    for dm in bug.duplicate_matches:
        dup_responses.append(DuplicateMatchResponse(
            id=dm.id,
            bug_id=dm.bug_id,
            matched_bug_id=dm.matched_bug_id,
            similarity_score=dm.similarity_score,
            confirmed=dm.confirmed,
            matched_bug_title=dm.matched_bug.title if dm.matched_bug else None,
            matched_bug_status=dm.matched_bug.status.value if dm.matched_bug else None
        ))

    evidence_responses = [
        EvidenceResponse(
            id=ev.id,
            bug_id=ev.bug_id,
            type=ev.type,
            file_path=ev.file_path,
            metadata_json=ev.metadata_json
        )
        for ev in bug.evidences
    ]

    clarif_responses = [
        ClarificationMessageResponse(
            id=cm.id,
            bug_id=cm.bug_id,
            sender=cm.sender,
            message=cm.message,
            created_at=cm.created_at
        )
        for cm in sorted(bug.clarification_messages, key=lambda m: m.created_at)
    ]

    triage_run_responses = []
    for tr in sorted(bug.triage_runs, key=lambda r: r.started_at, reverse=True):
        triage_run_responses.append(TriageRunResponse(
            id=tr.id,
            bug_id=tr.bug_id,
            status=tr.status,
            full_report=tr.full_report,
            started_at=tr.started_at,
            completed_at=tr.completed_at,
            actions=[AgentActionResponse.model_validate(act) for act in tr.actions]
        ))

    return BugDetailResponse(
        id=bug.id,
        title=bug.title,
        raw_description=bug.raw_description,
        structured_data=bug.structured_data,
        status=bug.status,
        severity=bug.severity,
        priority=bug.priority,
        reporter_id=bug.reporter_id,
        assigned_to=bug.assigned_to,
        component_id=bug.component_id,
        created_at=bug.created_at,
        updated_at=bug.updated_at,
        reporter=UserResponse.model_validate(bug.reporter) if bug.reporter else None,
        assignee=UserResponse.model_validate(bug.assignee) if bug.assignee else None,
        component=ComponentResponse.model_validate(bug.component) if bug.component else None,
        duplicate_matches=dup_responses,
        evidences=evidence_responses,
        clarification_messages=clarif_responses,
        triage_runs=triage_run_responses
    )

@router.patch("/{bug_id}", response_model=BugResponse)
async def update_bug(bug_id: uuid.UUID, req: BugUpdateRequest, db: AsyncSession = Depends(get_db)):
    bug = await db.get(Bug, bug_id)
    if not bug:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bug not found")

    if req.title is not None:
        bug.title = req.title
    if req.raw_description is not None:
        bug.raw_description = req.raw_description
    if req.status is not None:
        bug.status = req.status
    if req.severity is not None:
        bug.severity = req.severity
    if req.priority is not None:
        bug.priority = req.priority
    if req.assigned_to is not None:
        bug.assigned_to = req.assigned_to
    if req.component_id is not None:
        bug.component_id = req.component_id

    await db.commit()
    await db.refresh(bug)
    return BugResponse.model_validate(bug)

@router.post("/{bug_id}/clarify")
async def clarify_bug(
    bug_id: uuid.UUID,
    req: BugClarifyRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    bug = await db.get(Bug, bug_id)
    if not bug:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bug not found")

    # Add user's clarification response
    clarif = ClarificationMessage(
        bug_id=bug.id,
        sender=ClarificationSender.USER,
        message=req.message
    )
    db.add(clarif)
    
    # Update bug status back to triaging
    bug.status = BugStatus.TRIAGING
    await db.commit()

    # Resume the multi-agent pipeline!
    await orchestrator.start_triage(str(bug.id), resume_from_clarification=True)

    return {
        "status": "resumed",
        "message": "Clarification submitted. Multi-agent triage pipeline resumed!",
        "bug_id": str(bug.id)
    }

@router.post("/{bug_id}/confirm-duplicate")
async def confirm_duplicate(
    bug_id: uuid.UUID,
    req: BugConfirmDuplicateRequest,
    db: AsyncSession = Depends(get_db)
):
    # Find match record
    res = await db.execute(
        select(DuplicateMatch).where(
            DuplicateMatch.bug_id == bug_id,
            DuplicateMatch.matched_bug_id == req.matched_bug_id
        )
    )
    match = res.scalar_one_or_none()
    if not match:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Duplicate match record not found")

    match.confirmed = req.confirmed
    
    bug = await db.get(Bug, bug_id)
    if bug and req.confirmed:
        bug.status = BugStatus.DUPLICATE
        
    await db.commit()
    return {
        "status": "success",
        "bug_id": str(bug_id),
        "matched_bug_id": str(req.matched_bug_id),
        "confirmed": req.confirmed
    }
