from flask import Flask
import flask.json
import stripe
import os
stripe.api_key = os.getenv('STRIPE_SECRET')
# Monkeypatch for Flask >= 2.3 compatibility with flask-mongoengine
if not hasattr(flask.json, 'JSONEncoder'):
    import json
    flask.json.JSONEncoder = json.JSONEncoder

from flask_mongoengine import MongoEngine
from app.config import Config

db = MongoEngine()
from app.routes.loginRoutes import loginRoutes
def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Required for flask-mongoengine with Flask >= 2.3
    app.json_encoder = flask.json.JSONEncoder
    app.register_blueprint(loginRoutes)
    db.init_app(app)
    return app