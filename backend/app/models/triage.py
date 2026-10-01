import uuid
from datetime import datetime, timezone
import enum
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Enum as SQLEnum, JSON, Float, Boolean, Integer, Uuid
from sqlalchemy.orm import relationship
from app.database import Base

class TriageStatus(str, enum.Enum):
    RUNNING = "running"
    WAITING_FOR_USER = "waiting_for_user"
    COMPLETED = "completed"
    FAILED = "failed"

class ClarificationSender(str, enum.Enum):
    AGENT = "agent"
    USER = "user"

class TriageRun(Base):
    __tablename__ = "triage_runs"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    bug_id = Column(Uuid(as_uuid=True), ForeignKey("bugs.id"), nullable=False)
    status = Column(SQLEnum(TriageStatus, native_enum=False), default=TriageStatus.RUNNING, nullable=False)
    full_report = Column(JSON, nullable=True)
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    bug = relationship("Bug", back_populates="triage_runs")
    actions = relationship("AgentAction", back_populates="triage_run", cascade="all, delete-orphan", order_by="AgentAction.created_at")

class AgentAction(Base):
    __tablename__ = "agent_actions"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    triage_run_id = Column(Uuid(as_uuid=True), ForeignKey("triage_runs.id"), nullable=False)
    agent_name = Column(String(50), nullable=False)  # "triage" | "intelligence" | "reproduction" | "routing"
    input_data = Column(JSON, nullable=True)
    output_data = Column(JSON, nullable=True)
    reasoning = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    triage_run = relationship("TriageRun", back_populates="actions")

class DuplicateMatch(Base):
    __tablename__ = "duplicate_matches"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    bug_id = Column(Uuid(as_uuid=True), ForeignKey("bugs.id"), nullable=False)
    matched_bug_id = Column(Uuid(as_uuid=True), ForeignKey("bugs.id"), nullable=False)
    similarity_score = Column(Float, nullable=False)
    confirmed = Column(Boolean, nullable=True)

    # Relationships
    bug = relationship("Bug", foreign_keys=[bug_id], back_populates="duplicate_matches")
    matched_bug = relationship("Bug", foreign_keys=[matched_bug_id])

class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    bug_id = Column(Uuid(as_uuid=True), ForeignKey("bugs.id"), nullable=False)
    type = Column(String(50), nullable=False)  # "screenshot" | "console_log" | "network" | "script"
    file_path = Column(String(1000), nullable=False)
    metadata_json = Column("metadata", JSON, nullable=True)

    # Relationships
    bug = relationship("Bug", back_populates="evidences")

class ClarificationMessage(Base):
    __tablename__ = "clarification_messages"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    bug_id = Column(Uuid(as_uuid=True), ForeignKey("bugs.id"), nullable=False)
    sender = Column(SQLEnum(ClarificationSender, native_enum=False), nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    bug = relationship("Bug", back_populates="clarification_messages")

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    bug_id = Column(Uuid(as_uuid=True), ForeignKey("bugs.id"), nullable=False)
    developer_id = Column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False)
    rating_summary = Column(Integer, nullable=False)  # 1-5
    rating_duplicate = Column(Integer, nullable=False)
    rating_component = Column(Integer, nullable=False)
    rating_reproduction = Column(Integer, nullable=False)
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    bug = relationship("Bug", back_populates="feedbacks")
    developer = relationship("User", back_populates="feedbacks")
