import os
from celery import shared_task
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq 
from pydantic import BaseModel, Field

class QuizQuestionSchema(BaseModel):
    # Minor tweak: changed 'questions' to 'question' for better JSON semantics, but either works.
    question: str = Field(
        description="The text of the evaluation question."
    )
    answerChoices: list[str] = Field(
        description="An array of 4 possible answer strings."
    )
    correctAnswer: int = Field(
        description="The integer index (0-based) of the correct answer within the answerChoices array."
    )
    
class EvaluationTestSchema(BaseModel):
    test_questions: list[QuizQuestionSchema] = Field(
        description="A list of multiple-choice questions for the end-of-module evaluation."
    )    

@shared_task(bind=True)
def generate_initial_questions(self, target_skills: list[str], role: str):
    try:
        # 1. Use local variables instead of 'self.llm'
        api_key = os.getenv('GROQ_KEY')
        llm = ChatGroq(temperature=0.2, model_name="qwen/qwen3-32b", api_key=api_key)
        
        # 2. Refined prompt for clarity
        create_initial_questions_prompt = ChatPromptTemplate.from_template(
            "Create 5 diagnostic multiple-choice questions for these skills: {target_skills}. The target employee role is: {role}."
        )
        
        initial_questions_chain = create_initial_questions_prompt | llm.with_structured_output(EvaluationTestSchema)
        
        # 3. FIXED: Matched dictionary keys exactly to prompt variables
        # Also joined the list of skills into a comma-separated string for the AI
        generated_test = initial_questions_chain.invoke({
            "target_skills": ", ".join(target_skills), 
            "role": role
        })
        
        # 4. Return the parsed JSON dictionary
        return generated_test.model_dump()

    # 5. FIXED: Added the required except block with Celery retry logic
    except Exception as exc:
        # If the API times out or fails to return valid JSON, retry in 5 seconds
        self.retry(exc=exc, countdown=5, max_retries=3)