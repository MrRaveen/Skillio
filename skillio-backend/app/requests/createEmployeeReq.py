from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class createEmployeeReq(BaseModel):
    employeeName: str = Field(..., min_length=1, max_length=200)
    employeeRoleID: Optional[str] = None
    employeeDepartmentID: Optional[str] = None
    teamID: Optional[str] = None
    email: EmailStr
    contactnumber: Optional[str] = None
    address: Optional[str] = None
    profileImageUrl: Optional[str] = None
