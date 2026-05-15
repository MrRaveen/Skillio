from flask import Blueprint, request, jsonify
from app.Tasks.generate_course import generate_initial_questions, create_course
from app.Model.enum.proficiencyLevelInitialQuestions import proficiencyLevelInitialQuestions

testAreaBp = Blueprint('testAreaBp', __name__)

@testAreaBp.route('/test-celery', methods=['POST'])
def test_celery_task():
    try:
        data = request.get_json()
        target_skills = data.get('target_skills', ["Python", "Flask"])
        role = data.get('role', "Software Engineer")
        employeeID = data.get('employeeID')
        organizationID = data.get('organizationID')
        
        # Trigger the task asynchronously
        task = generate_initial_questions.delay(target_skills, role, employeeID, organizationID)

        
        return jsonify({
            "status": "success",
            "message": "Celery task triggered",
            "task_id": task.id
        }), 202
    except Exception as e:
        return jsonify({
            "status": "failed",
            "message": str(e)
        }), 500

@testAreaBp.route('/test-create-course', methods=['POST'])
def test_create_course_route():
    try:
        data = request.get_json()
        contentID = data.get('contentID')
        role = data.get('role', "Software Engineer")
        target_skills = data.get('target_skills', ["Python", "Flask"])
        proficiency_str = data.get('proficiencyLevel', "Medium")
        employeeID = data.get('employeeID', "TEST_EMP_001")
        
        # Convert string to enum
        try:
            proficiency_level = proficiencyLevelInitialQuestions(proficiency_str)
        except ValueError:
            proficiency_level = proficiencyLevelInitialQuestions.MEDIUM

        if not contentID:
            return jsonify({"status": "failed", "message": "contentID is required"}), 400

        # Trigger the task asynchronously
        task = create_course.delay(contentID, role, target_skills, proficiency_level.value, employeeID)
        
        return jsonify({
            "status": "success",
            "message": "Create course task triggered",
            "task_id": task.id
        }), 202
    except Exception as e:
        return jsonify({
            "status": "failed",
            "message": str(e)
        }), 500

