from flask import Flask
import flask.json
import stripe
import cloudinary
import os
from app.celery_utils import celery_init_app
stripe.api_key = os.getenv('STRIPE_SECRET')
# Monkeypatch for Flask >= 2.3 compatibility with flask-mongoengine
if not hasattr(flask.json, 'JSONEncoder'):
    import json
    flask.json.JSONEncoder = json.JSONEncoder

from flask_mongoengine import MongoEngine
from app.config import Config

db = MongoEngine()
from app.routes.loginRoutes import loginRoutes
from app.routes.adminDashboardRoutes import adminDashboardRoutes
from app.routes.testAreaRoutes import testAreaBp
from app.routes.dispatcher import dispatcher
from app.routes.employeeDashboardRoutes import employeeDashboardRoutes
from flask_cors import CORS
def create_app(config_class=Config):
    app = Flask(__name__)
    CORS(app)
    cloudinary.config(
        cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
        api_key=os.getenv('CLOUDINARY_API_KEY'),
        api_secret=os.getenv('CLOUDINARY_API_SECRET'),
        secure=True
    )
    #celery init
    celery_init_app(app)
    print("Celery declared",flush=True)
    app.config.from_object(config_class)

    # Required for flask-mongoengine with Flask >= 2.3
    app.json_encoder = flask.json.JSONEncoder
    app.register_blueprint(loginRoutes)
    app.register_blueprint(adminDashboardRoutes)
    app.register_blueprint(testAreaBp)
    app.register_blueprint(dispatcher)
    app.register_blueprint(employeeDashboardRoutes)
    db.init_app(app)
    return app