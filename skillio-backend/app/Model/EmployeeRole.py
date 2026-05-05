from app import db

SKILL_LEVEL_CHOICES = ('low', 'medium', 'high', 'expert')

class EmployeeRole(db.Document):
    meta = {'collection': 'employeeRoles'}

    roleName = db.StringField()
    roleDescription = db.StringField()
    roleSkillid = db.ListField(db.StringField())
    skillLevel = db.StringField(choices=SKILL_LEVEL_CHOICES)
    companyAccID = db.StringField()
