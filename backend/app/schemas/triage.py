from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from uuid import UUID
from datetime import datetime
from app.models.triage import TriageStatus, ClarificationSender

# 4.2 Triage Agent Contract
class TriageSummary(BaseModel):
    title: str = Field(description="Normalized concise bug title")
    clean_description: str = Field(description="Clean, well-formatted description")
    steps_to_reproduce: List[str] = Field(default_factory=list, description="Ordered step-by-step reproduction instructions")
    expected_result: str = Field(default="", description="What should have happened")
    actual_result: str = Field(default="", description="What actually happened")
    environment: str = Field(default="", description="OS, browser, app version, runtime environment")

class TriageAgentOutput(BaseModel):
    summary: TriageSummary
    is_complete: bool
    missing_fields: List[str] = Field(default_factory=list)
    clarifying_questions: List[str] = Field(default_factory=list)
    reasoning: str

# 4.3 Intelligence Agent Contract
class PotentialDuplicate(BaseModel):
    bug_id: str
    title: str
    similarity_score: float
    reason: str

class SuggestedComponent(BaseModel):
    component_id: Optional[str] = None
    name: str
    confidence: float
    reason: str

class IntelligenceAgentOutput(BaseModel):
    potential_duplicates: List[PotentialDuplicate] = Field(default_factory=list)
    suggested_components: List[SuggestedComponent] = Field(default_factory=list)
    severity: str = Field(description="critical | high | medium | low")
    priority: str = Field(description="P0 | P1 | P2 | P3")
    reasoning: str

# 4.4 Reproduction Agent Contract
class ReproductionEvidenceItem(BaseModel):
    type: str = Field(description="screenshot | console_log | network | script")
    path: str
    description: str

class ReproductionAgentOutput(BaseModel):
    reproduction_status: str = Field(description="reproduced | partial | could_not_reproduce | needs_manual | script_only")
    generated_selenium_script: str
    evidence: List[ReproductionEvidenceItem] = Field(default_factory=list)
    execution_log: str
    reasoning: str

# 4.5 Routing & Analysis Agent Contract
class RoutingAgentOutput(BaseModel):
    is_regression: bool
    regression_reason: str
    assigned_developer_id: Optional[str] = None
    assigned_developer_name: Optional[str] = None
    assigned_team: str
    final_triage_summary: str = Field(description="Markdown summary of full triage")
    recommended_actions: List[str] = Field(default_factory=list)
    reasoning: str

# Full pipeline combined report
class FullTriageReport(BaseModel):
    triage_run_id: str
    bug_id: str
    status: TriageStatus
    triage_agent: Optional[TriageAgentOutput] = None
    intelligence_agent: Optional[IntelligenceAgentOutput] = None
    reproduction_agent: Optional[ReproductionAgentOutput] = None
    routing_agent: Optional[RoutingAgentOutput] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

# DB Schemas & Responses
class AgentActionResponse(BaseModel):
    id: UUID
    triage_run_id: UUID
    agent_name: str
    input_data: Optional[Any] = None
    output_data: Optional[Any] = None
    reasoning: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class TriageRunResponse(BaseModel):
    id: UUID
    bug_id: UUID
    status: TriageStatus
    full_report: Optional[Dict[str, Any]] = None
    started_at: datetime
    completed_at: Optional[datetime] = None
    actions: List[AgentActionResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True

class ClarificationMessageResponse(BaseModel):
    id: UUID
    bug_id: UUID
    sender: ClarificationSender
    message: str
    created_at: datetime

    class Config:
        from_attributes = True

class FeedbackCreateRequest(BaseModel):
    bug_id: UUID
    rating_summary: int = Field(ge=1, le=5)
    rating_duplicate: int = Field(ge=1, le=5)
    rating_component: int = Field(ge=1, le=5)
    rating_reproduction: int = Field(ge=1, le=5)
    comments: Optional[str] = None

class FeedbackResponse(BaseModel):
    id: UUID
    bug_id: UUID
    developer_id: UUID
    rating_summary: int
    rating_duplicate: int
    rating_component: int
    rating_reproduction: int
    comments: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
