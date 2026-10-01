from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional, List, Dict, Any
from app.models.bug import BugStatus, BugSeverity, BugPriority
from app.schemas.user import UserResponse
from app.schemas.component import ComponentResponse
from app.schemas.triage import ClarificationMessageResponse, TriageRunResponse

class BugCreateRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=500)
    raw_description: str = Field(..., min_length=5)
    component_id: Optional[UUID] = None
    severity: Optional[BugSeverity] = None
    priority: Optional[BugPriority] = None

class BugUpdateRequest(BaseModel):
    title: Optional[str] = None
    raw_description: Optional[str] = None
    status: Optional[BugStatus] = None
    severity: Optional[BugSeverity] = None
    priority: Optional[BugPriority] = None
    assigned_to: Optional[UUID] = None
    component_id: Optional[UUID] = None

class BugClarifyRequest(BaseModel):
    message: str = Field(..., min_length=2, description="User's clarification response")

class BugConfirmDuplicateRequest(BaseModel):
    matched_bug_id: UUID
    confirmed: bool

class DuplicateMatchResponse(BaseModel):
    id: UUID
    bug_id: UUID
    matched_bug_id: UUID
    similarity_score: float
    confirmed: Optional[bool] = None
    matched_bug_title: Optional[str] = None
    matched_bug_status: Optional[str] = None

    class Config:
        from_attributes = True

class EvidenceResponse(BaseModel):
    id: UUID
    bug_id: UUID
    type: str
    file_path: str
    metadata_json: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class BugResponse(BaseModel):
    id: UUID
    title: str
    raw_description: str
    structured_data: Optional[Dict[str, Any]] = None
    status: BugStatus
    severity: BugSeverity
    priority: BugPriority
    reporter_id: UUID
    assigned_to: Optional[UUID] = None
    component_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class BugDetailResponse(BugResponse):
    reporter: Optional[UserResponse] = None
    assignee: Optional[UserResponse] = None
    component: Optional[ComponentResponse] = None
    duplicate_matches: List[DuplicateMatchResponse] = Field(default_factory=list)
    evidences: List[EvidenceResponse] = Field(default_factory=list)
    clarification_messages: List[ClarificationMessageResponse] = Field(default_factory=list)
    triage_runs: List[TriageRunResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True
