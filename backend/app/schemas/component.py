from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class ComponentCreateRequest(BaseModel):
    name: str
    description: str
    owner_team: str
    owner_developer_id: Optional[UUID] = None

class ComponentResponse(BaseModel):
    id: UUID
    name: str
    description: str
    owner_team: str
    owner_developer_id: Optional[UUID] = None

    class Config:
        from_attributes = True
