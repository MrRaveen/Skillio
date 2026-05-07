from flask import Blueprint, request, jsonify
from app.Tasks.generate_course import generate_initial_questions

testAreaBp = Blueprint('testAreaBp', __name__)

@testAreaBp.route('/test-celery', methods=['POST'])
def test_celery_task():
    try:
        data = request.get_json()
        target_skills = data.get('target_skills', ["Python", "Flask"])
        role = data.get('role', "Software Engineer")
        
        # Trigger the task asynchronously
        task = generate_initial_questions.delay(target_skills, role)
        
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
