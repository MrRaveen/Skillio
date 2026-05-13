from app.requests.createOrgReq import createOrgReq
from app.requests.savePaymentReq import savePaymentReq
from app.Model.OrganizationAccount import OrganizationAccount, PaymentInformation
import datetime
from mongoengine.errors import DoesNotExist


def save_payment_info(reqData: savePaymentReq):
    try:
        payment_info = PaymentInformation(
            planIDInternal = reqData.planIDInternal,
            stripe_customer_id=reqData.stripe_customer_id,
            stripe_subscription_id=reqData.stripe_subscription_id,
            stripe_price_id=reqData.stripe_price_id,
            stripe_subscription_status=reqData.stripe_subscription_status,
            current_period_end=reqData.current_period_end,
            current_period_start=reqData.current_period_start
        )
        
        # Find the existing organization account
        org = OrganizationAccount.objects.get(id=reqData.orgID)
        org.paymentInfo = payment_info
        org.accountStatus = True # Activate the account
        
        # Also update basic plan info
        from app.Model.OrganizationAccount import PlanInformation
        org.planInformation = PlanInformation(
            planID=reqData.planIDInternal,
            subStartedDate=datetime.datetime.now()
        )
        
        org.save()
        return org
    except Exception as e:
        raise e

def create_org_acc(reqData: createOrgReq):
    try:
        # Create new organization account
        org = OrganizationAccount(
            accountStatus = True,
            companyName = reqData.companyName,
            companySize = reqData.companySize,
            companyIndustry = reqData.companyIndustry,
            companyEmail = reqData.companyEmail,
            contactNumber = reqData.contactNumber,
            ownerEmail = reqData.ownerEmail,
            personalNumber = reqData.personalNumber,
            password = reqData.password,  # NOTE: In a real app, hash this!
            address = reqData.address,
            city = reqData.city,
            state = reqData.state,
            zipCode = reqData.zipCode,
            country = reqData.country,
            companyWebsiteUrl = reqData.companyWebsiteUrl,
            companyLogoUrl = reqData.companyLogoUrl,
            companyBannerUrl = reqData.companyBannerUrl
        )
        
        org.save()
        return org
    except Exception as e:
        raise e

def verify_org_login(email, password):
    try:
        # Search for organization account with matching ownerEmail and password
        org = OrganizationAccount.objects.get(ownerEmail=email, password=password)
        return org
    except DoesNotExist:
        return None
    except Exception as e:
        raise e