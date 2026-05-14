from app.Model.OrganizationAccount import OrganizationAccount, PaymentInformation
from datetime import datetime

def updateSubscription(orgID: str, newPlanIDinternal: str, stripeCustomerID: str, newSubID: str, newStripePriceID: str, current_period_end: datetime, currentPeriodStart: datetime, status: str = "active"):
    try:
        organization = OrganizationAccount.objects(id=orgID).first()
        if not organization:
            print(f"Organization not found for ID: {orgID}")
            return None
            
        # Create new payment info object
        payment_info = PaymentInformation(
            planIDInternal=newPlanIDinternal,
            stripe_customer_id=stripeCustomerID,
            stripe_subscription_id=newSubID,
            stripe_price_id=newStripePriceID,
            stripe_subscription_status=status,
            current_period_end=current_period_end,
            current_period_start=currentPeriodStart
        )
        
        # Atomic update
        organization.update(set__paymentInfo=payment_info)
        organization.reload()
        
        print(f"Successfully updated subscription for Org: {organization.companyName}")
        return organization
        
    except Exception as e:
        print(f"Error in updateSubscription service: {str(e)}")
        raise e

def deleteSubscription(orgID: str):
    try:
        organization = OrganizationAccount.objects(id=orgID).first()
        if not organization:
            return None
            
        if organization.paymentInfo:
            organization.paymentInfo.stripe_subscription_status = "canceled"
            organization.save()
            print(f"Subscription canceled for Org: {organization.companyName}")
            
        return organization
    except Exception as e:
        print(f"Error in deleteSubscription service: {str(e)}")
        raise e