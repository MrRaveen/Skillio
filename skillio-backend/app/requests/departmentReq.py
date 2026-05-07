from pydantic import BaseModel, Field
from typing import Optional

class departmentReq(BaseModel):
    deptName: str = Field(..., min_length=1, max_length=100)
    deptDescription: Optional[str] = Field(None, max_length=500)
