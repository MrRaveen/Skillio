from app.requests.createEmployeeReq import createEmployeeReq
from app.requests.updateEmployeeByIDReq import updateEmployeeByIDReq
from app.requests.assignTeamReq import assignTeamReq
from app.Model.Employee import Employee

from app.Model.EmployeeRole import EmployeeRole
from app.Model.DefinedSkill import DefinedSkill
from app.Model.Department import Department
from app.response.allEmployeeRes import allEmployeeRes
import secrets
import string

def generate_secure_password(length=16):
    alphabet = string.ascii_letters + string.digits + string.punctuation
    password = ''.join(secrets.choice(alphabet) for _ in range(length))
    return password

def createEmployees(requestData: createEmployeeReq, companyAccID: str,autoGeneratePass:bool) -> bool:
    try:
        if autoGeneratePass:
            password = generate_secure_password()
        else:
            password = requestData.password  
        newEmployee = Employee(
            companyAccID=companyAccID,
            employeeName=requestData.employeeName,
            employeeRoleID=requestData.employeeRoleID,
            employeeDepartmentID=requestData.employeeDepartmentID,
            teamID=requestData.teamID,
            email=requestData.email,
            password=password,
            contactnumber=requestData.contactnumber,
            address=requestData.address,
            profileImageUrl=requestData.profileImageUrl
        )
        newEmployee.save()
        return True
    except Exception as e:
        raise e

def getAllEmployees(companyAccID: str):
    try:
        allEmRes = []
        allEmployees = Employee.objects(companyAccID=companyAccID)
        for employee in allEmployees:
            skillSetNames = []
            role = None
            if employee.employeeRoleID:
                role = EmployeeRole.objects(id=employee.employeeRoleID).first()
            
            role_name = "Unknown Role"
            if role:
                role_name = role.roleName
                for skillID in role.roleSkillid:
                    skill = DefinedSkill.objects(id=skillID).first()
                    if skill:
                        skillSetNames.append(skill.skill_name)
            
            dept = None
            if employee.employeeDepartmentID:
                dept = Department.objects(id=employee.employeeDepartmentID).first()
            
            dept_name = dept.deptName if dept else "Unknown Department"

            resEmSin = allEmployeeRes(
                employeeID=str(employee.id),
                employeeName=employee.employeeName,
                employeeRoleID=employee.employeeRoleID,
                roleName=role_name,
                deptName=dept_name,
                allEmployeeRoleSkills=skillSetNames,
                employeeDepartmentID=employee.employeeDepartmentID,
                teamID=employee.teamID,
                email=employee.email,
                contactnumber=employee.contactnumber,
                address=employee.address,
                profileImageUrl=employee.profileImageUrl
            )
            allEmRes.append(resEmSin)    
        return allEmRes
    except Exception as e:
        raise e

def getEmployeeByID(employeeID: str, companyAccID: str):
    try:
        return Employee.objects(id=employeeID, companyAccID=companyAccID).first()
    except Exception as e:
        raise e

def updateEmployee(employeeID: str, companyAccID: str, updateData: updateEmployeeByIDReq) -> bool:
    try:
        employee = Employee.objects(id=employeeID, companyAccID=companyAccID).first()
        if employee:
            update_fields = {
                "employeeName": updateData.employeeName,
                "employeeRoleID": updateData.employeeRoleID,
                "employeeDepartmentID": updateData.employeeDepartmentID,
                "teamID": updateData.teamID,
                "email": updateData.email,
                "contactnumber": updateData.contactnumber,
                "address": updateData.address,
                "profileImageUrl": updateData.profileImageUrl
            }
            if updateData.password:
                update_fields["password"] = updateData.password
            
            employee.update(**update_fields)
            return True
        return False
    except Exception as e:
        raise e

def deleteEmployee(employeeID: str, companyAccID: str) -> bool:
    try:
        employee = Employee.objects(id=employeeID, companyAccID=companyAccID).first()
        if employee:
            employee.delete()
            return True
        return False
    except Exception as e:
        raise e

def assignTeam(employeeID: str, companyAccID: str, data: assignTeamReq) -> bool:
    """Assign an employee to a team and department."""
    try:
        employee = Employee.objects(id=employeeID, companyAccID=companyAccID).first()
        if employee:
            employee.update(
                teamID=data.teamID,
                employeeDepartmentID=data.employeeDepartmentID
            )
            return True
        return False
    except Exception as e:
        raise e

def nullifyEmployeeDepartment(departmentID: str, companyAccID: str) -> None:
    """Set employeeDepartmentID and teamID to None for all employees in the deleted department."""
    try:
        Employee.objects(
            employeeDepartmentID=departmentID,
            companyAccID=companyAccID
        ).update(set__employeeDepartmentID=None, set__teamID=None)
    except Exception as e:
        raise e

def nullifyEmployeeTeam(teamID: str, companyAccID: str) -> None:
    """Set teamID and employeeDepartmentID to None for all employees in the deleted team."""
    try:
        Employee.objects(
            teamID=teamID,
            companyAccID=companyAccID
        ).update(set__teamID=None, set__employeeDepartmentID=None)
    except Exception as e:
        raise e