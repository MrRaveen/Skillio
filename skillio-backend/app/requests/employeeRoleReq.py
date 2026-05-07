from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum

class SkillLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    EXPERT = "expert"

class employeeRoleReq(BaseModel):
    roleName: str = Field(..., min_length=1, max_length=100)
    roleDescription: Optional[str] = Field(None, max_length=500)
    roleSkillid: List[str] = Field(default_factory=list)
    skillLevel: SkillLevel
