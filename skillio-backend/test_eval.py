import os
import sys

# Set up paths and environment
sys.path.insert(0, r"e:\Work\College_works\Competitions\SAAS Sprint\Code\skillio\skillio-backend")
from app.Service.employeeDashboardService import evaluationIntial
from app.requests.submitSolutionsInitialReq import submitSolutionsInitialReq, InitialQuestionAnswer

def test():
    req = submitSolutionsInitialReq(
        trainingID="fake_training_id",
        initialQuestions=[
            InitialQuestionAnswer(questionIndex=0, correctAnswer=1)
        ]
    )
    # This will likely fail with "Training not found", but we can see if it throws an unexpected exception!
    res = evaluationIntial(req, "fake_employee_id")
    print(res)

if __name__ == "__main__":
    from mongoengine import connect
    from dotenv import load_dotenv
    load_dotenv(r"e:\Work\College_works\Competitions\SAAS Sprint\Code\skillio\.env")
    connect(host=os.getenv('MONGO_URI'))
    test()
