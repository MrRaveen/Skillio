from pydantic import BaseModel, Field

class assignTeamReq(BaseModel):
    teamID: str = Field(..., min_length=1)
    employeeDepartmentID: str = Field(..., min_length=1)
