from app import db

class Department(db.Document):
    meta = {'collection': 'departments'}

    deptName = db.StringField()
    deptDescription = db.StringField()
    companyAccID = db.StringField()
