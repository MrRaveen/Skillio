from app.Model.PracticeQuestions import PracticeQuestions
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
                "orgAccID": str(employee.companyAccID),
                "employee": {
                    "id": str(employee.id),
                    "name": employee.employeeName,
                    "email": employee.email,
                    "roleID": employee.employeeRoleID,
                    "deptID": employee.employeeDepartmentID,
                    "orgAccID": str(employee.companyAccID)
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
                        articles_res = [ArticleRes(articleTitle=art.articleTitle, paragraphs=[ParagraphRes(paragraph=p.paragraph,has_diagram=p.has_diagram,mermaidCode=p.mermaid_diagram) for p in art.paragraphs]) for art in m.articles]
                        slides_res = [SlideRes(slideName=s.slideName, slideLink=s.slideLink, totSlideCount=s.totSlideCount, voiceCovers=[VoiceCoverRes(slideNumber=vc.slideNumber, voiceFileLink=vc.voiceFileLink) for vc in s.voiceCovers]) for s in m.slides]
                        eval_qs_res = [QuestionRes(questions=eq.questions, answerChoices=eq.answerChoices, correctAnswer=eq.correctAnswer) for eq in m.evaluationQuestions]

                        module_res_list.append(ModuleRes(
                            moduleTitle=m.moduleTitle,
                            moduleDescription=m.moduleDescription,
                            articles=articles_res,
                            slides=slides_res,
                            evaluationQuestions=eval_qs_res,
                            evaluationStatus=EvaluationStatusRes(
                                passedStatus=m.evaluationStatus.passedStatus,
                                passLimit=m.evaluationStatus.passLimit,
                                obtainedMarks=m.evaluationStatus.obtainedMarks,
                                totalCorrectedCount=m.evaluationStatus.totalCorrectedCount,
                                obtainedMarksPrecent=m.evaluationStatus.obtainedMarksPrecent,
                                totalQuestions=m.evaluationStatus.totalQuestions
                            ) if m.evaluationStatus else None
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
            practiceQuestionsDoc = PracticeQuestions.objects(trainingID=str(train.id)).first()
            practice_sets_data = None
            if practiceQuestionsDoc:
                qs_list = []
                for qs in practiceQuestionsDoc.allQuestions:
                    set_list = [{"question": q.question, "answer": q.ans} for q in qs]
                    qs_list.append(set_list)
                practice_sets_data = {"allQuestions": qs_list}

            newRes = TrainingRes(
                id=str(train.id),
                trainingContentID=train.trainingContentID or '',
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
                employeeTeamName=employeeTeamName,
                practiceMidTestsCount=train.practiceMidTestsCount or 0,
                trainingPracticeQuestionSets=practice_sets_data
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
from app.requests.submitModuleAnswersReq import submitModuleAnswersReq

def calEvaluationModule(ansData: submitModuleAnswersReq):
    try:
        from app.Model.TrainingContent import TrainingContent, EvaluationStatus
        content = TrainingContent.objects(id=ansData.trainingContentID).first()
        
        if not content:
            return {"status": "error", "message": "Training content not found"}
            
        relaventModule = None
        if ansData.moduleArrIndex < len(content.modules):
            relaventModule = content.modules[ansData.moduleArrIndex]
            
        if not relaventModule:
            return {"status": "error", "message": "Module not found"}
            
        incorrectCount = 0
        correctCount = 0
        evaluationQues = relaventModule.evaluationQuestions
        totalQuestions = len(evaluationQues)
        
        for singleQObj in evaluationQues:
            singleQuestion = singleQObj.questions
            userAnswerList = ansData.answers
            
            userAns = None
            for a in userAnswerList: 
                if singleQuestion == a.questionStr:
                    userAns = a.qAnsNum
                    break
                    
            if userAns is not None:
                singleQObj.userProvidedAnswer = userAns
                if userAns == singleQObj.correctAnswer:
                    correctCount += 1
                    singleQObj.corretnessStatus = True
                else:
                    incorrectCount += 1
                    singleQObj.corretnessStatus = False
            else:
                incorrectCount += 1
                singleQObj.corretnessStatus = False
                
        limit = 60.0
        obtainedMarks = 0.0
        percent = 0.0
        
        if totalQuestions > 0:
            markForEach = 100.0 / totalQuestions
            obtainedMarks = markForEach * correctCount
            percent = (correctCount / totalQuestions) * 100.0
            
        passStatus = True if percent >= limit else False
        
        relaventModule.evaluationStatus = EvaluationStatus(
            passedStatus=passStatus,
            passLimit=limit,
            obtainedMarks=obtainedMarks,
            totalCorrectedCount=correctCount,
            obtainedMarksPrecent=percent,
            totalQuestions=totalQuestions
        )
        
        content.save()
        
        return {
            "status": "success", 
            "message": "Evaluation submitted successfully",
            "data": {
                "passedStatus": passStatus,
                "obtainedMarks": obtainedMarks,
                "obtainedMarksPrecent": percent,
                "totalCorrectedCount": correctCount,
                "totalQuestions": totalQuestions
            }
        }
    except Exception as e:
        print(f"Error in calEvaluationModule: {str(e)}")
        return {"status": "error", "message": f"An error occurred: {str(e)}"}


def finalEvalCal(trainingContID: str,trainingID: str):
    try:
        content = TrainingContent.objects(id=trainingContID).first()
        trainingBase = Training.objects(id=trainingID).first()
        if not content:
            return {"status": "failed", "message": "Training content not found."}
            
        allModules = content.modules
        passModuleLimitCount = len(allModules)
        actualPassedModuleCount = 0
        totMarks = 0.0
        totCompleteMarks = 0.0
        
        for m in allModules:
            if not m.evaluationStatus or not m.evaluationStatus.passedStatus:
                return {"status": "failed", "message": "To pass the path, all the modules must be passed"}
            
            actualPassedModuleCount += 1
            totMarks += (m.evaluationStatus.obtainedMarks or 0.0)
            totCompleteMarks += 100.0
                
        totalMrksPercent = 0.0
        if totCompleteMarks > 0:
            totalMrksPercent = (totMarks / totCompleteMarks) * 100.0
            
        from app.Model.TrainingContent import TotalEvaluation
        content.totalEvaluation = TotalEvaluation(
            passModuleLimitCount=passModuleLimitCount,
            actualPassedModuleCount=actualPassedModuleCount,
            totalMarks=totMarks,
            totalMrksPercent=totalMrksPercent
        )
        content.save()

        #update the training status
        if trainingBase:
            from app.Model.enum.trainingStatus import trainingStatus
            trainingBase.trainingStatus = trainingStatus.FINISHED
            trainingBase.save()
        
        return {
            "status": "success", 
            "message": "Final evaluation calculated successfully.",
            "data": {
                "passModuleLimitCount": passModuleLimitCount,
                "actualPassedModuleCount": actualPassedModuleCount,
                "totalMarks": totMarks,
                "totalMrksPercent": totalMrksPercent
            }
        }
    except Exception as e:
        print(f"Error in finalEvalCal: {str(e)}")
        return {"status": "error", "message": f"An error occurred: {str(e)}"}


def updateEmAccByID(data):
    try:
        from app.requests.updateEmProfReq import updateEmProfReq
        foundEm = Employee.objects(id=data.emplpyeeDocID).first()
        if foundEm:
            if data.newEmployeeName is not None:
                foundEm.employeeName = data.newEmployeeName
            if data.password is not None:
                foundEm.password = data.password
            if data.newContact is not None:
                foundEm.contactnumber = data.newContact
            if data.newAddress is not None:
                foundEm.address = data.newAddress
            if data.newProfileImgUrl is not None:
                foundEm.profileImageUrl = data.newProfileImgUrl
                
            foundEm.save()
            return {
                "status": "success",
                "message": "Profile updated successfully",
                "employee": {
                    "id": str(foundEm.id),
                    "name": foundEm.employeeName,
                    "email": foundEm.email,
                    "contactnumber": foundEm.contactnumber,
                    "address": foundEm.address,
                    "profileImageUrl": foundEm.profileImageUrl
                }
            }
        else:
            return {"status": "failed", "message": "Employee not found"}
    except Exception as e:
        print(f"Error in updateEmAccByID: {str(e)}")
        return {"status": "error", "message": f"An error occurred: {str(e)}"}
            

