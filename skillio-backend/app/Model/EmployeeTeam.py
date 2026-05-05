from app import db

class EmployeeTeam(db.Document):
    meta = {'collection': 'employeeTeams'}

    teamName = db.StringField()
    teamDes = db.StringField()
    departmentID = db.StringField()
    companyAccID = db.StringField()
