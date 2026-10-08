from app import db

class DocCategory(db.Document):
    meta = {
        'collection': 'docCategories',
        'indexes': [
            {'fields': ['companyID', 'mainCatID']}
        ]
    }

    catName = db.StringField(required=True, min_length=1)
    companyID = db.StringField(required=True)
    insertedBy = db.StringField(required=True)
    mainOrSub = db.StringField(required=True, choices=["main", "sub"])
    mainCatID = db.StringField()
