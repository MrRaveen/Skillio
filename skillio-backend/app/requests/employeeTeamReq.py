from pydantic import BaseModel, Field
from typing import Optional

class employeeTeamReq(BaseModel):
    teamName: str = Field(..., min_length=1, max_length=100)
    teamDes: Optional[str] = Field(None, max_length=500)
    departmentID: str = Field(..., min_length=1)
