from pydantic import BaseModel, Field
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

# 1. Define Schemas for Each Stage
class OverviewSchema(BaseModel):
    course_title: str
    target_audience: str
    core_objectives: list[str]

class ModuleListSchema(BaseModel):
    modules: list[str] = Field(description="A list of module titles based on the overview")

class ArticleSchema(BaseModel):
    title: str
    paragraphs: list[str]

class AIService:
    def __init__(self, api_key: str):
        self.llm = ChatGroq(temperature=0.2, model_name="llama3-8b-8192", api_key=api_key)
        
        # 2. Build Individual Chains for Each Stage
        
        # Stage 1: Overview Chain
        self.overview_prompt = ChatPromptTemplate.from_template(
            "Create a course overview for the skill: {skill} targeted at role: {role}."
        )
        self.overview_chain = self.overview_prompt | self.llm.with_structured_output(OverviewSchema)
        
        # Stage 2: Module Chain
        self.module_prompt = ChatPromptTemplate.from_template(
            "Based on this course overview: {overview_data}, generate a list of 3 specific training modules."
        )
        self.module_chain = self.module_prompt | self.llm.with_structured_output(ModuleListSchema)
        
        # Stage 3: Article Chain
        self.article_prompt = ChatPromptTemplate.from_template(
            "Write a technical training article for the module titled: {module_title}. Ensure it aligns with the main course: {course_title}."
        )
        self.article_chain = self.article_prompt | self.llm.with_structured_output(ArticleSchema)

    # 3. Orchestrate the Pipeline
    def generate_full_course(self, target_skill: str, employee_role: str):
        """Standard Python logic coordinates the LangChain pipelines."""
        
        # Execute Stage 1
        overview = self.overview_chain.invoke({
            "skill": target_skill, 
            "role": employee_role
        })
        # TODO: Save overview to MongoDB here
        
        # Execute Stage 2 (Passing output of Stage 1 as input)
        module_list = self.module_chain.invoke({
            "overview_data": overview.model_dump_json() 
        })
        # TODO: Save modules to MongoDB here
        
        # Execute Stage 3 (Iterating over the output of Stage 2)
        generated_articles = []
        for module_title in module_list.modules:
            article = self.article_chain.invoke({
                "module_title": module_title,
                "course_title": overview.course_title
            })
            generated_articles.append(article)
            # TODO: Save individual article to MongoDB here
            
        return {
            "overview": overview.model_dump(),
            "modules": module_list.model_dump(),
            "articles": [a.model_dump() for a in generated_articles]
        }