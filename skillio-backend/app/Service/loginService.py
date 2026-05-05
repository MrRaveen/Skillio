from app.requests.createOrgReq import createOrgReq
from app.requests.savePaymentReq import savePaymentReq
from app.Model.OrganizationAccount import OrganizationAccount, PaymentInformation
import datetime

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
        
        # Create new organization account with just payment info and inactive status
        new_org = OrganizationAccount(
            accountStatus=False,
            paymentInfo=payment_info
        )
        new_org.save()
        return new_org
    except Exception as e:
        raise e

def create_org_acc(reqData: createOrgReq):
    try:
        # Fetch the existing organization account created during the payment step
        org = OrganizationAccount.objects.get(id=reqData.orgID)
        
        # Update organization account details
        org.accountStatus = True
        org.companyName = reqData.companyName
        org.companySize = reqData.companySize
        org.companyIndustry = reqData.companyIndustry
        org.companyEmail = reqData.companyEmail
        org.contactNumber = reqData.contactNumber
        org.ownerEmail = reqData.ownerEmail
        org.personalNumber = reqData.personalNumber
        org.password = reqData.password  # NOTE: In a real app, hash this!
        org.address = reqData.address
        org.city = reqData.city
        org.state = reqData.state
        org.zipCode = reqData.zipCode
        org.country = reqData.country
        org.companyWebsiteUrl = reqData.companyWebsiteUrl
        org.companyLogoUrl = reqData.companyLogoUrl
        org.companyBannerUrl = reqData.companyBannerUrl
        
        org.save()
        return org
    except Exception as e:
        raise e