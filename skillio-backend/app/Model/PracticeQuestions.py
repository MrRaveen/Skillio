from app import db
import datetime

class QnAPair(db.EmbeddedDocument):
    question = db.StringField(required=True)
    ans = db.StringField(required=True)

class PracticeQuestions(db.Document):
    meta = {'collection': 'practiceQuestions'}
    allQuestions = db.EmbeddedDocumentListField(QnAPair, default=list)
    trainingID = db.StringField()
