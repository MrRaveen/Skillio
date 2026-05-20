from pydantic import BaseModel
from typing import Optional

class updateEmProfReq(BaseModel):
    emplpyeeDocID: str
    newEmployeeName: Optional[str] = None
    password: Optional[str] = None
    newContact: Optional[str] = None
    newAddress: Optional[str] = None
    newProfileImgUrl: Optional[str] = None

