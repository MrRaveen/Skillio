from app.Model.DefinedSkill import DefinedSkill
from app.requests.definedSkillReq import definedSkillReq
from mongoengine.errors import DoesNotExist

def createDefinedSkill(requestData: definedSkillReq, companyAccID: str) -> bool:
    try:
        newSkill = DefinedSkill(
            skill_name=requestData.skill_name,
            skill_des=requestData.skill_des,
            companyAccID=companyAccID
        )
        newSkill.save()
        return True
    except Exception as e:
        raise e

def getAllDefinedSkills(companyAccID: str):
    try:
        return DefinedSkill.objects(companyAccID=companyAccID)
    except Exception as e:
        raise e

def getDefinedSkillByID(skillID: str, companyAccID: str):
    try:
        return DefinedSkill.objects(id=skillID, companyAccID=companyAccID).first()
    except Exception as e:
        raise e

def updateDefinedSkill(skillID: str, companyAccID: str, updateData: definedSkillReq) -> bool:
    try:
        skill = DefinedSkill.objects(id=skillID, companyAccID=companyAccID).first()
        if skill:
            skill.update(
                skill_name=updateData.skill_name,
                skill_des=updateData.skill_des
            )
            return True
        return False
    except Exception as e:
        raise e

def deleteDefinedSkill(skillID: str, companyAccID: str) -> bool:
    try:
        skill = DefinedSkill.objects(id=skillID, companyAccID=companyAccID).first()
        if skill:
            skill.delete()
            return True
        return False
    except Exception as e:
        raise e
