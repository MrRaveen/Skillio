from app import db
import datetime

class DocumentBase(db.Document):
    meta = {
        'collection': 'documentsBase',
        'indexes': [
            {'fields': ['companyAccID', 'accessLevel']}
        ]
    }

    documentName = db.StringField(required=True, min_length=1)
    documentDescription = db.StringField()
    uploadedUrl = db.StringField(required=True)
    timestamp = db.DateTimeField(required=True, default=datetime.datetime.utcnow)
    insertedBy = db.StringField(required=True)
    isMainCategory = db.BooleanField(required=True)
    mainCategoryID = db.StringField(required=True)
    subCategoryID = db.StringField()
    companyAccID = db.StringField(required=True)
    accessLevel = db.StringField(required=False, choices=["public", "restricted", "private"])
