import pytest
from app import create_app, db

import os
from dotenv import load_dotenv

load_dotenv()

class TestConfig:
    MONGODB_SETTINGS = {
        'host': os.getenv('MONGO_DB_URL', 'mongodb://localhost:27017/test_db'),
        'db': 'skillio_official'
    }
    TESTING = True

@pytest.fixture
def app():
    app = create_app(TestConfig)
    
    yield app


@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def clean_db(app):
    with app.app_context():
        # Get the database name from config, fallback to 'test_db'
        db_name = app.config.get('MONGODB_SETTINGS', {}).get('db', 'test_db')
        # Drop the database
        db.connection.get_database(db_name).command('dropDatabase')
