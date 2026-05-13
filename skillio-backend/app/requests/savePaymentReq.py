from pydantic import BaseModel
from datetime import datetime

class savePaymentReq(BaseModel):
    orgID: str
    planIDInternal: str
    stripe_customer_id: str
    stripe_subscription_id: str
    stripe_price_id: str
    stripe_subscription_status: str
    current_period_end: datetime
    current_period_start: datetime
