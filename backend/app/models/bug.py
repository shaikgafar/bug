import uuid
from datetime import datetime, timezone
import enum
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Enum as SQLEnum, JSON, Uuid
from sqlalchemy.orm import relationship
from app.database import Base

class BugStatus(str, enum.Enum):
    SUBMITTED = "submitted"
    CLARIFYING = "clarifying"
    TRIAGING = "triaging"
    REPRODUCED = "reproduced"
    ROUTED = "routed"
    CLOSED = "closed"
    DUPLICATE = "duplicate"

class BugSeverity(str, enum.Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class BugPriority(str, enum.Enum):
    P0 = "P0"
    P1 = "P1"
    P2 = "P2"
    P3 = "P3"

class Bug(Base):
    __tablename__ = "bugs"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(500), nullable=False)
    raw_description = Column(Text, nullable=False)
    structured_data = Column(JSON, nullable=True)
    status = Column(SQLEnum(BugStatus, native_enum=False), default=BugStatus.SUBMITTED, nullable=False)
    severity = Column(SQLEnum(BugSeverity, native_enum=False), default=BugSeverity.MEDIUM, nullable=False)
    priority = Column(SQLEnum(BugPriority, native_enum=False), default=BugPriority.P2, nullable=False)
    reporter_id = Column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False)
    assigned_to = Column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=True)
    component_id = Column(Uuid(as_uuid=True), ForeignKey("components.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    reporter = relationship("User", foreign_keys=[reporter_id], back_populates="reported_bugs")
    assignee = relationship("User", foreign_keys=[assigned_to], back_populates="assigned_bugs")
    component = relationship("Component", back_populates="bugs")
    triage_runs = relationship("TriageRun", back_populates="bug", cascade="all, delete-orphan")
    duplicate_matches = relationship("DuplicateMatch", foreign_keys="DuplicateMatch.bug_id", back_populates="bug", cascade="all, delete-orphan")
    evidences = relationship("Evidence", back_populates="bug", cascade="all, delete-orphan")
    clarification_messages = relationship("ClarificationMessage", back_populates="bug", cascade="all, delete-orphan")
    feedbacks = relationship("Feedback", back_populates="bug", cascade="all, delete-orphan")
