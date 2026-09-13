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
                employeeTeamName=employeeTeamName
            )
            response_list.append(newRes.model_dump())
            
        return response_list

    except Exception as e:
        print(f"Error in getAllTrainingData: {str(e)}")
        raise e