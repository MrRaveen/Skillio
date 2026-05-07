from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from app.Model.enum.companySize import companySize
from app.Model.enum.companyIndustry import companyIndustry


class updateOrgReq(BaseModel):
    companyName: str = Field(..., min_length=1, max_length=200)
    companySize: companySize
    companyIndustry: companyIndustry
    companyEmail: EmailStr
    contactNumber: Optional[str] = None
    personalNumber: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zipCode: Optional[str] = None
    country: Optional[str] = None
    companyWebsiteUrl: Optional[str] = None
    companyLogoUrl: Optional[str] = None
    companyBannerUrl: Optional[str] = None

    @field_validator('companyName')
    @classmethod
    def name_must_not_be_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('companyName must not be blank')
        return v.strip()