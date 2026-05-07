from app.requests.createEmployeeReq import createEmployeeReq
from app.requests.updateEmployeeByIDReq import updateEmployeeByIDReq
from app.requests.assignTeamReq import assignTeamReq
from app.Model.Employee import Employee

def createEmployees(requestData: createEmployeeReq, companyAccID: str) -> bool:
    try:
        newEmployee = Employee(
            companyAccID=companyAccID,
            employeeName=requestData.employeeName,
            employeeRoleID=requestData.employeeRoleID,
            employeeDepartmentID=requestData.employeeDepartmentID,
            teamID=requestData.teamID,
            email=requestData.email,
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
        return Employee.objects(companyAccID=companyAccID)
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
            employee.update(
                employeeName=updateData.employeeName,
                employeeRoleID=updateData.employeeRoleID,
                employeeDepartmentID=updateData.employeeDepartmentID,
                teamID=updateData.teamID,
                email=updateData.email,
                contactnumber=updateData.contactnumber,
                address=updateData.address,
                profileImageUrl=updateData.profileImageUrl
            )
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