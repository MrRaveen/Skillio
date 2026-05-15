from pydantic import BaseModel
from typing import List, Optional

class InitialQuestionAnswer(BaseModel):
    questionIndex: int
    correctAnswer: int

class submitSolutionsInitialReq(BaseModel):
    trainingID: str
    initialQuestions: List[InitialQuestionAnswer]
