from pydantic import BaseModel, Field
from typing import Optional

class definedSkillReq(BaseModel):
    skill_name: str = Field(..., min_length=1, max_length=100)
    skill_des: Optional[str] = Field(None, max_length=500)
