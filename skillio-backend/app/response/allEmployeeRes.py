from pydantic import BaseModel, EmailStr
from typing import Optional
class allEmployeeRes(BaseModel):
    employeeID: Optional[str] = None
    employeeName: Optional[str] = None
    employeeRoleID: Optional[str] = None
    roleName: Optional[str] = None
    deptName: Optional[str] = None
    allEmployeeRoleSkills: Optional[list[str]] = []
    employeeDepartmentID: Optional[str] = None
    teamID: Optional[str] = None
    email: Optional[str] = None
    contactnumber: Optional[str] = None
    address: Optional[str] = None
    profileImageUrl: Optional[str] = None

