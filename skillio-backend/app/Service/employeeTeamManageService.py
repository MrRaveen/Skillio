from app.Model.EmployeeTeam import EmployeeTeam
from app.requests.employeeTeamReq import employeeTeamReq
from mongoengine.errors import DoesNotExist
from app.Service.employeeManageService import nullifyEmployeeTeam

def createEmployeeTeam(requestData: employeeTeamReq, companyAccID: str) -> bool:
    try:
        newTeam = EmployeeTeam(
            teamName=requestData.teamName,
            teamDes=requestData.teamDes,
            departmentID=requestData.departmentID,
            companyAccID=companyAccID
        )
        newTeam.save()
        return True
    except Exception as e:
        raise e

def getAllEmployeeTeams(companyAccID: str):
    try:
        return EmployeeTeam.objects(companyAccID=companyAccID)
    except Exception as e:
        raise e

def getEmployeeTeamByID(teamID: str, companyAccID: str):
    try:
        return EmployeeTeam.objects(id=teamID, companyAccID=companyAccID).first()
    except Exception as e:
        raise e

def updateEmployeeTeam(teamID: str, companyAccID: str, updateData: employeeTeamReq) -> bool:
    try:
        team = EmployeeTeam.objects(id=teamID, companyAccID=companyAccID).first()
        if team:
            team.update(
                teamName=updateData.teamName,
                teamDes=updateData.teamDes,
                departmentID=updateData.departmentID
            )
            return True
        return False
    except Exception as e:
        raise e

def deleteEmployeeTeam(teamID: str, companyAccID: str) -> bool:
    try:
        team = EmployeeTeam.objects(id=teamID, companyAccID=companyAccID).first()
        if team:
            # Nullify team/department references on employees first
            nullifyEmployeeTeam(teamID=teamID, companyAccID=companyAccID)
            team.delete()
            return True
        return False
    except Exception as e:
        raise e

def deleteTeamsByDepartment(departmentID: str, companyAccID: str) -> bool:
    try:
        EmployeeTeam.objects(departmentID=departmentID, companyAccID=companyAccID).delete()
        return True
    except Exception as e:
        raise e
