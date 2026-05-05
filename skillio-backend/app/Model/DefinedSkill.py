from app import db

class DefinedSkill(db.Document):
    meta = {'collection': 'definedSkills'}

    skill_name = db.StringField()
    skill_des = db.StringField()
    companyAccID = db.StringField()
