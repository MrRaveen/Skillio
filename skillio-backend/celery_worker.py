# 1. Import dotenv first
from dotenv import load_dotenv

# 2. Execute it immediately so the environment is populated
load_dotenv()

# 3. NOW you can safely import your app, which needs those variables
from app import create_app

# 4. Build and push context
app = create_app()
app.app_context().push()

# 5. Extract Celery
celery_app = app.extensions["celery"]