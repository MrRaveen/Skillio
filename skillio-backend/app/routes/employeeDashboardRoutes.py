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

@employeeDashboardRoutes.route('/submit-evaluation-questions', methods=['POST'])
@token_required_employees
def submitEvaluationQuestions(decordedData): 
    try:
        from app.requests.submitModuleAnswersReq import submitModuleAnswersReq
        data = request.get_json()
        validatedData = submitModuleAnswersReq(**data)
        
        from app.Service.employeeDashboardService import calEvaluationModule
        result = calEvaluationModule(validatedData)
        
        if result['status'] == 'success':
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({
            "status": "failed",
            "message": f"Server error: {str(e)}"
        }), 500

@employeeDashboardRoutes.route('/final-path-eval/<string:trainingContID>/<string:trainingID>', methods=['POST'])
@token_required_employees
def finalPathEval(decordedData, trainingContID: str, trainingID: str): 
    try:
        from app.Service.employeeDashboardService import finalEvalCal
        result = finalEvalCal(trainingContID, trainingID)
        
        if result['status'] == 'success':
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({
            "status": "failed",
            "message": f"Server error: {str(e)}"
        }), 500

@employeeDashboardRoutes.route('/update-employee-profile', methods=['PUT'])
@token_required_employees
def updateEmProfile(decordedData):
    try:
        from app.requests.updateEmProfReq import updateEmProfReq
        from app.Service.employeeDashboardService import updateEmAccByID
        
        data = request.get_json()
        if not data:
            data = {}
            
        # Fallback to token decoded employee ID
        if 'emplpyeeDocID' not in data:
            data['emplpyeeDocID'] = decordedData.get('id')
            
        validatedData = updateEmProfReq(**data)
        result = updateEmAccByID(validatedData)
        
        if result['status'] == 'success':
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({
            "status": "failed",
            "message": f"Server error: {str(e)}"
        }), 500

@employeeDashboardRoutes.route('/get-employee-profile', methods=['GET'])
@token_required_employees
def getEmProfile(decordedData):
    try:
        from app.Model.Employee import Employee
        employee_id = decordedData.get('id')
        foundEm = Employee.objects(id=employee_id).first()
        if foundEm:
            return jsonify({
                "status": "success",
                "employee": {
                    "id": str(foundEm.id),
                    "name": foundEm.employeeName,
                    "email": foundEm.email,
                    "contactnumber": foundEm.contactnumber or "",
                    "address": foundEm.address or "",
                    "profileImageUrl": foundEm.profileImageUrl or ""
                }
            }), 200
        else:
            return jsonify({"status": "failed", "message": "Employee not found"}), 404
    except Exception as e:
        return jsonify({
            "status": "failed",
            "message": f"Server error: {str(e)}"
        }), 500


#update email
@employeeDashboardRoutes.route('/get-code-em-email/<string:email>', methods=['GET'])
@token_required_employees
def getVerificationCodeForEmailUpdate(decordedData, email: str):
    try:
        import os
        import random
        from pydantic import BaseModel, EmailStr, ValidationError as PydanticValidationError
        from app.mailjet_utils import getMailjetClient
        from app.redis_utils import getRedisClient
        
        try:
            class EmailModel(BaseModel):
                email: EmailStr
            EmailModel(email=email)
        except PydanticValidationError:
            return jsonify({
                "status": "error",
                "message": "Invalid email address format"
            }), 400

        verification_code = random.randint(100000, 999999)
        mailjetClient = getMailjetClient()
        redisClient = getRedisClient()
        # Create the redis key
        redis_key = f"verify_email_em_update:{email}"
        expiration_time_seconds = 900
        
        # Save to redis
        redisClient.set(name=redis_key, value=verification_code, ex=expiration_time_seconds)

        sender_email = os.environ.get('MAILJET_SENDER_EMAIL')
        if not sender_email:
             return jsonify({
                "status": "error",
                "message": "MAILJET_SENDER_EMAIL is not set in environment variables."
            }), 500

        data = {
            'Messages': [
                {
                    "From": {
                        "Email": sender_email,
                        "Name": "Skillio"
                    },
                    "To": [
                        {
                            "Email": email
                        }
                    ],
                    "Subject": "Your Security Code",
                    "TextPart": f"Your verification code is: {verification_code}. It will expire in 15 minutes.",
                    "HTMLPart": f"<h3>Security Verification</h3><p>Your verification code is: <strong>{verification_code}</strong>.</p><p>It will expire in 15 minutes.</p>"
                }
            ]
        }
        
        result = mailjetClient.send.create(data=data)
        result_json = result.json()
        
        if result.status_code != 200:
             return jsonify({
                "status": "error",
                "message": "Failed to send email via Mailjet (Request Failed)",
                "details": ""
            }), result.status_code

        # v3.1 returns 200 even if individual messages fail
        message_status = result_json.get('Messages', [{}])[0].get('Status')
        if message_status != 'success':
            return jsonify({
                "status": "error",
                "message": "Mailjet accepted the request but failed to send the message.",
                "details": result_json
            }), 400

        return jsonify({
            "status": "success",
            "message": "Verification code sent successfully"
        }), 200
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Error occurred when sending verification code: {str(e)}"
        }), 500

@employeeDashboardRoutes.route('/verify-user/<string:email>/<string:verificationCode>', methods=['POST'])
@token_required_employees
def verifyUserUpdateEmail(decordedData, email: str, verificationCode: str):
    # Validate email format
    try:
        from pydantic import BaseModel, EmailStr, ValidationError as PydanticValidationError
        from app.redis_utils import getRedisClient
        from app.Model.Employee import Employee
        
        docID = decordedData.get('id')
        try:
            class EmailModel(BaseModel):
                email: EmailStr
            EmailModel(email=email)
        except PydanticValidationError:
            return jsonify({
                "status": "error",
                "message": "Invalid email address format"
            }), 400

        redis_key = f"verify_email_em_update:{email}"
        redisClient = getRedisClient()
        stored_value = redisClient.get(redis_key)

        if stored_value is None:
            return jsonify({
                "status": "error",
                "message": "Verification code not found or has expired."
            }), 404
        else:
            if stored_value.decode('utf-8') == verificationCode:
                em = Employee.objects(id=docID).first()
                if not em:
                    return jsonify({"status": "error", "message": "Employee not found"}), 404
                em.email = email
                em.save()
                redisClient.delete(redis_key)
                return jsonify({
                    "status": "success",
                    "message": "Verification code is correct and email updated"
                }), 200
            else:
                return jsonify({
                    "status": "failed",
                    "message": "Verification code is incorrect"
                }), 400
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Error occurred during verification: {str(e)}"
        }), 500


@employeeDashboardRoutes.route('/get-signed-url', methods=['GET'])
@token_required_employees
def getSignedUrl(decordedData):
    try:
        import time
        import os
        import cloudinary
        import cloudinary.utils

        timestamp = int(time.time())
        
        params_to_sign = {
            'timestamp': timestamp
        }
        
        signature = cloudinary.utils.api_sign_request(
            params_to_sign,
            os.getenv('CLOUDINARY_API_SECRET')
        )
        
        return jsonify({
            'signature': signature,
            'timestamp': timestamp,
            'api_key': os.getenv('CLOUDINARY_API_KEY'),
            'cloud_name': os.getenv('CLOUDINARY_CLOUD_NAME')
        })
    except Exception as e: 
        return jsonify({
        "status": "error",
        "message": f"Error occurred getting signed URL: {str(e)}"
        }), 500
