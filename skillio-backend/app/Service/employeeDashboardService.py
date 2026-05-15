from app.Model.Employee import Employee
from app.jwt_utils import encode_employee_auth_token

def performEmployeeLogin(email:str,password:str):
    try:
        employee = Employee.objects(email=email, password=password).first()
        if employee:
            token = encode_employee_auth_token(str(employee.id), str(employee.companyAccID))
            return {
                "status": "success",
                "message": "Login successful",
                "token": token,
                "employee": {
                    "id": str(employee.id),
                    "name": employee.employeeName,
                    "email": employee.email,
                    "roleID": employee.employeeRoleID,
                    "deptID": employee.employeeDepartmentID
                }
            }
        else:
            return {
                "status": "failed",
                "message": "Invalid email or password"
            }
    except Exception as e:
        print(f"Error in performEmployeeLogin: {str(e)}")
        raise e

from app.Model.Employee import Employee
from app.Model.Training import Training
from app.Model.TrainingContent import TrainingContent
from app.Model.EmployeeRole import EmployeeRole
from app.Model.Department import Department
from app.Model.EmployeeTeam import EmployeeTeam
from app.Model.DefinedSkill import DefinedSkill
from app.response.allTrainingRes import TrainingRes, TrainingContentRes, QuestionRes, ModuleRes, ArticleRes, ParagraphRes, SlideRes, VoiceCoverRes, EvaluationStatusRes

def getAllTrainingData(employeeID: str):
    try:
        employeeGot = Employee.objects(id=employeeID).first()
        if not employeeGot:
            return {"status": "failed", "message": "Employee not found"}

        employeeName = employeeGot.employeeName
        employeeRoleName = "N/A"
        allSkillNames = []
        
        if employeeGot.employeeRoleID:
            employeeRole = EmployeeRole.objects(id=employeeGot.employeeRoleID).first()
            if employeeRole:
                employeeRoleName = employeeRole.roleName
                if employeeRole.roleSkillid:
                    for skID in employeeRole.roleSkillid:
                        skill = DefinedSkill.objects(id=skID).first()
                        if skill:
                            allSkillNames.append(skill.skill_name)

        employeeDepartmentName = "N/A"
        if employeeGot.employeeDepartmentID:
            dept = Department.objects(id=employeeGot.employeeDepartmentID).first()
            if dept:
                employeeDepartmentName = dept.deptName

        employeeTeamName = "N/A"
        if employeeGot.teamID:
            team = EmployeeTeam.objects(id=employeeGot.teamID).first()
            if team:
                employeeTeamName = team.teamName

        allTraining = Training.objects(employeeID=employeeID)
        response_list = []
        
        for train in allTraining:
            content_obj = TrainingContent.objects(id=train.trainingContentID).first()
            newContentRes = None
            
            if content_obj:
                initial_qs = []
                if content_obj.initialQuestions:
                    for q in content_obj.initialQuestions:
                        initial_qs.append(QuestionRes(
                            questions=q.questions,
                            answerChoices=q.answerChoices,
                            correctAnswer=q.correctAnswer,
                            userProvidedAnswer=getattr(q, 'userProvidedAnswer', None),
                            # Fixes the typo from the DB document "corretnessStatus"
                            correctnessStatus=getattr(q, 'corretnessStatus', None) 
                        ))
                
                module_res_list = []
                if content_obj.modules:
                    for m in content_obj.modules:
                        articles_res = [ArticleRes(articleTitle=art.articleTitle, paragraphs=[ParagraphRes(paragraph=p.paragraph) for p in art.paragraphs]) for art in m.articles]
                        slides_res = [SlideRes(slideName=s.slideName, slideLink=s.slideLink, totSlideCount=s.totSlideCount, voiceCovers=[VoiceCoverRes(slideNumber=vc.slideNumber, voiceFileLink=vc.voiceFileLink) for vc in s.voiceCovers]) for s in m.slides]
                        eval_qs_res = [QuestionRes(questions=eq.questions, answerChoices=eq.answerChoices, correctAnswer=eq.correctAnswer) for eq in m.evaluationQuestions]

                        module_res_list.append(ModuleRes(
                            moduleTitle=m.moduleTitle,
                            moduleDescription=m.moduleDescription,
                            articles=articles_res,
                            slides=slides_res,
                            evaluationQuestions=eval_qs_res,
                            evaluationStatus=EvaluationStatusRes(totalQuestions=m.evaluationStatus.totalQuestions) if m.evaluationStatus else None
                        ))

                # Handle the evaluation dict extraction safely
                eval_dict = None
                if hasattr(content_obj, 'initialQuestionEvaluation') and content_obj.initialQuestionEvaluation:
                    eval_dict = content_obj.initialQuestionEvaluation.to_mongo().to_dict()

                newContentRes = TrainingContentRes(
                    title=content_obj.title,
                    overview=content_obj.overview,
                    initialQuestions=initial_qs,
                    modules=module_res_list,
                    totalEvaluation=content_obj.totalEvaluation.to_mongo().to_dict() if content_obj.totalEvaluation else None,
                    initialQuestionEvaluation=eval_dict
                )

            newRes = TrainingRes(
                id=str(train.id),
                growth=train.growth,
                performanceIncrease=train.performanceIncrease,
                trainingStatus=train.trainingStatus.value if hasattr(train.trainingStatus, 'value') else str(train.trainingStatus),
                trainingPassStatus=train.trainingPassStatus,
                extractedNewSkillsInModeule=train.extractedNewSkillsInModeule,
                predictedFinalScore=train.predictedFinalScore,
                content=newContentRes,
                employeeID=train.employeeID,
                employeeName=employeeName,
                employeeRoleName=employeeRoleName,
                employeeDepartmentName=employeeDepartmentName,
                employeeSkills=allSkillNames,
                employeeTeamName=employeeTeamName
            )
            response_list.append(newRes.model_dump())
            
        return {
            "status": "success",
            "data": response_list
        }

    except Exception as e:
        print(f"Error in getAllTrainingData: {str(e)}")
        return {
            "status": "failed",
            "message": f"Internal server error: {str(e)}"
        }

from app.requests.submitSolutionsInitialReq import submitSolutionsInitialReq

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
