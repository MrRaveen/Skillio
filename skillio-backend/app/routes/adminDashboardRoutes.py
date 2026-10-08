from flask import Blueprint, request, jsonify
from mongoengine.errors import NotUniqueError, ValidationError, DoesNotExist
from pydantic import ValidationError as PydanticValidationError
import os
from datetime import datetime
from app.requests.createEmployeeReq import createEmployeeReq
from app.requests.updateEmployeeByIDReq import updateEmployeeByIDReq
from app.requests.assignTeamReq import assignTeamReq
from app.requests.updateOrgReq import updateOrgReq
from app.requests.departmentReq import departmentReq
from app.requests.employeeTeamReq import employeeTeamReq
from app.requests.definedSkillReq import definedSkillReq
from app.requests.employeeRoleReq import employeeRoleReq
from app.response.orgProfileRes import orgProfileRes
from app.Model.Plan import Plan
from app.Model.OrganizationAccount import OrganizationAccount
from app.decorators import token_required
from app.Service.companyManageService import (updateCompanyByID, getOrgProfile)
from app.Service.employeeManageService import (
    createEmployees,
    getAllEmployees,
    getEmployeeByID,
    updateEmployee,
    deleteEmployee,
    assignTeam
)
from app.Tasks.generate_course import generate_initial_questions
from app.mocks.task_mock import mock_ai_training_task
from app.Service.departmentManageService import (
    createDepartment,
    getAllDepartments,
    getDepartmentByID,
    updateDepartment,
    deleteDepartment
)
from app.Service.employeeTeamManageService import (
    createEmployeeTeam,
    getAllEmployeeTeams,
    getEmployeeTeamByID,
    updateEmployeeTeam,
    deleteEmployeeTeam
)
from app.Service.definedSkillManageService import (
    createDefinedSkill,
    getAllDefinedSkills,
    getDefinedSkillByID,
    updateDefinedSkill,
    deleteDefinedSkill
)
from app.Service.employeeRoleManageService import (
    createEmployeeRole,
    getAllEmployeeRoles,
    getEmployeeRoleByID,
    updateEmployeeRole,
    deleteEmployeeRole
)
from app.Service.docCategoryManageService import (
    createDocCategory,
    getAllDocCategories,
    getDocCategoryByID,
    updateDocCategory,
    deleteDocCategory,
    getDocCategoryDetails
)
from app.Service.documentManageService import (
    createDocument,
    getAllDocuments,
    getDocumentByID,
    updateDocument,
    deleteDocument
)
import cloudinary.utils
adminDashboardRoutes = Blueprint('adminDashboardRoutes', __name__)

@adminDashboardRoutes.route('/employee-manage', methods=['POST'])
@token_required
def createEmployeesFun(decorated_data):
    try:
        requestData = request.get_json()
        if not requestData:
            return jsonify({
                "status": "failed",
                "message": "Request body is missing or not valid JSON"
            }), 400
        validatedData = createEmployeeReq(**requestData)
        savedResult = createEmployees(
            requestData=validatedData,
            companyAccID=decorated_data.get('id'),
            autoGeneratePass=validatedData.autoGeneratePassStatus
        )
        if savedResult:
            return jsonify({
                "status": "success",
                "message": "Employee is created"
            }), 201
        else:
            return jsonify({
                "status": "failed",
                "message": "Employee is not created"
            }), 500
    except PydanticValidationError as e:
        return jsonify({
            "status": "failed",
            "message": "Validation error",
            "errors": e.errors()
        }), 422
    except NotUniqueError:
        return jsonify({
            "status": "failed",
            "message": "An employee with this email already exists"
        }), 409
    except Exception as e:
        return jsonify({
            "status": "failed",
            "message": f"Unknown error occurred : {str(e)}"
        }), 500

@adminDashboardRoutes.route('/employee-manage', methods=['GET'])
@token_required
def getEmployees(decorated_data):
    try:
        employees = getAllEmployees(companyAccID=decorated_data.get('id'))
        import json
        return jsonify({
            "status": "success",
            "data": [employee.model_dump() for employee in employees]
        }), 200
    except Exception as e:
        return jsonify({
            "status": "failed",
            "message": f"Unknown error occurred : {str(e)}"
        }), 500

@adminDashboardRoutes.route('/employee-manage/<employeeID>', methods=['GET'])
@token_required
def getEmployee(decorated_data, employeeID):
    try:
        import json
        employee = getEmployeeByID(employeeID=employeeID, companyAccID=decorated_data.get('id'))
        if employee:
            return jsonify({
                "status": "success",
                "data": json.loads(employee.to_json())
            }), 200
        else:
            return jsonify({
                "status": "failed",
                "message": "Employee not found"
            }), 404
    except Exception as e:
        return jsonify({
            "status": "failed",
            "message": f"Unknown error occurred : {str(e)}"
        }), 500

@adminDashboardRoutes.route('/employee-manage/<employeeID>', methods=['PUT'])
@token_required
def updateEmployeeByID(decorated_data, employeeID):
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                "status": "failed",
                "message": "Request body is missing or not valid JSON"
            }), 400
        validatedData = updateEmployeeByIDReq(**data)
        updatedResult = updateEmployee(
            employeeID=employeeID,
            companyAccID=decorated_data.get('id'),
            updateData=validatedData
        )
        if updatedResult:
            return jsonify({
                "status": "success",
                "message": "Employee updated successfully"
            }), 200
        else:
            return jsonify({
                "status": "failed",
                "message": "Employee not found or update failed"
            }), 404
    except PydanticValidationError as e:
        return jsonify({
            "status": "failed",
            "message": "Validation error",
            "errors": e.errors()
        }), 422
    except Exception as e:
        return jsonify({
            "status": "failed",
            "message": f"Unknown error occurred : {str(e)}"
        }), 500

@adminDashboardRoutes.route('/employee-manage/<employeeID>', methods=['DELETE'])
@token_required
def deleteEmployeeByID(decorated_data, employeeID):
    try:
        deletedResult = deleteEmployee(
            employeeID=employeeID,
            companyAccID=decorated_data.get('id')
        )
        if deletedResult:
            return jsonify({
                "status": "success",
                "message": "Employee deleted successfully"
            }), 200
        else:
            return jsonify({
                "status": "failed",
                "message": "Employee not found or delete failed"
            }), 404
    except Exception as e:
        return jsonify({
            "status": "failed",
            "message": f"Unknown error occurred : {str(e)}"
        }), 500

@adminDashboardRoutes.route('/employee-manage/<employeeID>/assign-team', methods=['PUT'])
@token_required
def assignEmployeeTeam(decorated_data, employeeID):
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                "status": "failed",
                "message": "Request body is missing or not valid JSON"
            }), 400
        validatedData = assignTeamReq(**data)
        assignResult = assignTeam(
            employeeID=employeeID,
            companyAccID=decorated_data.get('id'),
            data=validatedData
        )
        if assignResult:
            return jsonify({
                "status": "success",
                "message": "Employee assigned to team successfully"
            }), 200
        else:
            return jsonify({
                "status": "failed",
                "message": "Employee not found"
            }), 404
    except PydanticValidationError as e:
        return jsonify({
            "status": "failed",
            "message": "Validation error",
            "errors": e.errors()
        }), 422
    except Exception as e:
        return jsonify({
            "status": "failed",
            "message": f"Unknown error occurred : {str(e)}"
        }), 500

@adminDashboardRoutes.route('/company-profile', methods=['PUT'])
@token_required
def updateCompanyProfile(decorated_data):
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                "status": "failed",
                "message": "Request body is missing or not valid JSON"
            }), 400
        validatedData = updateOrgReq(**data)
        updateStatus = updateCompanyByID(
            companyID=decorated_data.get('id'),
            updateInfo=validatedData
        )
        if updateStatus:
            return jsonify({
                "status": "success",
                "message": "Organization is updated"
            }), 200
        else:
            return jsonify({
                "status": "failed",
                "message": "Organization is not updated"
            }), 500
    except PydanticValidationError as e:
        return jsonify({
            "status": "failed",
            "message": "Validation error",
            "errors": e.errors()
        }), 422
    except DoesNotExist:
        return jsonify({
            "status": "failed",
            "message": "Organization not found"
        }), 404
    except Exception as e:
        return jsonify({
            "status": "failed",
            "message": f"Unknown error occurred : {str(e)}"
        }), 500

@adminDashboardRoutes.route('/company-profile', methods=['GET'])
@token_required
def getOrgByID(decorated_data):
    try:
        returnedProfile = getOrgProfile(orgID=decorated_data.get('id'))
        if returnedProfile:
            return jsonify({
                "status": "success",
                "data": returnedProfile.model_dump()
            }), 200
        else:
            return jsonify({
                "status": "failed",
                "message": "Organization profile not found"
            }), 404
    except DoesNotExist:
        return jsonify({
            "status": "failed",
            "message": "Organization not found"
        }), 404
    except Exception as e:
        return jsonify({
            "status": "failed",
            "message": f"Unknown error occurred : {str(e)}"
        }), 500
@adminDashboardRoutes.route('/department-manage', methods=['POST'])
@token_required
def createDeptFun(decorated_data):
    try:
        requestData = request.get_json()
        if not requestData:
            return jsonify({
                "status": "failed",
                "message": "Request body is missing or not valid JSON"
            }), 400
        validatedData = departmentReq(**requestData)
        savedResult = createDepartment(
            requestData=validatedData,
            companyAccID=decorated_data.get('id')
        )
        if savedResult:
            return jsonify({
                "status": "success",
                "message": "Department is created"
            }), 201
        else:
            return jsonify({
                "status": "failed",
                "message": "Department is not created"
            }), 500
    except PydanticValidationError as e:
        return jsonify({
            "status": "failed",
            "message": "Validation error",
            "errors": e.errors()
        }), 422
    except Exception as e:
        return jsonify({
            "status": "failed",
            "message": f"Unknown error occurred : {str(e)}"
        }), 500

@adminDashboardRoutes.route('/department-manage', methods=['GET'])
@token_required
def getDepts(decorated_data):
    try:
        departments = getAllDepartments(companyAccID=decorated_data.get('id'))
        import json
        return jsonify({
            "status": "success",
            "data": [json.loads(dept.to_json()) for dept in departments]
        }), 200
    except Exception as e:
        return jsonify({
            "status": "failed",
            "message": f"Unknown error occurred : {str(e)}"
        }), 500

@adminDashboardRoutes.route('/department-manage/<departmentID>', methods=['GET'])
@token_required
def getDept(decorated_data, departmentID):
    try:
        import json
        department = getDepartmentByID(departmentID=departmentID, companyAccID=decorated_data.get('id'))
        if department:
            return jsonify({
                "status": "success",
                "data": json.loads(department.to_json())
            }), 200
        else:
            return jsonify({
                "status": "failed",
                "message": "Department not found"
            }), 404
    except Exception as e:
        return jsonify({
            "status": "failed",
            "message": f"Unknown error occurred : {str(e)}"
        }), 500

@adminDashboardRoutes.route('/department-manage/<departmentID>', methods=['PUT'])
@token_required
def updateDeptByID(decorated_data, departmentID):
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                "status": "failed",
                "message": "Request body is missing or not valid JSON"
            }), 400
        validatedData = departmentReq(**data)
        updatedResult = updateDepartment(
            departmentID=departmentID,
            companyAccID=decorated_data.get('id'),
            updateData=validatedData
        )
        if updatedResult:
            return jsonify({
                "status": "success",
                "message": "Department updated successfully"
            }), 200
        else:
            return jsonify({
                "status": "failed",
                "message": "Department not found or update failed"
            }), 404
    except PydanticValidationError as e:
        return jsonify({
            "status": "failed",
            "message": "Validation error",
            "errors": e.errors()
        }), 422
    except Exception as e:
        return jsonify({
            "status": "failed",
            "message": f"Unknown error occurred : {str(e)}"
        }), 500

@adminDashboardRoutes.route('/department-manage/<departmentID>', methods=['DELETE'])
@token_required
def deleteDeptByID(decorated_data, departmentID):
    try:
        deletedResult = deleteDepartment(
            departmentID=departmentID,
            companyAccID=decorated_data.get('id')
        )
        if deletedResult:
            return jsonify({
                "status": "success",
                "message": "Department deleted successfully"
            }), 200
        else:
            return jsonify({
                "status": "failed",
                "message": "Department not found or delete failed"
            }), 404
    except Exception as e:
        return jsonify({
            "status": "failed",
            "message": f"Unknown error occurred : {str(e)}"
        }), 500

@adminDashboardRoutes.route('/team-manage', methods=['POST'])
@token_required
def createTeamFun(decorated_data):
    try:
        requestData = request.get_json()
        if not requestData:
            return jsonify({
                "status": "failed",
                "message": "Request body is missing or not valid JSON"
            }), 400
        validatedData = employeeTeamReq(**requestData)
        savedResult = createEmployeeTeam(
            requestData=validatedData,
            companyAccID=decorated_data.get('id')
        )
        if savedResult:
            return jsonify({
                "status": "success",
                "message": "Team is created"
            }), 201
        else:
            return jsonify({
                "status": "failed",
                "message": "Team is not created"
            }), 500
    except PydanticValidationError as e:
        return jsonify({
            "status": "failed",
            "message": "Validation error",
            "errors": e.errors()
        }), 422
    except Exception as e:
        return jsonify({
            "status": "failed",
            "message": f"Unknown error occurred : {str(e)}"
        }), 500

@adminDashboardRoutes.route('/team-manage', methods=['GET'])
@token_required
def getTeams(decorated_data):
    try:
        teams = getAllEmployeeTeams(companyAccID=decorated_data.get('id'))
        import json
        return jsonify({
            "status": "success",
            "data": [json.loads(team.to_json()) for team in teams]
        }), 200
    except Exception as e:
        return jsonify({
            "status": "failed",
            "message": f"Unknown error occurred : {str(e)}"
        }), 500

@adminDashboardRoutes.route('/team-manage/<teamID>', methods=['GET'])
@token_required
def getTeam(decorated_data, teamID):
    try:
        import json
        team = getEmployeeTeamByID(teamID=teamID, companyAccID=decorated_data.get('id'))
        if team:
            return jsonify({
                "status": "success",
                "data": json.loads(team.to_json())
            }), 200
        else:
            return jsonify({
                "status": "failed",
                "message": "Team not found"
            }), 404
    except Exception as e:
        return jsonify({
            "status": "failed",
            "message": f"Unknown error occurred : {str(e)}"
        }), 500

@adminDashboardRoutes.route('/team-manage/<teamID>', methods=['PUT'])
@token_required
def updateTeamByID(decorated_data, teamID):
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                "status": "failed",
                "message": "Request body is missing or not valid JSON"
            }), 400
        validatedData = employeeTeamReq(**data)
        updatedResult = updateEmployeeTeam(
            teamID=teamID,
            companyAccID=decorated_data.get('id'),
            updateData=validatedData
        )
        if updatedResult:
            return jsonify({
                "status": "success",
                "message": "Team updated successfully"
            }), 200
        else:
            return jsonify({
                "status": "failed",
                "message": "Team not found or update failed"
            }), 404
    except PydanticValidationError as e:
        return jsonify({
            "status": "failed",
            "message": "Validation error",
            "errors": e.errors()
        }), 422
    except Exception as e:
        return jsonify({
            "status": "failed",
            "message": f"Unknown error occurred : {str(e)}"
        }), 500

@adminDashboardRoutes.route('/team-manage/<teamID>', methods=['DELETE'])
@token_required
def deleteTeamByID(decorated_data, teamID):
    try:
        deletedResult = deleteEmployeeTeam(
            teamID=teamID,
            companyAccID=decorated_data.get('id')
        )
        if deletedResult:
            return jsonify({
                "status": "success",
                "message": "Team deleted successfully"
            }), 200
        else:
            return jsonify({
                "status": "failed",
                "message": "Team not found or delete failed"
            }), 404
    except Exception as e:
        return jsonify({
            "status": "failed",
            "message": f"Unknown error occurred : {str(e)}"
        }), 500

@adminDashboardRoutes.route('/skill-manage', methods=['POST'])
@token_required
def createSkillFun(decorated_data):
    try:
        requestData = request.get_json()
        if not requestData:
            return jsonify({
                "status": "failed",
                "message": "Request body is missing or not valid JSON"
            }), 400
        validatedData = definedSkillReq(**requestData)
        savedResult = createDefinedSkill(
            requestData=validatedData,
            companyAccID=decorated_data.get('id')
        )
        if savedResult:
            return jsonify({
                "status": "success",
                "message": "Skill is created"
            }), 201
        else:
            return jsonify({
                "status": "failed",
                "message": "Skill is not created"
            }), 500
    except PydanticValidationError as e:
        return jsonify({
            "status": "failed",
            "message": "Validation error",
            "errors": e.errors()
        }), 422
    except Exception as e:
        return jsonify({
            "status": "failed",
            "message": f"Unknown error occurred : {str(e)}"
        }), 500

@adminDashboardRoutes.route('/skill-manage', methods=['GET'])
@token_required
def getSkills(decorated_data):
    try:
        skills = getAllDefinedSkills(companyAccID=decorated_data.get('id'))
        import json
        return jsonify({
            "status": "success",
            "data": [json.loads(skill.to_json()) for skill in skills]
        }), 200
    except Exception as e:
        return jsonify({
            "status": "failed",
            "message": f"Unknown error occurred : {str(e)}"
        }), 500

@adminDashboardRoutes.route('/skill-manage/<skillID>', methods=['GET'])
@token_required
def getSkill(decorated_data, skillID):
    try:
        import json
        skill = getDefinedSkillByID(skillID=skillID, companyAccID=decorated_data.get('id'))
        if skill:
            return jsonify({
                "status": "success",
                "data": json.loads(skill.to_json())
            }), 200
        else:
            return jsonify({
                "status": "failed",
                "message": "Skill not found"
            }), 404
    except Exception as e:
        return jsonify({
            "status": "failed",
            "message": f"Unknown error occurred : {str(e)}"
        }), 500

@adminDashboardRoutes.route('/skill-manage/<skillID>', methods=['PUT'])
@token_required
def updateSkillByID(decorated_data, skillID):
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                "status": "failed",
                "message": "Request body is missing or not valid JSON"
            }), 400
        validatedData = definedSkillReq(**data)
        updatedResult = updateDefinedSkill(
            skillID=skillID,
            companyAccID=decorated_data.get('id'),
            updateData=validatedData
        )
        if updatedResult:
            return jsonify({
                "status": "success",
                "message": "Skill updated successfully"
            }), 200
        else:
            return jsonify({
                "status": "failed",
                "message": "Skill not found or update failed"
            }), 404
    except PydanticValidationError as e:
        return jsonify({
            "status": "failed",
            "message": "Validation error",
            "errors": e.errors()
        }), 422
    except Exception as e:
        return jsonify({
            "status": "failed",
            "message": f"Unknown error occurred : {str(e)}"
        }), 500

@adminDashboardRoutes.route('/skill-manage/<skillID>', methods=['DELETE'])
@token_required
def deleteSkillByID(decorated_data, skillID):
    try:
        deletedResult = deleteDefinedSkill(
            skillID=skillID,
            companyAccID=decorated_data.get('id')
        )
        if deletedResult:
            return jsonify({
                "status": "success",
                "message": "Skill deleted successfully"
            }), 200
        else:
            return jsonify({
                "status": "failed",
                "message": "Skill not found or delete failed"
            }), 404
    except Exception as e:
        return jsonify({
            "status": "failed",
            "message": f"Unknown error occurred : {str(e)}"
        }), 500

@adminDashboardRoutes.route('/role-manage', methods=['POST'])
@token_required
def createRoleFun(decorated_data):
    try:
        requestData = request.get_json()
        if not requestData:
            return jsonify({
                "status": "failed",
                "message": "Request body is missing or not valid JSON"
            }), 400
        validatedData = employeeRoleReq(**requestData)
        savedResult = createEmployeeRole(
            requestData=validatedData,
            companyAccID=decorated_data.get('id')
        )
        if savedResult:
            return jsonify({
                "status": "success",
                "message": "Role is created"
            }), 201
        else:
            return jsonify({
                "status": "failed",
                "message": "Role is not created"
            }), 500
    except PydanticValidationError as e:
        return jsonify({
            "status": "failed",
            "message": "Validation error",
            "errors": e.errors()
        }), 422
    except Exception as e:
        return jsonify({
            "status": "failed",
            "message": f"Unknown error occurred : {str(e)}"
        }), 500

@adminDashboardRoutes.route('/role-manage', methods=['GET'])
@token_required
def getRoles(decorated_data):
    try:
        roles = getAllEmployeeRoles(companyAccID=decorated_data.get('id'))
        import json
        return jsonify({
            "status": "success",
            "data": [json.loads(role.to_json()) for role in roles]
        }), 200
    except Exception as e:
        return jsonify({
            "status": "failed",
            "message": f"Unknown error occurred : {str(e)}"
        }), 500

@adminDashboardRoutes.route('/role-manage/<roleID>', methods=['GET'])
@token_required
def getRole(decorated_data, roleID):
    try:
        import json
        role = getEmployeeRoleByID(roleID=roleID, companyAccID=decorated_data.get('id'))
        if role:
            return jsonify({
                "status": "success",
                "data": json.loads(role.to_json())
            }), 200
        else:
            return jsonify({
                "status": "failed",
                "message": "Role not found"
            }), 404
    except Exception as e:
        return jsonify({
            "status": "failed",
            "message": f"Unknown error occurred : {str(e)}"
        }), 500

@adminDashboardRoutes.route('/role-manage/<roleID>', methods=['PUT'])
@token_required
def updateRoleByID(decorated_data, roleID):
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                "status": "failed",
                "message": "Request body is missing or not valid JSON"
            }), 400
        validatedData = employeeRoleReq(**data)
        updatedResult = updateEmployeeRole(
            roleID=roleID,
            companyAccID=decorated_data.get('id'),
            updateData=validatedData
        )
        if updatedResult:
            return jsonify({
                "status": "success",
                "message": "Role updated successfully"
            }), 200
        else:
            return jsonify({
                "status": "failed",
                "message": "Role not found or update failed"
            }), 404
    except PydanticValidationError as e:
        return jsonify({
            "status": "failed",
            "message": "Validation error",
            "errors": e.errors()
        }), 422
    except Exception as e:
        return jsonify({
            "status": "failed",
            "message": f"Unknown error occurred : {str(e)}"
        }), 500

@adminDashboardRoutes.route('/role-manage/<roleID>', methods=['DELETE'])
@token_required
def deleteRoleByID(decorated_data, roleID):
    try:
        deletedResult = deleteEmployeeRole(
            roleID=roleID,
            companyAccID=decorated_data.get('id')
        )
        if deletedResult:
            return jsonify({
                "status": "success",
                "message": "Role deleted successfully"
            }), 200
        else:
            return jsonify({
                "status": "failed",
                "message": "Role not found or delete failed"
            }), 404
    except Exception as e:
        return jsonify({
            "status": "failed",
            "message": f"Unknown error occurred : {str(e)}"
        }), 500

@adminDashboardRoutes.route('/start-training', methods=['POST'])
@token_required
def startTraining(decorated_data):
    try:
        data = request.get_json()
        target_skills = data.get('target_skills')
        role = data.get('role')
        employeeID = data.get('employeeID')
        practiceMidTestsCount=data.get('practiceMidTestsCount')
        questionCountForSet = data.get('questionCountForSet')
        if not all([target_skills, role, employeeID]):
            return jsonify({
                "status": "failed",
                "message": "Missing required fields (target_skills, role, employeeID)"
            }), 400

        orgAccID = decorated_data.get('id')
        task = generate_initial_questions.delay(target_skills, role, employeeID, orgAccID,practiceMidTestsCount,questionCountForSet)
        # task = mock_ai_training_task.delay(orgAccID)
        return jsonify({
            "status": "success",
            "message": "Celery task triggered",
            "task_id": task.id
        }), 202
    except Exception as e:
        return jsonify({
            "status": "failed",
            "message": str(e)
        }), 500    

@adminDashboardRoutes.route('/get-all-training', methods=['GET'])
@token_required
def getAllTraining(decorated_data):
    try:
        orgID = decorated_data.get('id')
        from app.Service.trainingService import getAllTrainingData
        trainings = getAllTrainingData(orgID)
        return jsonify({
            "status": "success",
            "data": trainings
        }), 200
    except Exception as e:
        return jsonify({
            "status": "failed",
            "message": str(e)
        }), 500

@adminDashboardRoutes.route('/get-all-training-per-employee', methods=['GET'])
@token_required
def getAllTrainingPerEmployee(decorated_data):
    try:
        orgID = decorated_data.get('id')
        from app.Service.trainingService import getAllTrainingDataPerEmployee
        trainings_per_employee = getAllTrainingDataPerEmployee(orgID)
        return jsonify({
            "status": "success",
            "data": trainings_per_employee
        }), 200
    except Exception as e:
        return jsonify({
            "status": "failed",
            "message": str(e)
        }), 500

@adminDashboardRoutes.route('/generate-signature', methods=['GET'])
def generate_signature():
    # 1. Generate a timestamp (signatures are valid for 1 hour by default)
    import time
    timestamp = int(time.time())
    
    # 2. Define optional upload parameters (e.g., specific folder or tags)
    params_to_sign = {
        'timestamp': timestamp,
        'folder': 'skillio-media' # Optional: lock the upload to a specific folder
    }
    
    # 3. Generate the cryptographic signature using your API Secret
    signature = cloudinary.utils.api_sign_request(
        params_to_sign, 
        os.getenv('CLOUDINARY_API_SECRET')
    )
    
    # 4. Return the required data to the client
    return jsonify({
        'timestamp': timestamp,
        'signature': signature,
        'api_key': os.getenv('CLOUDINARY_API_KEY'),
        'cloud_name': os.getenv('CLOUDINARY_CLOUD_NAME'),
        'folder': 'skillio-media'
    }), 200

@adminDashboardRoutes.route('/plans', methods=['GET'])
def get_plans():
    try:
        plans = Plan.objects.all()
        import json
        return jsonify({
            "status": "success",
            "data": [json.loads(plan.to_json()) for plan in plans]
        }), 200
    except Exception as e:
        return jsonify({
            "status": "failed",
            "message": f"Unknown error occurred : {str(e)}"
        }), 500

#stripe sub management
import stripe
@adminDashboardRoutes.route('/create-customer-portal-session-update', methods=['POST'])
@token_required
def create_portal_session(decorated_data):
    try:
        data = request.get_json()
        price_id = data.get('priceId')
        planIDInternal = data.get('planID')
        return_url = "http://localhost:3000/Dashboard"
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price': price_id,
                'quantity': 1,
            }],
            mode='subscription',
            success_url=f"{return_url}",
            cancel_url=f"{os.getenv('FRONTEND_URL')}/cancel",
            metadata={
                'planIDInternal': planIDInternal,
                'orgID': decorated_data.get('id')
            }
        )
        return jsonify({"url": session.url}), 200
    except Exception as e:
        print(f"Error creating portal session: {str(e)}")
        return jsonify({"error": str(e)}), 500

@adminDashboardRoutes.route('/get-subscription-data', methods=['GET'])
@token_required
def getSubData(decorated_data):
    try:
        org_id = decorated_data.get('id')
        org = OrganizationAccount.objects(id=org_id).first()
        
        if not org:
            return jsonify({"status": "failed", "message": "Organization not found"}), 404
            
        if not org.paymentInfo:
            return jsonify({"status": "failed", "message": "No payment information found"}), 404
            
        planID = org.paymentInfo.planIDInternal
        if not planID:
            return jsonify({"status": "failed", "message": "No plan assigned"}), 404
            
        planDetails = Plan.objects(id=planID).first()
        if not planDetails:
            return jsonify({"status": "failed", "message": "Plan details not found"}), 404
            
        # Convert to dictionary for response
        plan_dict = planDetails.to_mongo().to_dict()
        if '_id' in plan_dict:
            plan_dict['id'] = str(plan_dict['_id'])
            del plan_dict['_id']
            
        return jsonify({
            "status": "success",
            "plan": plan_dict,
            "subscription": {
                "status": org.paymentInfo.stripe_subscription_status,
                "current_period_end": org.paymentInfo.current_period_end.isoformat() if org.paymentInfo.current_period_end else None,
                "current_period_start": org.paymentInfo.current_period_start.isoformat() if org.paymentInfo.current_period_start else None,
                "stripe_subscription_id": org.paymentInfo.stripe_subscription_id
            }
        }), 200
        
    except Exception as e:
        print(f"Error in getSubData: {str(e)}")
        return jsonify({
            "status": "failed",
            "message": f"Server error: {str(e)}"
        }), 500


# ---------------------------------------------
# Document Category Management
# ---------------------------------------------

@adminDashboardRoutes.route('/doc-category-manage', methods=['POST'])
@token_required
def createDocCategoryFun(decorated_data):
    """
    Create a document category.
    Body: { catName, mainOrSub, mainCatID? }
    - mainCatID is required when mainOrSub == 'sub'
    - mainCatID is ignored when mainOrSub == 'main'
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"status": "failed", "message": "Request body is missing or not valid JSON"}), 400

        catName   = data.get("catName")
        mainOrSub = data.get("mainOrSub")
        mainCatID = data.get("mainCatID")

        if not catName or not mainOrSub:
            return jsonify({"status": "failed", "message": "catName and mainOrSub are required"}), 400

        if mainOrSub not in ("main", "sub"):
            return jsonify({"status": "failed", "message": "mainOrSub must be 'main' or 'sub'"}), 400

        if mainOrSub == "sub" and not mainCatID:
            return jsonify({"status": "failed", "message": "mainCatID is required when mainOrSub is 'sub'"}), 400

        savedResult = createDocCategory(
            catName=catName,
            mainOrSub=mainOrSub,
            companyID=decorated_data.get("id"),
            insertedBy=decorated_data.get("id"),
            mainCatID=mainCatID if mainOrSub == "sub" else None
        )
        if savedResult:
            return jsonify({"status": "success", "message": "Document category created"}), 201
        return jsonify({"status": "failed", "message": "Document category could not be created"}), 500

    except ValueError as e:
        return jsonify({"status": "failed", "message": str(e)}), 422
    except Exception as e:
        return jsonify({"status": "failed", "message": f"Unknown error occurred : {str(e)}"}), 500


@adminDashboardRoutes.route('/doc-category-manage', methods=['GET'])
@token_required
def getDocCategories(decorated_data):
    """Retrieve all document categories for the authenticated company."""
    try:
        import json
        categories = getAllDocCategories(companyID=decorated_data.get("id"))
        return jsonify({
            "status": "success",
            "data": [json.loads(cat.to_json()) for cat in categories]
        }), 200
    except Exception as e:
        return jsonify({"status": "failed", "message": f"Unknown error occurred : {str(e)}"}), 500


@adminDashboardRoutes.route('/doc-category-manage/<categoryID>', methods=['GET'])
@token_required
def getDocCategory(decorated_data, categoryID):
    """Retrieve a single document category by ID."""
    try:
        import json
        category = getDocCategoryByID(categoryID=categoryID, companyID=decorated_data.get("id"))
        if category:
            return jsonify({"status": "success", "data": json.loads(category.to_json())}), 200
        return jsonify({"status": "failed", "message": "Document category not found"}), 404
    except Exception as e:
        return jsonify({"status": "failed", "message": f"Unknown error occurred : {str(e)}"}), 500


@adminDashboardRoutes.route('/doc-category-manage/<categoryID>', methods=['PUT'])
@token_required
def updateDocCategoryByID(decorated_data, categoryID):
    """
    Update a document category.
    Body: { catName, mainOrSub, mainCatID? }

    Behaviour:
    - 'main' -> 'sub'  : mainCatID required; category becomes sub of that parent.
    - 'sub'  -> 'main' : if children exist, mainCatID required to re-parent them and
                         reposition this category as sub of that new parent.
    - 'main' -> 'main' : plain name update (mainCatID ignored).
    - 'sub'  -> 'sub'  : update catName and optionally re-parent via mainCatID.
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"status": "failed", "message": "Request body is missing or not valid JSON"}), 400

        catName   = data.get("catName")
        mainOrSub = data.get("mainOrSub")
        mainCatID = data.get("mainCatID")

        if not catName or not mainOrSub:
            return jsonify({"status": "failed", "message": "catName and mainOrSub are required"}), 400

        if mainOrSub not in ("main", "sub"):
            return jsonify({"status": "failed", "message": "mainOrSub must be 'main' or 'sub'"}), 400

        if mainOrSub == "sub" and not mainCatID:
            return jsonify({"status": "failed", "message": "mainCatID is required when mainOrSub is 'sub'"}), 400

        updatedResult = updateDocCategory(
            categoryID=categoryID,
            companyID=decorated_data.get("id"),
            catName=catName,
            mainOrSub=mainOrSub,
            mainCatID=mainCatID
        )
        if updatedResult:
            return jsonify({"status": "success", "message": "Document category updated successfully"}), 200
        return jsonify({"status": "failed", "message": "Document category not found or update failed"}), 404

    except ValueError as e:
        return jsonify({"status": "failed", "message": str(e)}), 422
    except Exception as e:
        return jsonify({"status": "failed", "message": f"Unknown error occurred : {str(e)}"}), 500


@adminDashboardRoutes.route('/doc-category-manage/<categoryID>', methods=['DELETE'])
@token_required
def deleteDocCategoryByID(decorated_data, categoryID):
    """
    Delete a document category and cascade:
    - Deletes all sub-categories that reference this category.
    - Deletes all DocumentBase documents referencing this category (or any of its sub-categories).
    """
    try:
        deletedResult = deleteDocCategory(
            categoryID=categoryID,
            companyID=decorated_data.get("id")
        )
        if deletedResult:
            return jsonify({"status": "success", "message": "Document category deleted successfully"}), 200
        return jsonify({"status": "failed", "message": "Document category not found or delete failed"}), 404
    except Exception as e:
        return jsonify({"status": "failed", "message": f"Unknown error occurred : {str(e)}"}), 500

# ---------------------------------------------
# Document Management (DocumentBase)
# ---------------------------------------------

@adminDashboardRoutes.route('/document-manage', methods=['POST'])
@token_required
def createDocumentFun(decorated_data):
    """
    Create a document record after the file has been uploaded to Cloudinary by the client.

    Body:
    {
        "documentName": str,          required
        "uploadedUrl": str,           required  (Cloudinary URL from client-side upload)
        "isMainCategory": bool,       required
        "mainCategoryID": str,        required
        "accessLevel": str,           required  ("public" | "restricted" | "private")
        "documentDescription": str,   optional
        "subCategoryID": str,         required when isMainCategory == false
        "accessEntries": [            optional  (only for restricted / private docs)
            { "roleID": str, "permission": "manage" | "read" }
        ]
    }

    NOTE: The client must first call /generate-signature (admin) or /get-signed-url (employee)
          to obtain Cloudinary credentials, upload the file directly from the browser,
          and then pass the resulting URL in this request body.
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"status": "failed", "message": "Request body is missing or not valid JSON"}), 400

        documentName    = data.get("documentName")
        uploadedUrl     = data.get("uploadedUrl")
        isMainCategory  = data.get("isMainCategory")
        mainCategoryID  = data.get("mainCategoryID")
        accessLevel     = data.get("accessLevel")
        documentDescription = data.get("documentDescription")
        subCategoryID   = data.get("subCategoryID")
        accessEntries   = data.get("accessEntries")   # list[{roleID, permission}]

        # Required field checks
        missing = [f for f, v in {
            "documentName": documentName,
            "uploadedUrl": uploadedUrl,
            "isMainCategory": isMainCategory,
            "mainCategoryID": mainCategoryID,
            "accessLevel": accessLevel
        }.items() if v is None]
        if missing:
            return jsonify({
                "status": "failed",
                "message": f"Missing required fields: {', '.join(missing)}"
            }), 400

        if not isinstance(isMainCategory, bool):
            return jsonify({"status": "failed", "message": "isMainCategory must be a boolean"}), 400

        documentID = createDocument(
            documentName=documentName,
            uploadedUrl=uploadedUrl,
            insertedBy=decorated_data.get("id"),
            isMainCategory=isMainCategory,
            mainCategoryID=mainCategoryID,
            companyAccID=decorated_data.get("id"),
            accessLevel=accessLevel,
            documentDescription=documentDescription,
            subCategoryID=subCategoryID,
            accessEntries=accessEntries
        )

        return jsonify({
            "status": "success",
            "message": "Document created successfully",
            "documentID": documentID
        }), 201

    except ValueError as e:
        return jsonify({"status": "failed", "message": str(e)}), 422
    except Exception as e:
        return jsonify({"status": "failed", "message": f"Unknown error occurred : {str(e)}"}), 500


@adminDashboardRoutes.route('/document-manage', methods=['GET'])
@token_required
def getDocuments(decorated_data):
    """Retrieve all documents belonging to the authenticated company (admin view)."""
    try:
        import json
        documents = getAllDocuments(companyAccID=decorated_data.get("id"))
        return jsonify({
            "status": "success",
            "data": [json.loads(doc.to_json()) for doc in documents]
        }), 200
    except Exception as e:
        return jsonify({"status": "failed", "message": f"Unknown error occurred : {str(e)}"}), 500


@adminDashboardRoutes.route('/document-manage/<documentID>', methods=['GET'])
@token_required
def getDocument(decorated_data, documentID):
    """Retrieve a single document by ID (scoped to company)."""
    try:
        import json
        document = getDocumentByID(documentID=documentID, companyAccID=decorated_data.get("id"))
        if document:
            return jsonify({"status": "success", "data": json.loads(document.to_json())}), 200
        return jsonify({"status": "failed", "message": "Document not found"}), 404
    except Exception as e:
        return jsonify({"status": "failed", "message": f"Unknown error occurred : {str(e)}"}), 500


@adminDashboardRoutes.route('/document-manage/<documentID>', methods=['PUT'])
@token_required
def updateDocumentByID(decorated_data, documentID):
    """
    Update mutable document fields.
    Immutable fields (uploadedUrl, timestamp, insertedBy, companyAccID) are NOT updated.

    Body:
    {
        "documentName": str,         required
        "mainCategoryID": str,       required
        "accessLevel": str,          required  ("public" | "restricted" | "private")
        "documentDescription": str,  optional
        "subCategoryID": str,        optional
    }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"status": "failed", "message": "Request body is missing or not valid JSON"}), 400

        documentName    = data.get("documentName")
        mainCategoryID  = data.get("mainCategoryID")
        accessLevel     = data.get("accessLevel")
        documentDescription = data.get("documentDescription")
        subCategoryID   = data.get("subCategoryID")
        
        isMainCategory = False if subCategoryID else True
        
        removingRoles = data.get('removingRoles', [])
        addingRoles = data.get('addingRoles', [])

        if not isinstance(removingRoles, list) or not isinstance(addingRoles, list):
            return jsonify({"status": "failed", "message": "removingRoles and addingRoles must be lists"}), 400

        if not all(isinstance(removeItem, str) for removeItem in removingRoles):
            return jsonify({"status": "failed", "message": "removingRoles items must be strings"}), 400

        if not all(isinstance(addItem, dict) for addItem in addingRoles):
            return jsonify({"status": "failed", "message": "addingRoles items must be dictionaries"}), 400    
        
        missing = [f for f, v in {
            "documentName": documentName,
            "mainCategoryID": mainCategoryID,
            "accessLevel": accessLevel
        }.items() if v is None]
        if missing:
            return jsonify({
                "status": "failed",
                "message": f"Missing required fields: {', '.join(missing)}"
            }), 400

        updatedResult = updateDocument(
            documentID=documentID,
            companyAccID=decorated_data.get("id"),
            documentName=documentName,
            isMainCategory=isMainCategory,
            mainCategoryID=mainCategoryID,
            accessLevel=accessLevel,
            documentDescription=documentDescription,
            subCategoryID=subCategoryID,
            addingRoles=addingRoles,
            removingRoles=removingRoles
        )

        if updatedResult:
            return jsonify({"status": "success", "message": "Document updated successfully"}), 200
        return jsonify({"status": "failed", "message": "Document not found or update failed"}), 404

    except ValueError as e:
        return jsonify({"status": "failed", "message": str(e)}), 422
    except Exception as e:
        return jsonify({"status": "failed", "message": f"Unknown error occurred : {str(e)}"}), 500


@adminDashboardRoutes.route('/document-manage/<documentID>', methods=['DELETE'])
@token_required
def deleteDocumentByID(decorated_data, documentID):
    """
    Delete a document and its DocumentAccess entries (cascading).
    """
    try:
        deletedResult = deleteDocument(
            documentID=documentID,
            companyAccID=decorated_data.get("id")
        )
        if deletedResult:
            return jsonify({"status": "success", "message": "Document deleted successfully"}), 200
        return jsonify({"status": "failed", "message": "Document not found or delete failed"}), 404
    except Exception as e:
        return jsonify({"status": "failed", "message": f"Unknown error occurred : {str(e)}"}), 500

@adminDashboardRoutes.route('/get-doc-category-details', methods=['GET'])
@token_required
def getDocCategoryDetailsRoute(decorated_data):
    """
    Get all document categories for the company in a structured hierarchical format.
    """
    try:
        categories = getDocCategoryDetails(companyID=decorated_data.get("id"))
        return jsonify({
            "status": "success",
            "data": categories
        }), 200
    except Exception as e:
        return jsonify({"status": "failed", "message": f"Unknown error occurred : {str(e)}"}), 500
