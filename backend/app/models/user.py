import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Enum as SQLEnum, Uuid
from sqlalchemy.orm import relationship
import enum
from app.database import Base

class UserRole(str, enum.Enum):
    REPORTER = "reporter"
    DEVELOPER = "developer"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole, native_enum=False), default=UserRole.REPORTER, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    reported_bugs = relationship("Bug", foreign_keys="Bug.reporter_id", back_populates="reporter")
    assigned_bugs = relationship("Bug", foreign_keys="Bug.assigned_to", back_populates="assignee")
    owned_components = relationship("Component", back_populates="owner_developer")
    feedbacks = relationship("Feedback", back_populates="developer")
