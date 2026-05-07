from app import db

class Question(db.EmbeddedDocument):
    questions = db.StringField()
    answerChoices = db.ListField(db.StringField())
    corretnessStatus = db.BooleanField()
    userProvidedAnswer = db.IntField()
    correctAnswer = db.IntField()

class InitialQuestionEvaluation(db.EmbeddedDocument):
    initialQuestionMarks = db.FloatField()
    initialQuestionMarksPercent = db.FloatField()
    totalQuestions = db.IntField()
    correctedCount = db.IntField()

class Paragraph(db.EmbeddedDocument):
    paragraph = db.StringField()

class Article(db.EmbeddedDocument):
    articleTitle = db.StringField()
    paragraphs = db.ListField(db.EmbeddedDocumentField(Paragraph))

class VoiceCover(db.EmbeddedDocument):
    slideNumber = db.StringField()
    voiceFileLink = db.StringField()

class Slide(db.EmbeddedDocument):
    slideName = db.StringField()
    slideLink = db.StringField()
    totSlideCount = db.IntField()
    voiceCovers = db.ListField(db.EmbeddedDocumentField(VoiceCover))

class EvaluationStatus(db.EmbeddedDocument):
    passedStatus = db.BooleanField()
    passLimit = db.FloatField()
    obtainedMarks = db.FloatField()
    totalCorrectedCount = db.IntField()
    obtainedMarksPrecent = db.FloatField()
    totalQuestions = db.IntField()

class Module(db.EmbeddedDocument):
    moduleTitle = db.StringField()
    moduleDescription = db.StringField()
    articles = db.ListField(db.EmbeddedDocumentField(Article))
    slides = db.ListField(db.EmbeddedDocumentField(Slide))
    evaluationQuestions = db.ListField(db.EmbeddedDocumentField(Question))
    evaluationStatus = db.EmbeddedDocumentField(EvaluationStatus)

class TotalEvaluation(db.EmbeddedDocument):
    passModuleLimitCount = db.IntField()
    actualPassedModuleCount = db.IntField()
    totalMarks = db.FloatField()
    totalMrksPercent = db.FloatField()

class TrainingContent(db.Document):
    meta = {'collection': 'trainingContent'}

    title = db.StringField()
    overview = db.StringField()
    initialQuestions = db.ListField(db.EmbeddedDocumentField(Question))
    initialQuestionEvaluation = db.EmbeddedDocumentField(InitialQuestionEvaluation)
    modules = db.ListField(db.EmbeddedDocumentField(Module))
    totalEvaluation = db.EmbeddedDocumentField(TotalEvaluation)
    companyAccID = db.StringField()

"""sumary_line
{
  "title":"str",
  "overview":"str",
  "initialQuestions":[
    {
      "questions":"str",
      "answerChoices":"string arr",
      "corretnessStatus":"bool",
      "userProvidedAnswer":"int",
      "correctAnswer":"int"
    }
  ],
  "initialQuestionEvaluation":{
    "initialQuestionMarks":"double",
    "initialQuestionMarksPercent":"double",
    "totalQuestions":"int",
    "correctedCount":"int"
  },
  "modules":[
    {
      "moduleTitle":"str",
      "moduleDescription":"str",
      "articles":[
        {
          "articleTitle":"str",
          "paragraphs":[
            {
              "paragraph":"str"
            }
          ]
        }
      ],
      "slides":[
        {
          "slideName":"str",
          "slideLink":"str",
          "totSlideCount":"int",
          "voiceCovers":[
            {
              "slideNumber":"str",
              "voiceFileLink":"str"
            }
          ]
        }
      ],
      "evaluationQuestions":[
        {
          "questions":"str",
          "answerChoices":"string arr",
          "corretnessStatus":"bool",
          "userProvidedAnswer":"int",
          "correctAnswer":"int"
        }
      ],
      "evaluationStatus":{
        "passedStatus":"bool",
        "passLimit":"double",
        "obtainedMarks":"double",
        "totalCorrectedCount":"int",
        "obtainedMarksPrecent":"double",
        "totalQuestions":"int"
      }
    }
  ],
  "totalEvaluation":{
    "passModuleLimitCount":"int",
    "actualPassedModuleCount":"int",
    "totalMarks":"double",
    "totalMrksPercent":"double"
  }
}
"""

