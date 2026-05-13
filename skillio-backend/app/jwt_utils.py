import jwt
import datetime
from functools import wraps
from flask import Flask, request, jsonify
import os

def encode_auth_token(org_ID):
    """
    Generates the Auth Token
    """
    try:
        payload = {
            'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=1),
            'iat': datetime.datetime.now(datetime.timezone.utc),
            'sub': org_ID,
            'id': org_ID,
            'orgAccID': org_ID
        }
        return jwt.encode(payload, os.getenv('JWT_SECRET'), algorithm='HS256')
    except Exception as e:
        return e

def decode_auth_token(auth_token):
    """
    Decodes the auth token
    """
    try:
        payload = jwt.decode(auth_token, os.getenv('JWT_SECRET'), algorithms=['HS256'])
        return payload['sub']
    except jwt.ExpiredSignatureError:
        return 'Signature expired. Please log in again.'
    except jwt.InvalidTokenError:
        return 'Invalid token. Please log in again.'