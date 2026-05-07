from app.requests.updateOrgReq import updateOrgReq
from app.response.orgProfileRes import orgProfileRes
from app.Model.OrganizationAccount import OrganizationAccount
from mongoengine.errors import DoesNotExist


def updateCompanyByID(companyID: str, updateInfo: updateOrgReq) -> bool:
    try:
        org = OrganizationAccount.objects.get(id=companyID)
        org.companyName = updateInfo.companyName
        org.companySize = updateInfo.companySize
        org.companyIndustry = updateInfo.companyIndustry
        org.companyEmail = updateInfo.companyEmail
        org.contactNumber = updateInfo.contactNumber
        org.personalNumber = updateInfo.personalNumber
        org.address = updateInfo.address
        org.city = updateInfo.city
        org.state = updateInfo.state
        org.zipCode = updateInfo.zipCode
        org.country = updateInfo.country
        org.companyWebsiteUrl = updateInfo.companyWebsiteUrl
        org.companyLogoUrl = updateInfo.companyLogoUrl
        org.companyBannerUrl = updateInfo.companyBannerUrl
        org.save()
        return True
    except DoesNotExist:
        raise
    except Exception as e:
        raise e



def getOrgProfile(orgID: str) -> orgProfileRes:
    try:
        org = OrganizationAccount.objects.get(id=orgID)
        return orgProfileRes(
            companyName=org.companyName,
            companySize=org.companySize,
            companyIndustry=org.companyIndustry,
            companyEmail=org.companyEmail,
            contactNumber=org.contactNumber,
            personalNumber=org.personalNumber,
            address=org.address,
            city=org.city,
            state=org.state,
            zipCode=org.zipCode,
            country=org.country,
            companyWebsiteUrl=org.companyWebsiteUrl,
            companyLogoUrl=org.companyLogoUrl,
            companyBannerUrl=org.companyBannerUrl
        )
    except DoesNotExist:
        raise
    except Exception as e:
        raise e
