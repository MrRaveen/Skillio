from app import db
import datetime
from app.Model.enum.companySize import companySize
from app.Model.enum.companyIndustry import companyIndustry

class PlanInformation(db.EmbeddedDocument):
    planID = db.StringField()
    subStartedDate = db.DateTimeField()

class PaymentInformation(db.EmbeddedDocument):
    planIDInternal = db.StringField()
    stripe_customer_id = db.StringField()
    stripe_subscription_id = db.StringField()
    stripe_price_id = db.StringField()
    stripe_subscription_status = db.StringField()
    current_period_end = db.DateTimeField()
    current_period_start = db.DateTimeField()

class OrganizationAccount(db.Document):
    meta = {'collection': 'organizationAccounts'}

    accountStatus = db.BooleanField()
    companyName = db.StringField()
    companySize = db.EnumField(companySize)
    companyIndustry = db.EnumField(companyIndustry)
    companyEmail = db.EmailField()
    contactNumber = db.StringField()
    ownerEmail = db.EmailField()
    personalNumber = db.StringField()
    password = db.StringField()
    address = db.StringField()
    city = db.StringField()
    state = db.StringField()
    zipCode = db.StringField()
    country = db.StringField()
    companyWebsiteUrl = db.StringField()
    companyLogoUrl = db.StringField()
    companyBannerUrl = db.StringField()
    planInformation = db.EmbeddedDocumentField(PlanInformation)
    paymentInfo = db.EmbeddedDocumentField(PaymentInformation)