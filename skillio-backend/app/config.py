import os

class Config:
    MONGODB_SETTINGS = {
        'host': os.getenv('MONGO_DB_URL'),
        'db': 'skillio_official'
    }