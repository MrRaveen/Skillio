from app import db

class DocumentAccess(db.Document):
    meta = {
        'collection': 'documentAccess',
        'indexes': [
            {'fields': ['documentBaseID', 'roleID'], 'unique': True},
            {'fields': ['companyID', 'roleID']}
        ]
    }

    documentBaseID = db.StringField(required=True)
    roleID = db.StringField(required=True)
    companyID = db.StringField(required=True)
    permission = db.StringField(required=True, choices=["manage", "read"])
