from pydantic import BaseModel
from typing import List, Optional

class InitialQuestionEvalRes(BaseModel):
    isInitialQuestionPerformed: bool
    initialQuestionMarks: Optional[int] = 0
    initialQuestionMarksPercent: Optional[int] = 0
    totalQuestions: Optional[int] = 0
    correctedCount: Optional[int] = 0

class ModuleEvaluationRes(BaseModel):
    passedStatus: Optional[bool] = False
    passLimit: Optional[int] = 0
    obtainedMarks: Optional[int] = 0
    totalCorrectedCount: Optional[int] = 0
    obtainedMarksPrecent: Optional[int] = 0
    totalQuestions: Optional[int] = 0

class ModuleStatRes(BaseModel):
    moduleName: str
    moduleEvaluations: Optional[ModuleEvaluationRes] = None

class TotalEvaluationRes(BaseModel):
    passModuleLimitCount: Optional[int] = 0
    actualPassedModuleCount: Optional[int] = 0
    totalMarks: Optional[int] = 0
    totalMrksPercent: Optional[int] = 0

class TrainingStatRes(BaseModel):
    trainingID: str
    trainingPassStatus: Optional[bool] = False
    trainingStatus: str
    initialQuestionEval: Optional[InitialQuestionEvalRes] = None
    modules: List[ModuleStatRes] = []
    totalEvaluation: Optional[TotalEvaluationRes] = None

class EmployeeTrainingStatsRes(BaseModel):
    employeeID: str
    email:str
    employeeName: str
    allTrainingsCount: int
    passedCount: int
    pendingCount: int
    failedCount: int
    allTrainings: List[TrainingStatRes] = []
