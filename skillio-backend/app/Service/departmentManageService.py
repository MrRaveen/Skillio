from app.Model.Department import Department
from app.Model.EmployeeTeam import EmployeeTeam
from app.requests.departmentReq import departmentReq
from mongoengine.errors import DoesNotExist
from app.Service.employeeManageService import nullifyEmployeeDepartment

def createDepartment(requestData: departmentReq, companyAccID: str) -> bool:
    try:
        newDept = Department(
            deptName=requestData.deptName,
            deptDescription=requestData.deptDescription,
            companyAccID=companyAccID
        )
        newDept.save()
        return True
    except Exception as e:
        raise e

def getAllDepartments(companyAccID: str):
    try:
        return Department.objects(companyAccID=companyAccID)
    except Exception as e:
        raise e

def getDepartmentByID(departmentID: str, companyAccID: str):
    try:
        return Department.objects(id=departmentID, companyAccID=companyAccID).first()
    except Exception as e:
        raise e

def updateDepartment(departmentID: str, companyAccID: str, updateData: departmentReq) -> bool:
    try:
        dept = Department.objects(id=departmentID, companyAccID=companyAccID).first()
        if dept:
            dept.update(
                deptName=updateData.deptName,
                deptDescription=updateData.deptDescription
            )
            return True
        return False
    except Exception as e:
        raise e

def deleteDepartment(departmentID: str, companyAccID: str) -> bool:
    try:
        dept = Department.objects(id=departmentID, companyAccID=companyAccID).first()
        if dept:
            # Nullify department/team references on employees
            nullifyEmployeeDepartment(departmentID=departmentID, companyAccID=companyAccID)
            # Delete associated teams
            EmployeeTeam.objects(departmentID=departmentID, companyAccID=companyAccID).delete()
            dept.delete()
            return True
        return False
    except Exception as e:
        raise e
