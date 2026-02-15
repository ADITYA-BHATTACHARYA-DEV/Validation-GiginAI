from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.rag_engine import RAGEngine
import uuid
import shutil
import os

router = APIRouter()
# Initializing the RAG engine which uses HuggingFace local embeddings
rag_engine = RAGEngine()

@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    # Generate a unique identifier for this specific candidate
    candidate_id = str(uuid.uuid4())
    temp_path = f"./data/uploads/{candidate_id}.pdf"
    
    # Ensure local storage directory exists
    os.makedirs(os.path.dirname(temp_path), exist_ok=True)

    try:
        # Save the uploaded PDF binary to the local file system
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Index the document into ChromaDB using the candidate_id as metadata
        rag_engine.process_resume(temp_path, candidate_id)
        
        return {"candidate_id": candidate_id, "status": "indexed"}
    except Exception as e:
        # Rollback: remove the file if indexing fails
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(status_code=500, detail=f"Indexing failed: {str(e)}")