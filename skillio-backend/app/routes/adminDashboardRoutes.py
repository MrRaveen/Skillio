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
        
        if not all([target_skills, role, employeeID]):
            return jsonify({
                "status": "failed",
                "message": "Missing required fields (target_skills, role, employeeID)"
            }), 400

        orgAccID = decorated_data.get('id')
        task = generate_initial_questions.delay(target_skills, role, employeeID, orgAccID,practiceMidTestsCount)
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

