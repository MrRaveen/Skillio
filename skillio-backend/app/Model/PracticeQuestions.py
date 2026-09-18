from app import db


class QnAPair(db.EmbeddedDocument):
    question = db.StringField(required=True)
    ans = db.StringField(required=True)


class PracticeQuestions(db.Document):
    meta = {'collection': 'practiceQuestions'}
    allQuestions = db.ListField(
        db.EmbeddedDocumentListField(QnAPair), default=list
    )
    trainingID = db.StringField()