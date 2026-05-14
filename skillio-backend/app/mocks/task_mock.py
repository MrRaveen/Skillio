import time
from celery import shared_task
from app.routes.dispatcher import push_to_org

@shared_task(bind=True)
def mock_ai_training_task(self, organizationID: str):
    """
    Mocks a long-running AI training task.
    Sleeps for 10 seconds and then sends the completion signal.
    """
    print(f"DEBUG: [MOCK] Starting mock AI task for Org {organizationID}")
    
    # Simulate thinking/processing
    time.sleep(10)
    
    message = {
        "status": "success",
        "type": "AI",
        "message": "Initial questions are created (MOCK)",
        "additionalData": {
            "test_questions": [
                {
                    "question": "What is the benefit of using mock tasks?",
                    "answerChoices": ["Speed", "Reliability", "No cost", "All of the above"],
                    "correctAnswer": 3
                },
                {
                    "question": "How long did this mock task sleep?",
                    "answerChoices": ["1 second", "5 seconds", "10 seconds", "60 seconds"],
                    "correctAnswer": 2
                }
            ]
        }
    }
    
    print(f"DEBUG: [MOCK] Mock task finished. Pushing message to Org {organizationID}")
    push_to_org(organizationID, message)
    return {"status": "success", "message": "Mock task complete"}
