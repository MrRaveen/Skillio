from app.Model.Training import Training
from app.Model.TrainingContent import TrainingContent
from app.Model.Employee import Employee
from app.Model.EmployeeRole import EmployeeRole
from app.Model.Department import Department
from app.Model.EmployeeTeam import EmployeeTeam
from app.Model.DefinedSkill import DefinedSkill
from app.response.allTrainingRes import TrainingRes, TrainingContentRes, QuestionRes, ModuleRes

def getAllTrainingData(orgID: str):
    try:
        allTraining = Training.objects(organizationID=orgID)
        response_list = []
        
        for train in allTraining:
            # Fetch content object
            content_obj = TrainingContent.objects(id=train.trainingContentID).first()
            newContentRes = None

            #employee details
            employeeGot = Employee.objects(id=train.employeeID).first()
            employeeName = employeeGot.employeeName
            employeeRole = EmployeeRole.objects(id=employeeGot.employeeRoleID).first()
            employeeRoleName = employeeRole.roleName
            employeeDepartmentName = Department.objects(id=employeeGot.employeeDepartmentID).first().deptName
            employeeTeamName = EmployeeTeam.objects(id=employeeGot.teamID).first().teamName
            allSkillNames = []
            for skID in employeeRole.roleSkillid:
                skillName = DefinedSkill.objects(id=skID).first().skill_name
                allSkillNames.append(skillName)

            
            if content_obj:
                # Map initial questions
                initial_qs = []
                for q in content_obj.initialQuestions:
                    initial_qs.append(QuestionRes(
                        questions=q.questions,
                        answerChoices=q.answerChoices,
                        correctAnswer=q.correctAnswer
                    ))
                
                # Map modules (Simplified mapping for this context)
                module_res_list = []
                for m in content_obj.modules:
                    # You could add more nested mapping here if needed
                    module_res_list.append(ModuleRes(
                        moduleTitle=m.moduleTitle,
                        moduleDescription=m.moduleDescription,
                        # evaluationQuestions, articles, slides etc could be added here
                    ))

                newContentRes = TrainingContentRes(
                    title=content_obj.title,
                    overview=content_obj.overview,
                    initialQuestions=initial_qs,
                    modules=module_res_list,
                    totalEvaluation=content_obj.totalEvaluation.to_mongo().to_dict() if content_obj.totalEvaluation else None
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
            
        return response_list

    except Exception as e:
        print(f"Error in getAllTrainingData: {str(e)}")
        raise e