from app import db
import datetime

class Plan(db.Document):
    meta = {'collection': 'plans'}
    stripePriceID = db.StringField()
    name = db.StringField()
    priceMonth = db.FloatField()
    priceYear = db.FloatField()
    features = db.ListField(db.StringField())
