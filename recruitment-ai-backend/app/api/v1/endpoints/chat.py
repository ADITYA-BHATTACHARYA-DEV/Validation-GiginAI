from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from app.agents.chat_agent import ResumeChatAgent
from app.services.rag_engine import RAGEngine

router = APIRouter()
chat_agent = ResumeChatAgent()
rag = RAGEngine()

# Use Pydantic for strict validation of the chat history
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    candidate_id: str
    query: str
    history: List[ChatMessage] = [] # Validates the history list structure

@router.post("/query")
async def chat_with_resume(request: ChatRequest):
    """
    Agentic Chat Endpoint:
    Retrieves vectorized context from RAG and returns a grounded 
    AI response with citations.
    """
    try:
        # 1. Context Retrieval (RAG Layer)
        context = rag.get_full_context(request.candidate_id)
        if not context:
            raise HTTPException(
                status_code=404, 
                detail="Candidate context not found in vector store."
            )

        # 2. Format history for the Groq Agent
        # Converts Pydantic objects back to a list of dicts
        formatted_history = [
            {"role": msg.role, "content": msg.content} 
            for msg in request.history
        ]

        # 3. Agent Execution (Groq Llama-3 70B)
        # result is expected to be a dict: {"answer": str, "citation": str | None}
        result = chat_agent.answer_query(
            query=request.query, 
            context=context, 
            history=formatted_history
        )
        
        # 4. Final Response Construction
        return {
            "answer": result.get("answer", "I couldn't generate an answer."),
            "citation": result.get("citation"),
            "candidate_id": request.candidate_id,
            "status": "success"
        }

    except Exception as e:
        import traceback
        print(f"CHAT_ERROR: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Agentic Chat failed: {str(e)}")