from app import db
import datetime

class Employee(db.Document):
    meta = {'collection': 'employees'}

    companyAccID = db.StringField()
    employeeName = db.StringField()
    employeeRoleID = db.StringField()
    employeeDepartmentID = db.StringField()
    teamID = db.StringField()
    email = db.EmailField()
    password = db.StringField()
    contactnumber = db.StringField()
    address = db.StringField()
    profileImageUrl = db.StringField()

    