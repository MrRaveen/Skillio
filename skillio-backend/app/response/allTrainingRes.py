from pydantic import BaseModel, Field
from typing import List, Optional

"""
JSON structure for Training:
{
  "employeeID": "6a0542e6119160b660acd690",
  "growth": 0,
  "performanceIncrease": 0,
  "trainingStatus": "pending",
  "trainingContentID": "6a054524a2b1aa5d9bb0093d",
  "trainingPassStatus": false,
  "extractedNewSkillsInModeule": [],
  "predictedFinalScore": 0.5,
  "organizationID": "6a045c1d3c8cb05ead1f5c8f",
  "content":{
  "initialQuestions": [
    {
      "questions": "...",
      "answerChoices": ["...", "..."],
      "correctAnswer": 2
    }
  ],
  "modules": [
    {
      "moduleTitle": "...",
      "moduleDescription": "...",
      "articles": [
        {
          "articleTitle": "...",
          "paragraphs": [{"paragraph": "..."}]
        }
      ],
      "slides": [
        {
          "slideName": "...",
          "slideLink": "...",
          "totSlideCount": 5,
          "voiceCovers": [{"slideNumber": "1", "voiceFileLink": "..."}]
        }
      ],
      "evaluationQuestions": [{"questions": "...", "answerChoices": [], "correctAnswer": 0}],
      "evaluationStatus": {"totalQuestions": 10}
    }
  ],
  "overview": "...",
  "title": "...",
  "totalEvaluation": {}
}
}
"""

class QuestionRes(BaseModel):
    questions: str
    answerChoices: List[str]
    correctAnswer: int

class ParagraphRes(BaseModel):
    paragraph: str
    mermaidCode: Optional[str] = None
    has_diagram: bool = False

class ArticleRes(BaseModel):
    articleTitle: str
    paragraphs: List[ParagraphRes]

class VoiceCoverRes(BaseModel):
    slideNumber: str
    voiceFileLink: str

class SlideRes(BaseModel):
    slideName: str
    slideLink: str
    totSlideCount: int
    voiceCovers: List[VoiceCoverRes]

class EvaluationStatusRes(BaseModel):
    passedStatus: Optional[bool] = None
    passLimit: Optional[float] = None
    obtainedMarks: Optional[float] = None
    totalCorrectedCount: Optional[int] = None
    obtainedMarksPrecent: Optional[float] = None
    totalQuestions: int

class ModuleRes(BaseModel):
    moduleTitle: str
    moduleDescription: str
    articles: List[ArticleRes] = []
    slides: List[SlideRes] = []
    evaluationQuestions: List[QuestionRes] = []
    evaluationStatus: Optional[EvaluationStatusRes] = None

class TrainingContentRes(BaseModel):
    title: Optional[str] = None
    overview: Optional[str] = None
    initialQuestions: List[QuestionRes] = []
    modules: List[ModuleRes] = []
    totalEvaluation: Optional[dict] = None
    initialQuestionEvaluation: Optional[dict] = None

class TrainingRes(BaseModel):
    id: str
    trainingContentID: str
    growth: float
    performanceIncrease: float
    trainingStatus: str
    trainingPassStatus: bool
    extractedNewSkillsInModeule: List[str] = []
    predictedFinalScore: float
    content: Optional[TrainingContentRes] = None
    employeeID: str
    practiceMidTestsCount:int
    employeeName: str
    employeeRoleName: str
    employeeDepartmentName:str
    employeeSkills: list[str]
    employeeTeamName: str 
