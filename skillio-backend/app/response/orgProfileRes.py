from pydantic import BaseModel, EmailStr
from typing import Optional
from app.Model.enum.companySize import companySize
from app.Model.enum.companyIndustry import companyIndustry


class orgProfileRes(BaseModel):
    model_config = {"use_enum_values": True}

    companyName: str
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