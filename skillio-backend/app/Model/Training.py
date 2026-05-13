from app import db
from app.Model.enum.trainingStatus import trainingStatus

class Training(db.Document):
    meta = {'collection': 'training'}

    employeeID = db.StringField()
    growth = db.FloatField()#how much a difference made in terms of total percentage compared to previous training
    performanceIncrease = db.FloatField()#performance increase when compared to past training
    trainingStatus = db.EnumField(trainingStatus)
    trainingContentID = db.StringField()
    trainingPassStatus = db.BooleanField()
    extractedNewSkillsInModeule = db.ListField(db.StringField())
    predictedFinalScore = db.FloatField()

    organizationID = db.StringField()
