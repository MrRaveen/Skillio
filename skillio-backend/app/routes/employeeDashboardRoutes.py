from flask import Blueprint, request, jsonify
from app.decorators.token_required import token_required_employees
employeeDashboardRoutes = Blueprint('employeeDashboardRoutes', __name__)

@employeeDashboardRoutes.route('/employee-login', methods=['POST'])
def employeeLogin():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        if not email or not password:
            return jsonify({
                "status":"error",
                "message": "email and password are required"
            }), 400
            
        from app.Service.employeeDashboardService import performEmployeeLogin
        result = performEmployeeLogin(email, password)
        
        if result['status'] == 'success':
            return jsonify(result), 200
        else:
            return jsonify(result), 401
            
    except Exception as e:
        return jsonify({
            "status": "failed",
            "message": f"Server error: {str(e)}"
        }), 500

# @employeeDashboardRoutes.route('/employee-learning-path', methods=['GET'])
# @token_required_employees
# def employeeLearningPathGet(decordedData):            
#     try:
#         employeeID = decordedData.get('id')
#         from app.Service.employeeDashboardService import getAllTrainingData
#         result = getAllTrainingData(employeeID)
        
#         if result['status'] == 'success':
#             return jsonify(result), 200
#         else:
#             return jsonify(result), 400
            
#     except Exception as e:
#         return jsonify({
#             "status": "failed",
#             "message": f"Server error: {str(e)}"
#         }), 500

# from app.requests.submitSolutionsInitialReq import submitSolutionsInitialReq

# @employeeDashboardRoutes.route('/learning-path-answer-initial', methods=['POST'])
# @token_required_employees
# def learningPathGiveInitial(decordedData):    
#     try:
#         data = request.get_json()
#         validatedData = submitSolutionsInitialReq(**data)
        
#         from app.Service.employeeDashboardService import evaluationIntial
#         result = evaluationIntial(validatedData, decordedData.get('id'))
        
#         if result['status'] == 'success':
#             return jsonify(result), 200
#         else:
#             return jsonify(result), 400
            
#     except Exception as e:
#         return jsonify({
#             "status": "failed",
#             "message": f"Server error: {str(e)}"
#         }), 500

@employeeDashboardRoutes.route('/employee-learning-path', methods=['GET'])
@token_required_employees
def employeeLearningPathGet(decordedData):            
    try:
        employeeID = decordedData.get('id')
        from app.Service.employeeDashboardService import getAllTrainingData
        result = getAllTrainingData(employeeID)
        
        if result['status'] == 'success':
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({
            "status": "failed",
            "message": f"Server error: {str(e)}"
        }), 500
from app.requests.submitSolutionsInitialReq import submitSolutionsInitialReq
@employeeDashboardRoutes.route('/learning-path-answer-initial', methods=['POST'])
@token_required_employees
def learningPathGiveInitial(decordedData):    
    try:
        data = request.get_json()
        validatedData = submitSolutionsInitialReq(**data)
        
        from app.Service.employeeDashboardService import evaluationIntial
        result = evaluationIntial(validatedData, decordedData.get('id'))
        
        if result['status'] == 'success':
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({
            "status": "failed",
            "message": f"Server error: {str(e)}"
        }), 500
          

