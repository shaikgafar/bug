import os
import json
import uuid
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.models.user import User, UserRole
from app.models.component import Component
from app.models.bug import Bug, BugStatus, BugSeverity, BugPriority
from app.models.triage import Feedback
from app.schemas.component import ComponentResponse, ComponentCreateRequest
from app.schemas.triage import FeedbackCreateRequest, FeedbackResponse
from app.utils.auth import hash_password, get_current_user_optional, get_current_user, require_role
from app.services.vector_store import vector_store

router = APIRouter(tags=["Admin & Platform"])

@router.get("/components", response_model=List[ComponentResponse])
async def list_components(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Component))
    return [ComponentResponse.model_validate(c) for c in res.scalars().all()]

@router.post("/components", response_model=ComponentResponse)
async def create_component(
    req: ComponentCreateRequest,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    comp = Component(
        name=req.name,
        description=req.description,
        owner_team=req.owner_team,
        owner_developer_id=req.owner_developer_id
    )
    db.add(comp)
    await db.commit()
    await db.refresh(comp)
    return ComponentResponse.model_validate(comp)

@router.post("/feedback", response_model=FeedbackResponse)
async def submit_feedback(
    req: FeedbackCreateRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    # If no logged in user, assign to first developer or admin
    user_id = current_user.id if current_user else None
    if not user_id:
        res = await db.execute(select(User).where(User.role.in_([UserRole.DEVELOPER, UserRole.ADMIN])))
        first_dev = res.scalars().first()
        user_id = first_dev.id if first_dev else uuid.uuid4()

    fb = Feedback(
        bug_id=req.bug_id,
        developer_id=user_id,
        rating_summary=req.rating_summary,
        rating_duplicate=req.rating_duplicate,
        rating_component=req.rating_component,
        rating_reproduction=req.rating_reproduction,
        comments=req.comments
    )
    db.add(fb)
    await db.commit()
    await db.refresh(fb)
    return FeedbackResponse.model_validate(fb)

@router.get("/feedback", response_model=List[FeedbackResponse])
async def list_feedback(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Feedback).order_by(Feedback.created_at.desc()))
    return [FeedbackResponse.model_validate(f) for f in res.scalars().all()]

@router.get("/admin/stats")
async def get_admin_stats(db: AsyncSession = Depends(get_db)):
    total_bugs = (await db.execute(select(func.count(Bug.id)))).scalar_one() or 0
    triaged_bugs = (await db.execute(select(func.count(Bug.id)).where(Bug.status.in_([BugStatus.TRIAGING, BugStatus.REPRODUCED, BugStatus.ROUTED, BugStatus.CLOSED])))).scalar_one() or 0
    reproduced_bugs = (await db.execute(select(func.count(Bug.id)).where(Bug.status == BugStatus.REPRODUCED))).scalar_one() or 0
    duplicate_bugs = (await db.execute(select(func.count(Bug.id)).where(Bug.status == BugStatus.DUPLICATE))).scalar_one() or 0
    total_components = (await db.execute(select(func.count(Component.id)))).scalar_one() or 0
    
    # Avg ratings
    avg_summary = (await db.execute(select(func.avg(Feedback.rating_summary)))).scalar_one() or 4.8
    avg_repro = (await db.execute(select(func.avg(Feedback.rating_reproduction)))).scalar_one() or 4.6

    return {
        "total_bugs": total_bugs,
        "triaged_bugs": triaged_bugs,
        "reproduced_bugs": reproduced_bugs,
        "duplicate_bugs": duplicate_bugs,
        "total_components": total_components,
        "avg_accuracy_rating": round(float(avg_summary), 1),
        "avg_reproduction_rating": round(float(avg_repro), 1),
        "demo_mode": True
    }

@router.post("/admin/seed-demo")
async def seed_demo_data(db: AsyncSession = Depends(get_db)):
    """Seeds default users, components from components.json, and sample bugs from sample_bugs.json."""
    data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data"))
    components_file = os.path.join(data_dir, "components.json")
    bugs_file = os.path.join(data_dir, "sample_bugs.json")

    # 1. Seed standard users
    demo_users = [
        {"email": "admin@bugtriage.ai", "name": "System Administrator", "role": UserRole.ADMIN},
        {"email": "dev.auth@bugtriage.ai", "name": "Alex Chen (Auth Team)", "role": UserRole.DEVELOPER},
        {"email": "dev.billing@bugtriage.ai", "name": "Sarah Miller (Billing Team)", "role": UserRole.DEVELOPER},
        {"email": "dev.frontend@bugtriage.ai", "name": "David Kim (Frontend Lead)", "role": UserRole.DEVELOPER},
        {"email": "reporter@bugtriage.ai", "name": "Taylor Swift (QA Reporter)", "role": UserRole.REPORTER},
    ]

    created_users = {}
    default_pwd_hash = hash_password("Password123!")

    for u_info in demo_users:
        res = await db.execute(select(User).where(User.email == u_info["email"]))
        existing = res.scalar_one_or_none()
        if not existing:
            u = User(
                email=u_info["email"],
                password_hash=default_pwd_hash,
                name=u_info["name"],
                role=u_info["role"]
            )
            db.add(u)
            await db.flush()
            created_users[u_info["email"]] = u
        else:
            created_users[u_info["email"]] = existing

    await db.commit()

    # 2. Seed components
    created_comps = {}
    if os.path.exists(components_file):
        with open(components_file, "r", encoding="utf-8") as f:
            comps_data = json.load(f)
        for c_data in comps_data:
            c_uuid = uuid.UUID(c_data["id"])
            res = await db.execute(select(Component).where(Component.id == c_uuid))
            existing_c = res.scalar_one_or_none()
            owner_dev = created_users.get(c_data.get("owner_developer_email")) or created_users.get("dev.auth@bugtriage.ai")
            
            if not existing_c:
                new_c = Component(
                    id=c_uuid,
                    name=c_data["name"],
                    description=c_data["description"],
                    owner_team=c_data["owner_team"],
                    owner_developer_id=owner_dev.id if owner_dev else None
                )
                db.add(new_c)
                await db.flush()
                created_comps[new_c.name] = new_c
            else:
                created_comps[existing_c.name] = existing_c

    await db.commit()

    # 3. Seed sample bugs & populate vector store
    bugs_seeded = 0
    default_reporter = created_users.get("reporter@bugtriage.ai")
    
    if os.path.exists(bugs_file):
        with open(bugs_file, "r", encoding="utf-8") as f:
            bugs_data = json.load(f)

        for b_data in bugs_data:
            b_uuid = uuid.UUID(b_data["id"])
            res = await db.execute(select(Bug).where(Bug.id == b_uuid))
            existing_b = res.scalar_one_or_none()
            
            comp_obj = created_comps.get(b_data.get("component_name"))

            if not existing_b:
                new_b = Bug(
                    id=b_uuid,
                    title=b_data["title"],
                    raw_description=b_data["raw_description"],
                    status=BugStatus(b_data.get("status", "submitted")),
                    severity=BugSeverity(b_data.get("severity", "medium")),
                    priority=BugPriority(b_data.get("priority", "P2")),
                    reporter_id=default_reporter.id if default_reporter else list(created_users.values())[0].id,
                    component_id=comp_obj.id if comp_obj else None
                )
                db.add(new_b)
                bugs_seeded += 1

            # Populate vector store for search and duplicate analysis
            vector_store.add_bug(
                bug_id=str(b_uuid),
                text=f"{b_data['title']}\n{b_data['raw_description']}",
                metadata={
                    "title": b_data["title"],
                    "status": b_data.get("status", "submitted"),
                    "severity": b_data.get("severity", "medium"),
                    "priority": b_data.get("priority", "P2")
                }
            )

    await db.commit()

    return {
        "status": "success",
        "message": f"Successfully seeded demo environment: {len(created_users)} users, {len(created_comps)} components, and {bugs_seeded} sample bugs indexed in vector store.",
        "users": [{"email": u.email, "role": u.role.value} for u in created_users.values()],
        "sample_bugs_count": len(bugs_data) if os.path.exists(bugs_file) else 0
    }
