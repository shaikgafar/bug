import uuid
from sqlalchemy import Column, String, Text, ForeignKey, Uuid
from sqlalchemy.orm import relationship
from app.database import Base

class Component(Base):
    __tablename__ = "components"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), unique=True, nullable=False)
    description = Column(Text, nullable=False)
    owner_team = Column(String(255), nullable=False)
    owner_developer_id = Column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=True)

    # Relationships
    owner_developer = relationship("User", back_populates="owned_components")
    bugs = relationship("Bug", back_populates="component")
