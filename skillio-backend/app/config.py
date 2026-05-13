import os
import certifi

class Config:
    # SECRET_KEY = os.getenv('JWT_SECRET', 'skillio_secret_key_12345')
    MONGODB_SETTINGS = {
        'host': os.getenv('MONGO_DB_URL'),
        'db': 'skillio_official',
        'tlsCAFile': certifi.where()
    }