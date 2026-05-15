def evaluationIntial(answers: submitSolutionsInitialReq,employeeID:str):
    try:
        from app.Model.TrainingContent import InitialQuestionEvaluation
        from app.Model.enum.proficiencyLevelInitialQuestions import proficiencyLevelInitialQuestions
        trainingData = Training.objects(id=answers.trainingID).first()
        if not trainingData:
            return {"status": "failed", "message": "Training not found"}
            
        trainingContent = TrainingContent.objects(id=trainingData.trainingContentID).first()
        if not trainingContent:
            return {"status": "failed", "message": "Training content not found"}

        initialQ = trainingContent.initialQuestions
        correctedCount = 0
        totalQuestions = len(initialQ)
        
        for qObj in answers.initialQuestions:
            if qObj.questionIndex < totalQuestions:
                currentQ = initialQ[qObj.questionIndex]
                # In the request model, 'correctAnswer' represents the user's selected choice index
                userChoice = qObj.correctAnswer
                currentQ.userProvidedAnswer = userChoice
                
                if currentQ.correctAnswer == userChoice:
                    currentQ.corretnessStatus = True
                    correctedCount += 1
                else:
                    currentQ.corretnessStatus = False
        
        # Mark for each question is 10
        initialQuestionMarks = correctedCount * 10
        initialQuestionMarksPercent = (correctedCount / totalQuestions * 100) if totalQuestions > 0 else 0
        
        trainingContent.initialQuestionEvaluation = InitialQuestionEvaluation(
            initialQuestionMarks=float(initialQuestionMarks),
            initialQuestionMarksPercent=float(initialQuestionMarksPercent),
            totalQuestions=totalQuestions,
            correctedCount=correctedCount
        )
        
        if float(initialQuestionMarksPercent) >= 70.0:
            proficiencyLevel = proficiencyLevelInitialQuestions.HIGH
        elif float(initialQuestionMarksPercent) >= 40.0:
            proficiencyLevel = proficiencyLevelInitialQuestions.MEDIUM
        else:
            proficiencyLevel = proficiencyLevelInitialQuestions.LOW        
        trainingContent.save()
        #get the skill list
        employee = Employee.objects(id=employeeID).first()
        role = EmployeeRole.objects(id=employee.employeeRoleID).first()
        skillIDList = role.roleSkillid
        allSkillNames = []
        for skill in skillIDList:
            sillObj = DefinedSkill.objects(id=skill).first()
            if sillObj:
                allSkillNames.append(sillObj.skill_name)
        #then call the complete course creator
        from app.Tasks.generate_course import create_course
        create_course.delay(
            contentID=str(trainingContent.id),
            role=role.roleName,
            target_skills=allSkillNames,
            proficiencyLevel=proficiencyLevel.value,
            employeeID=employeeID
        )

        return {
            "status": "success",
            "message": "Initial evaluation completed",
            "data": {
                "marks": initialQuestionMarks,
                "percent": initialQuestionMarksPercent,
                "correctedCount": correctedCount,
                "totalQuestions": totalQuestions
            }
        }
    except Exception as e:
        print(f"Error in evaluationIntial: {str(e)}")
        return {"status": "failed", "message": f"An error occurred: {str(e)}"}
