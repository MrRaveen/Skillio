from app.Model.OrganizationAccount import OrganizationAccount
from functools import wraps
from flask import request, jsonify
from flask import request, jsonify, current_app
import jwt

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')

        # 1. Extract the token
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(" ")[1]

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        # 2. Decode the token and extract details
        try:
            # decode() verifies the signature and expiration automatically
            decoded_payload = jwt.decode(
                token, 
                current_app.config['SECRET_KEY'], 
                algorithms=["HS256"]
            )
            
            org_acc_id = OrganizationAccount.objects(id=decoded_payload['orgAccID'])
            
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token is invalid!'}), 401

        # 3. Pass the decoded payload (or user object) to the route
        return f(decoded_payload, *args, **kwargs)
        
    return decorated