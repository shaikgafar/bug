import asyncio
import json
import logging
import uuid
from datetime import datetime, timezone
from typing import AsyncGenerator, Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload

from app.database import AsyncSessionLocal
from app.models.bug import Bug, BugStatus, BugSeverity, BugPriority
from app.models.triage import (
    TriageRun,
    TriageStatus,
    AgentAction,
    DuplicateMatch,
    Evidence,
    ClarificationMessage,
    ClarificationSender
)
from app.models.user import User
from app.models.component import Component
from app.agents.triage_agent import triage_agent
from app.agents.intelligence_agent import intelligence_agent
from app.agents.reproduction_agent import reproduction_agent
from app.agents.routing_agent import routing_agent
from app.services.vector_store import vector_store

logger = logging.getLogger(__name__)

class TriageOrchestrator:
    def __init__(self):
        # In-memory pub/sub queues for active SSE streams: bug_id -> list of asyncio.Queue
        self._listeners: Dict[str, List[asyncio.Queue]] = {}

    def subscribe(self, bug_id: str) -> asyncio.Queue:
        q = asyncio.Queue()
        if bug_id not in self._listeners:
            self._listeners[bug_id] = []
        self._listeners[bug_id].append(q)
        return q

    def unsubscribe(self, bug_id: str, q: asyncio.Queue):
        if bug_id in self._listeners:
            if q in self._listeners[bug_id]:
                self._listeners[bug_id].remove(q)
            if not self._listeners[bug_id]:
                del self._listeners[bug_id]

    async def emit_event(self, bug_id: str, event_type: str, data: Dict[str, Any]):
        """Dispatches an SSE event to all connected listeners for this bug."""
        payload = {
            "event": event_type,
            "data": data,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        if bug_id in self._listeners:
            for q in list(self._listeners[bug_id]):
                try:
                    await q.put(payload)
                except Exception:
                    pass

    async def stream_events(self, bug_id: str) -> AsyncGenerator[str, None]:
        """Generator yielding Server-Sent Events formatted text."""
        q = self.subscribe(bug_id)
        try:
            # Yield initial keepalive
            yield f"event: ping\ndata: {json.dumps({'status': 'connected', 'bug_id': bug_id})}\n\n"
            while True:
                msg = await q.get()
                event_name = msg.get("event", "message")
                data_str = json.dumps(msg.get("data", {}))
                yield f"event: {event_name}\ndata: {data_str}\n\n"
                if event_name in ("complete", "clarification_needed", "error"):
                    # We continue listening in case clarification resumes or completion is acknowledged
                    pass
        except asyncio.CancelledError:
            pass
        finally:
            self.unsubscribe(bug_id, q)

    async def start_triage(self, bug_id: str, resume_from_clarification: bool = False) -> TriageRun:
        """Starts or resumes the full multi-agent triage pipeline."""
        async with AsyncSessionLocal() as session:
            # Fetch bug
            bug_uuid = uuid.UUID(bug_id)
            res = await session.execute(
                select(Bug)
                .options(
                    selectinload(Bug.clarification_messages),
                    selectinload(Bug.triage_runs)
                )
                .where(Bug.id == bug_uuid)
            )
            bug = res.scalar_one_or_none()
            if not bug:
                raise ValueError(f"Bug {bug_id} not found")

            # Check if there is an existing running or waiting run
            triage_run = None
            if bug.triage_runs:
                # Find most recent
                triage_run = sorted(bug.triage_runs, key=lambda r: r.started_at, reverse=True)[0]
                if triage_run.status == TriageStatus.COMPLETED and not resume_from_clarification:
                    # Create new run
                    triage_run = None

            if not triage_run or (triage_run.status == TriageStatus.COMPLETED and not resume_from_clarification):
                triage_run = TriageRun(
                    bug_id=bug.id,
                    status=TriageStatus.RUNNING,
                    started_at=datetime.now(timezone.utc)
                )
                session.add(triage_run)
            else:
                triage_run.status = TriageStatus.RUNNING

            bug.status = BugStatus.TRIAGING
            await session.commit()
            await session.refresh(triage_run)
            run_id = triage_run.id

        # Launch background execution task
        asyncio.create_task(self._run_pipeline(str(bug_uuid), str(run_id), resume_from_clarification))
        return triage_run

    async def _run_pipeline(self, bug_id: str, run_id: str, is_resumed: bool):
        """Asynchronous execution lifecycle for all 4 agents."""
        logger.info("Starting triage execution for bug %s (Run: %s)", bug_id, run_id)
        
        await self.emit_event(bug_id, "start", {
            "bug_id": bug_id,
            "run_id": run_id,
            "status": "running",
            "message": "Initiating multi-agent bug triage pipeline..."
        })

        async with AsyncSessionLocal() as session:
            try:
                b_uuid = uuid.UUID(bug_id)
                r_uuid = uuid.UUID(run_id)

                # Load Bug
                bug_res = await session.execute(
                    select(Bug)
                    .options(selectinload(Bug.clarification_messages))
                    .where(Bug.id == b_uuid)
                )
                bug = bug_res.scalar_one()

                # Load components and users for intelligence & routing
                comps_res = await session.execute(select(Component))
                comps = [
                    {"id": str(c.id), "name": c.name, "description": c.description, "owner_team": c.owner_team, "owner_developer_id": str(c.owner_developer_id) if c.owner_developer_id else None}
                    for c in comps_res.scalars().all()
                ]

                users_res = await session.execute(select(User))
                users = [
                    {"id": str(u.id), "name": u.name, "email": u.email, "role": u.role.value}
                    for u in users_res.scalars().all()
                ]

                # Format existing clarifications
                prior_clarifications = []
                clarif_msgs = sorted(bug.clarification_messages, key=lambda m: m.created_at)
                for i in range(0, len(clarif_msgs) - 1, 2):
                    if clarif_msgs[i].sender == ClarificationSender.AGENT and clarif_msgs[i+1].sender == ClarificationSender.USER:
                        prior_clarifications.append({
                            "question": clarif_msgs[i].message,
                            "answer": clarif_msgs[i+1].message
                        })

                # ==========================================
                # 1. TRIAGE AGENT
                # ==========================================
                await self.emit_event(bug_id, "agent_start", {
                    "agent": "triage",
                    "step": 1,
                    "total_steps": 4,
                    "label": "Triage Agent: Normalizing bug report and inspecting completeness..."
                })

                triage_out = await triage_agent.run(
                    raw_title=bug.title,
                    raw_description=bug.raw_description,
                    prior_clarifications=prior_clarifications if prior_clarifications else None
                )

                # Persist AgentAction
                action1 = AgentAction(
                    triage_run_id=r_uuid,
                    agent_name="triage",
                    input_data={"title": bug.title, "raw_description": bug.raw_description, "prior_clarifications": prior_clarifications},
                    output_data=triage_out.model_dump(),
                    reasoning=triage_out.reasoning
                )
                session.add(action1)
                
                # Update bug title and structured_data
                bug.structured_data = triage_out.model_dump()
                if triage_out.summary.title and len(triage_out.summary.title) > 3:
                    bug.title = triage_out.summary.title

                await session.commit()

                await self.emit_event(bug_id, "agent_complete", {
                    "agent": "triage",
                    "step": 1,
                    "output": triage_out.model_dump(),
                    "reasoning": triage_out.reasoning
                })

                # Check completeness - if incomplete and no clarification answers yet, pause pipeline!
                if not triage_out.is_complete and triage_out.clarifying_questions and not is_resumed:
                    logger.info("Bug %s needs clarification. Pausing pipeline.", bug_id)
                    
                    # Update status
                    run_obj = await session.get(TriageRun, r_uuid)
                    if run_obj:
                        run_obj.status = TriageStatus.WAITING_FOR_USER
                    bug.status = BugStatus.CLARIFYING

                    # Record clarification question from agent
                    question_text = "\n".join(triage_out.clarifying_questions)
                    clarif_msg = ClarificationMessage(
                        bug_id=b_uuid,
                        sender=ClarificationSender.AGENT,
                        message=question_text
                    )
                    session.add(clarif_msg)
                    await session.commit()

                    await self.emit_event(bug_id, "clarification_needed", {
                        "status": "waiting_for_user",
                        "missing_fields": triage_out.missing_fields,
                        "questions": triage_out.clarifying_questions,
                        "message": "Bug report requires additional information before triage can proceed."
                    })
                    return

                # ==========================================
                # 2. INTELLIGENCE AGENT
                # ==========================================
                await self.emit_event(bug_id, "agent_start", {
                    "agent": "intelligence",
                    "step": 2,
                    "total_steps": 4,
                    "label": "Intelligence Agent: Performing semantic duplicate search & component classification..."
                })

                intel_out = await intelligence_agent.run(
                    summary=triage_out.summary,
                    current_bug_id=bug_id,
                    available_components=comps
                )

                # Persist Duplicate matches & update bug severity/priority
                for dup in intel_out.potential_duplicates:
                    try:
                        dup_uuid = uuid.UUID(dup.bug_id)
                        # Check if duplicate entry already exists
                        existing_dup = await session.execute(
                            select(DuplicateMatch).where(
                                DuplicateMatch.bug_id == b_uuid,
                                DuplicateMatch.matched_bug_id == dup_uuid
                            )
                        )
                        if not existing_dup.scalar_one_or_none():
                            dm = DuplicateMatch(
                                bug_id=b_uuid,
                                matched_bug_id=dup_uuid,
                                similarity_score=dup.similarity_score,
                                confirmed=None
                            )
                            session.add(dm)
                    except Exception:
                        pass

                # Update bug severity and priority
                if intel_out.severity in [s.value for s in BugSeverity]:
                    bug.severity = BugSeverity(intel_out.severity)
                if intel_out.priority in [p.value for p in BugPriority]:
                    bug.priority = BugPriority(intel_out.priority)

                # Link top suggested component
                if intel_out.suggested_components:
                    top_comp_id = intel_out.suggested_components[0].component_id
                    if top_comp_id:
                        try:
                            bug.component_id = uuid.UUID(top_comp_id)
                        except Exception:
                            pass

                action2 = AgentAction(
                    triage_run_id=r_uuid,
                    agent_name="intelligence",
                    input_data={"summary": triage_out.summary.model_dump()},
                    output_data=intel_out.model_dump(),
                    reasoning=intel_out.reasoning
                )
                session.add(action2)
                await session.commit()

                # Also add this bug to the vector store index
                vector_store.add_bug(
                    bug_id=bug_id,
                    text=f"{triage_out.summary.title} {triage_out.summary.clean_description}",
                    metadata={
                        "title": triage_out.summary.title,
                        "status": bug.status.value,
                        "severity": bug.severity.value,
                        "priority": bug.priority.value
                    }
                )

                await self.emit_event(bug_id, "agent_complete", {
                    "agent": "intelligence",
                    "step": 2,
                    "output": intel_out.model_dump(),
                    "reasoning": intel_out.reasoning
                })

                # ==========================================
                # 3. REPRODUCTION AGENT
                # ==========================================
                await self.emit_event(bug_id, "agent_start", {
                    "agent": "reproduction",
                    "step": 3,
                    "total_steps": 4,
                    "label": "Reproduction Agent: Generating Selenium script and executing headless browser test..."
                })

                top_comp_name = intel_out.suggested_components[0].name if intel_out.suggested_components else "General"
                repro_out = await reproduction_agent.run(
                    summary=triage_out.summary,
                    bug_id=bug_id,
                    component_name=top_comp_name
                )

                # Save evidences to DB
                for ev in repro_out.evidence:
                    ev_rec = Evidence(
                        bug_id=b_uuid,
                        type=ev.type,
                        file_path=ev.path,
                        metadata_json={"description": ev.description}
                    )
                    session.add(ev_rec)

                action3 = AgentAction(
                    triage_run_id=r_uuid,
                    agent_name="reproduction",
                    input_data={"steps": triage_out.summary.steps_to_reproduce, "component": top_comp_name},
                    output_data=repro_out.model_dump(),
                    reasoning=repro_out.reasoning
                )
                session.add(action3)
                
                if repro_out.reproduction_status == "reproduced":
                    bug.status = BugStatus.REPRODUCED

                await session.commit()

                await self.emit_event(bug_id, "agent_complete", {
                    "agent": "reproduction",
                    "step": 3,
                    "output": repro_out.model_dump(),
                    "reasoning": repro_out.reasoning
                })

                # ==========================================
                # 4. ROUTING & ANALYSIS AGENT
                # ==========================================
                await self.emit_event(bug_id, "agent_start", {
                    "agent": "routing",
                    "step": 4,
                    "total_steps": 4,
                    "label": "Routing Agent: Assessing regression, assigning engineering team and compiling final report..."
                })

                routing_out = await routing_agent.run(
                    triage_data=triage_out,
                    intelligence_data=intel_out,
                    reproduction_data=repro_out,
                    available_users=users,
                    available_components=comps
                )

                # Assign developer if found
                if routing_out.assigned_developer_id:
                    try:
                        bug.assigned_to = uuid.UUID(routing_out.assigned_developer_id)
                    except Exception:
                        pass

                bug.status = BugStatus.ROUTED

                action4 = AgentAction(
                    triage_run_id=r_uuid,
                    agent_name="routing",
                    input_data={"triage": triage_out.summary.title, "severity": intel_out.severity},
                    output_data=routing_out.model_dump(),
                    reasoning=routing_out.reasoning
                )
                session.add(action4)

                # Finalize TriageRun
                run_obj = await session.get(TriageRun, r_uuid)
                full_report = {
                    "triage_agent": triage_out.model_dump(),
                    "intelligence_agent": intel_out.model_dump(),
                    "reproduction_agent": repro_out.model_dump(),
                    "routing_agent": routing_out.model_dump(),
                    "summary_markdown": routing_out.final_triage_summary
                }
                if run_obj:
                    run_obj.full_report = full_report
                    run_obj.status = TriageStatus.COMPLETED
                    run_obj.completed_at = datetime.now(timezone.utc)

                await session.commit()

                await self.emit_event(bug_id, "agent_complete", {
                    "agent": "routing",
                    "step": 4,
                    "output": routing_out.model_dump(),
                    "reasoning": routing_out.reasoning
                })

                # Pipeline completion event
                await self.emit_event(bug_id, "complete", {
                    "status": "completed",
                    "bug_id": bug_id,
                    "run_id": run_id,
                    "full_report": full_report,
                    "message": "Multi-agent bug triage completed successfully!"
                })
                logger.info("Triage execution completed successfully for bug %s", bug_id)

            except Exception as e:
                logger.error("Pipeline failure for bug %s: %s", bug_id, str(e), exc_info=True)
                try:
                    run_obj = await session.get(TriageRun, uuid.UUID(run_id) if isinstance(run_id, str) else run_id)
                    if run_obj:
                        run_obj.status = TriageStatus.FAILED
                        await session.commit()
                except Exception:
                    pass
                await self.emit_event(bug_id, "error", {
                    "status": "failed",
                    "message": f"Pipeline encountered an unexpected error: {str(e)}"
                })

orchestrator = TriageOrchestrator()
