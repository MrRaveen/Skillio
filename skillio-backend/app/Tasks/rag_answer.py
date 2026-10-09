"""
Celery task: answer a user's question about a specific document using RAG.

Flow:
  1. Receive doc_id + question.
  2. Call get_relevant_context() to retrieve the most semantically similar
     text from the document (cosine-similarity ranked).
  3. Feed the context + question into the local Ollama LLM via LangChain.
  4. Return the answer string as the Celery task result.
"""

from celery import shared_task
from langchain_core.prompts import ChatPromptTemplate
from langchain_ollama import ChatOllama
from langchain_core.output_parsers import StrOutputParser

from app.Service.process_document_embedding import get_relevant_context

import os

_RAG_PROMPT = ChatPromptTemplate.from_messages([
    (
        "system",
        (
            "You are a helpful assistant that answers questions strictly based on "
            "the provided document context. If the answer is not found in the context, "
            "say 'I could not find an answer in the document.' Do NOT make up information.\n\n"
            "Document context:\n{context}"
        ),
    ),
    ("human", "{question}"),
])

def _get_rag_chain():
    ollama_url = os.getenv('OLLAMA_BASE_URL', 'http://localhost:11434')
    model_name = os.getenv('OLLAMA_MODEL', 'gpt-oss:120b')
    max_tokens = int(os.getenv('MAX_TOKENS', '4096'))
    api_key = os.getenv('OLLAMA_API_KEY', '')

    llm = ChatOllama(
        model=model_name,
        base_url=ollama_url,
        temperature=0.2,
        num_predict=max_tokens,
        **(({"headers": {"Authorization": f"Bearer {api_key}"}}) if api_key else {})
    )
    
    return _RAG_PROMPT | llm | StrOutputParser()



@shared_task(bind=True, name="app.Tasks.rag_answer.answer_document_question")
def answer_document_question(self, doc_id: str, question: str) -> dict:
    """
    Celery task that performs RAG over a single document.

    Args:
        doc_id:   MongoDB ObjectId string of the DocumentBase record.
        question: Natural-language question from the user.

    Returns:
        dict with keys:
          - "answer"  (str)  : The LLM's response.
          - "context" (str)  : The retrieved context snippets (for transparency).
          - "doc_id"  (str)  : Echoed back for client correlation.
    """
    # 1. Retrieve the most relevant text passages from the document
    context = get_relevant_context(doc_id=doc_id, question=question, top_k=3)

    if not context.strip():
        return {
            "answer": "I could not find any extractable text for this document. "
                      "Please ensure the document has been processed and indexed.",
            "context": "",
            "doc_id": doc_id,
        }

    # 2. Run through the RAG chain
    chain = _get_rag_chain()
    answer = chain.invoke({"context": context, "question": question})

    return {
        "answer": answer,
        "context": context,
        "doc_id": doc_id,
    }




