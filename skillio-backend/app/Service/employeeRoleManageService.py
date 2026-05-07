from app.Model.EmployeeRole import EmployeeRole
from app.requests.employeeRoleReq import employeeRoleReq
from mongoengine.errors import DoesNotExist

def createEmployeeRole(requestData: employeeRoleReq, companyAccID: str) -> bool:
    try:
        newRole = EmployeeRole(
            roleName=requestData.roleName,
            roleDescription=requestData.roleDescription,
            roleSkillid=requestData.roleSkillid,
            skillLevel=requestData.skillLevel.value,
            companyAccID=companyAccID
        )
        newRole.save()
        return True
    except Exception as e:
        raise e

def getAllEmployeeRoles(companyAccID: str):
    try:
        return EmployeeRole.objects(companyAccID=companyAccID)
    except Exception as e:
        raise e

def getEmployeeRoleByID(roleID: str, companyAccID: str):
    try:
        return EmployeeRole.objects(id=roleID, companyAccID=companyAccID).first()
    except Exception as e:
        raise e

def updateEmployeeRole(roleID: str, companyAccID: str, updateData: employeeRoleReq) -> bool:
    try:
        role = EmployeeRole.objects(id=roleID, companyAccID=companyAccID).first()
        if role:
            role.update(
                roleName=updateData.roleName,
                roleDescription=updateData.roleDescription,
                roleSkillid=updateData.roleSkillid,
                skillLevel=updateData.skillLevel.value
            )
            return True
        return False
    except Exception as e:
        raise e

def deleteEmployeeRole(roleID: str, companyAccID: str) -> bool:
    try:
        role = EmployeeRole.objects(id=roleID, companyAccID=companyAccID).first()
        if role:
            role.delete()
            return True
        return False
    except Exception as e:
        raise e
