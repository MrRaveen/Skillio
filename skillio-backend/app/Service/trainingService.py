from app.Model.Training import Training
from app.Model.TrainingContent import TrainingContent
from app.Model.Employee import Employee
from app.Model.EmployeeRole import EmployeeRole
from app.Model.Department import Department
from app.Model.EmployeeTeam import EmployeeTeam
from app.Model.DefinedSkill import DefinedSkill
from app.response.allTrainingRes import (
    TrainingRes, TrainingContentRes, QuestionRes, ModuleRes,
    ArticleRes, ParagraphRes, SlideRes, VoiceCoverRes, EvaluationStatusRes
)

def getAllTrainingData(orgID: str):
    try:
        allTraining = Training.objects(organizationID=orgID)
        response_list = []
        
        for train in allTraining:
            # Fetch content object
            content_obj = TrainingContent.objects(id=train.trainingContentID).first()
            newContentRes = None

            # Employee details with null safety
            employeeName = "N/A"
            employeeRoleName = "N/A"
            employeeDepartmentName = "N/A"
            employeeTeamName = "N/A"
            allSkillNames = []

            employeeGot = Employee.objects(id=train.employeeID).first()
            if employeeGot:
                employeeName = employeeGot.employeeName or "N/A"

                if employeeGot.employeeRoleID:
                    employeeRole = EmployeeRole.objects(id=employeeGot.employeeRoleID).first()
                    if employeeRole:
                        employeeRoleName = employeeRole.roleName or "N/A"
                        if employeeRole.roleSkillid:
                            for skID in employeeRole.roleSkillid:
                                skill = DefinedSkill.objects(id=skID).first()
                                if skill:
                                    allSkillNames.append(skill.skill_name)

                if employeeGot.employeeDepartmentID:
                    dept = Department.objects(id=employeeGot.employeeDepartmentID).first()
                    if dept:
                        employeeDepartmentName = dept.deptName or "N/A"

                if employeeGot.teamID:
                    team = EmployeeTeam.objects(id=employeeGot.teamID).first()
                    if team:
                        employeeTeamName = team.teamName or "N/A"

            if content_obj:
                # Map initial questions
                initial_qs = []
                if content_obj.initialQuestions:
                    for q in content_obj.initialQuestions:
                        initial_qs.append(QuestionRes(
                            questions=q.questions,
                            answerChoices=q.answerChoices,
                            correctAnswer=q.correctAnswer
                        ))
                
                # Map modules with full detail (articles, slides, evaluationQuestions, evaluationStatus)
                module_res_list = []
                if content_obj.modules:
                    for m in content_obj.modules:
                        articles_res = [
                            ArticleRes(
                                articleTitle=art.articleTitle,
                                paragraphs=[ParagraphRes(
                                    paragraph=p.paragraph,
                                    mermaidCode=p.mermaid_diagram,
                                    has_diagram=p.has_diagram if p.has_diagram is not None else False
                                ) for p in art.paragraphs]
                            ) for art in m.articles
                        ] if m.articles else []

                        slides_res = [
                            SlideRes(
                                slideName=s.slideName,
                                slideLink=s.slideLink,
                                totSlideCount=s.totSlideCount,
                                voiceCovers=[
                                    VoiceCoverRes(slideNumber=vc.slideNumber, voiceFileLink=vc.voiceFileLink)
                                    for vc in s.voiceCovers
                                ] if s.voiceCovers else []
                            ) for s in m.slides
                        ] if m.slides else []

                        eval_qs_res = [
                            QuestionRes(
                                questions=eq.questions,
                                answerChoices=eq.answerChoices,
                                correctAnswer=eq.correctAnswer
                            ) for eq in m.evaluationQuestions
                        ] if m.evaluationQuestions else []

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

                # Handle initialQuestionEvaluation safely
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
                practiceMidTestsCount=train.practiceMidTestsCount or 0
            )
            response_list.append(newRes.model_dump())
            
        return response_list

    except Exception as e:
        print(f"Error in getAllTrainingData: {str(e)}")
        raise e

def getAllTrainingDataPerEmployee(orgID: str):
    from app.response.employeeTrainingStatsRes import (
        InitialQuestionEvalRes, ModuleEvaluationRes, ModuleStatRes,
        TotalEvaluationRes, TrainingStatRes, EmployeeTrainingStatsRes
    )
    try:
        employees = Employee.objects(companyAccID=orgID)
        response_list = []

        for emp in employees:
            emp_id_str = str(emp.id)
            email = emp.email
            emp_name = emp.employeeName or "N/A"
            
            trainings = Training.objects(employeeID=emp_id_str)
            
            allTrainingsCount = len(trainings)
            passedCount = 0
            pendingCount = 0
            failedCount = 0
            
            allTrainingsRes = []
            sumTrainingCount = 0 #x
            sumFinalMarksCount = 0 #y
            sumXandY = 0#x*y sum
            sumXSquare = 0
            for train in trainings:
                training_status = train.trainingStatus.value if hasattr(train.trainingStatus, 'value') else str(train.trainingStatus)
                
                content_obj = TrainingContent.objects(id=train.trainingContentID).first() if train.trainingContentID else None
                
                if training_status.lower() == 'finished':
                    if train.trainingPassStatus:
                        passedCount += 1
                    else:
                        failedCount += 1
                    sumTrainingCount = sumTrainingCount+1 
                    sumFinalMarksCount = sumFinalMarksCount + content_obj.totalEvaluation.totalMrksPercent
                    sumXandY = sumXandY + (sumTrainingCount * sumFinalMarksCount)
                    sumXSquare = sumXSquare + (sumTrainingCount ** 2)
                else:
                    pendingCount += 1
                    
                
                initial_eval_res = None
                total_eval_res = None
                module_stats = []
                
                if content_obj:
                    # initial questions eval
                    if hasattr(content_obj, 'initialQuestionEvaluation') and content_obj.initialQuestionEvaluation:
                        eval_data = content_obj.initialQuestionEvaluation
                        initial_eval_res = InitialQuestionEvalRes(
                            isInitialQuestionPerformed=True,
                            initialQuestionMarks=int(eval_data.initialQuestionMarks) if eval_data.initialQuestionMarks is not None else 0,
                            initialQuestionMarksPercent=int(eval_data.initialQuestionMarksPercent) if eval_data.initialQuestionMarksPercent is not None else 0,
                            totalQuestions=eval_data.totalQuestions if eval_data.totalQuestions is not None else 0,
                            correctedCount=eval_data.correctedCount if eval_data.correctedCount is not None else 0
                        )
                    else:
                        initial_eval_res = InitialQuestionEvalRes(isInitialQuestionPerformed=False)
                        
                    # modules
                    if content_obj.modules:
                        for mod in content_obj.modules:
                            mod_eval_res = None
                            if mod.evaluationStatus:
                                mod_eval_res = ModuleEvaluationRes(
                                    passedStatus=mod.evaluationStatus.passedStatus or False,
                                    passLimit=int(mod.evaluationStatus.passLimit) if mod.evaluationStatus.passLimit is not None else 0,
                                    obtainedMarks=int(mod.evaluationStatus.obtainedMarks) if mod.evaluationStatus.obtainedMarks is not None else 0,
                                    totalCorrectedCount=mod.evaluationStatus.totalCorrectedCount or 0,
                                    obtainedMarksPrecent=int(mod.evaluationStatus.obtainedMarksPrecent) if mod.evaluationStatus.obtainedMarksPrecent is not None else 0,
                                    totalQuestions=mod.evaluationStatus.totalQuestions or 0
                                )
                            module_stats.append(ModuleStatRes(
                                moduleName=mod.moduleTitle or "Unknown",
                                moduleEvaluations=mod_eval_res
                            ))
                            
                    # total evaluation
                    if content_obj.totalEvaluation:
                        tot_eval = content_obj.totalEvaluation
                        total_eval_res = TotalEvaluationRes(
                            passModuleLimitCount=tot_eval.passModuleLimitCount or 0,
                            actualPassedModuleCount=tot_eval.actualPassedModuleCount or 0,
                            totalMarks=int(tot_eval.totalMarks) if tot_eval.totalMarks is not None else 0,
                            totalMrksPercent=int(tot_eval.totalMrksPercent) if tot_eval.totalMrksPercent is not None else 0
                        )

                training_stat = TrainingStatRes(
                    trainingID=str(train.id),
                    trainingPassStatus=train.trainingPassStatus or False,
                    trainingStatus=training_status,
                    initialQuestionEval=initial_eval_res,
                    modules=module_stats,
                    totalEvaluation=total_eval_res
                )
                allTrainingsRes.append(training_stat)
            #regression cal
            n = sumTrainingCount
            upper = (n * sumXandY) - (sumTrainingCount * sumFinalMarksCount)
            lower = (n * sumXSquare) - (sumTrainingCount ** 2)
            m = upper / lower if lower != 0 else 0.0
            emp_stat_res = EmployeeTrainingStatsRes(
                employeeID=emp_id_str,
                email=email,
                employeeName=emp_name,
                allTrainingsCount=allTrainingsCount,
                passedCount=passedCount,
                pendingCount=pendingCount,
                failedCount=failedCount,
                allTrainings=allTrainingsRes,
                regression = m
            )
            response_list.append(emp_stat_res.model_dump())
            
        return response_list

    except Exception as e:
        print(f"Error in getAllTrainingDataPerEmployee: {str(e)}")
        raise e