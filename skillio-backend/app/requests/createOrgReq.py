from pydantic import BaseModel, EmailStr, Field, HttpUrl
from typing import Optional, List
from datetime import datetime
from app.Model.enum.companySize import companySize
from app.Model.enum.companyIndustry import companyIndustry

class createOrgReq(BaseModel):
    companyName: str
    companySize: companySize
    companyIndustry: companyIndustry
    companyEmail: str
    contactNumber: str
    ownerEmail: str
    personalNumber: str
    password: str
    address: str
    city: str
    state: str
    zipCode: str
    country: str
    companyWebsiteUrl: str
    companyLogoUrl: str
    companyBannerUrl: str