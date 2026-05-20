from pydantic import BaseModel
from datetime import datetime

class questStru(BaseModel):
    questionStr: str
    qAnsNum: int
class submitModuleAnswersReq(BaseModel):
    trainingContentID: str
    moduleArrIndex: int
    answers: list[questStru]

