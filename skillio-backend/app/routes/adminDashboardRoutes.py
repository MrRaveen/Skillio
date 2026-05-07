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
            companyAccID=decorated_data.get('id')
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
            "data": [json.loads(employee.to_json()) for employee in employees]
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



