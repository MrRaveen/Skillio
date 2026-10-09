from app.Model.DocumentBase import DocumentBase
import requests
from io import BytesIO
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer
import numpy as np

# Load the model globally during app initialization to prevent reloading it per request.
# 'all-MiniLM-L6-v2' is open-source and free.
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

def process_document_embedding(doc_id: str):
    # 1. Retrieve the document record
    doc = DocumentBase.objects(id=doc_id).first()
    if not doc:
        raise ValueError("Document not found")

    # 2. Download the file from the signed URL into memory
    response = requests.get(doc.uploadedUrl, timeout=15)
    response.raise_for_status()

    # 3. Extract text (assuming a PDF file)
    file_bytes = BytesIO(response.content)
    reader = PdfReader(file_bytes)
    extracted_text = "".join(
        page.extract_text() for page in reader.pages if page.extract_text()
    )

    if not extracted_text.strip():
        raise ValueError("No extractable text found in the document")

    # 4. Generate the vector embedding
    # Note: all-MiniLM-L6-v2 natively truncates inputs over 256 word tokens. 
    # If documents are large, you must split `extracted_text` into an array of smaller chunks 
    # and embed each chunk individually.
    vector = embedding_model.encode(extracted_text).tolist()

    # 5. Save the vector embedding AND the extracted text to MongoDB
    doc.vectorEmbedding = vector
    doc.extractedText = extracted_text
    doc.save()
    
    return True


# ---------------------------------------------------------------------------
# Helper: Cosine Similarity
# ---------------------------------------------------------------------------

def _cosine_similarity(vec_a: np.ndarray, vec_b: np.ndarray) -> float:
    """
    Calculate the cosine similarity between two 1-D numpy vectors.

    cosine_similarity = (A · B) / (||A|| * ||B||)

    Returns a float in [-1, 1].  Returns 0.0 if either vector has zero norm
    to avoid a division-by-zero error.
    """
    norm_a = np.linalg.norm(vec_a)
    norm_b = np.linalg.norm(vec_b)
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return float(np.dot(vec_a, vec_b) / (norm_a * norm_b))


# ---------------------------------------------------------------------------
# get_relevant_context
# ---------------------------------------------------------------------------

def get_relevant_context(doc_id: str, question: str, top_k: int = 3) -> str:
    """
    Retrieve the most relevant text chunks from MongoDB for a given question.

    Steps:
      1. Embed the question with the globally-loaded SentenceTransformer model.
      2. Fetch all DocumentBase records that match `doc_id`.
      3. Score each chunk's vectorEmbedding against the question embedding
         using cosine similarity.
      4. Return the top `top_k` chunkText values joined by '\\n\\n'.

    Args:
        doc_id:   The documentID to scope the search.
        question: The natural-language query from the user.
        top_k:    Number of top-scoring chunks to return (default 3).

    Returns:
        A single string of the top-k chunk texts, or '' if no chunks found.
    """
    # 1. Embed the question
    question_vector: np.ndarray = embedding_model.encode(question)

    # 2. Fetch all chunks for the document
    chunks = DocumentBase.objects(id=doc_id)
    if not chunks:
        return ""

    # 3. Score each chunk
    scored_chunks = []
    for chunk in chunks:
        if not chunk.vectorEmbedding:
            continue
        chunk_vector = np.array(chunk.vectorEmbedding, dtype=np.float32)
        score = _cosine_similarity(question_vector, chunk_vector)
        scored_chunks.append((score, chunk.extractedText or ""))

    if not scored_chunks:
        return ""

    # 4. Sort descending by similarity score
    scored_chunks.sort(key=lambda x: x[0], reverse=True)

    # 5. Return the top-k texts joined by double newline
    top_texts = [text for _, text in scored_chunks[:top_k]]
    return "\n\n".join(top_texts)