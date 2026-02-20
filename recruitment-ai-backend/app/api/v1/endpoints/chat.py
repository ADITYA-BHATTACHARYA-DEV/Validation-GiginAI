from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.agents.chat_agent import ResumeChatAgent
from app.services.rag_engine import RAGEngine

router = APIRouter()
chat_agent = ResumeChatAgent()
rag = RAGEngine()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    # Optional because it's null when chatting about a comparison
    candidate_id: Optional[str] = None
    query: str
    history: List[ChatMessage] = []
    # New Field: Context passed from the Frontend Comparison results
    comparison_context: Optional[Dict[str, Any]] = None 

@router.post("/query")
async def chat_with_advisor(request: ChatRequest):
    """
    Agentic Chat Endpoint:
    Handles both individual resume Q&A and Comparison-wide debates.
    """
    try:
        context = ""
        
        # SCENARIO A: User is asking about a specific candidate in a deep-dive
        if request.candidate_id:
            raw_context = rag.get_full_context(request.candidate_id)
            if not raw_context:
                raise HTTPException(status_code=404, detail="Candidate context not found.")
            context = f"INDIVIDUAL CANDIDATE DATA:\n{raw_context}"

        # SCENARIO B: User is asking follow-up questions on a Comparison Audit
        elif request.comparison_context:
            jd = request.comparison_context.get("jd", "N/A")
            results = request.comparison_context.get("comparison_results", {})
            
            # Format comparison results for the LLM to understand the rankings
            leaderboard_summary = ""
            if "leaderboard" in results:
                for c in results["leaderboard"]:
                    leaderboard_summary += (
                        f"- {c.get('candidate_name')} (Match: {c.get('fit_score')}%, "
                        f"Stability: {c.get('retention_score')}%): {c.get('verdict')}\n"
                    )
            
            context = (
                f"AUDIT CONTEXT:\n"
                f"JOB DESCRIPTION: {jd[:1000]}\n"
                f"RANKINGS:\n{leaderboard_summary}\n"
                f"EXECUTIVE SUMMARY: {results.get('executive_summary', 'N/A')}"
            )

        # SCENARIO C: No context provided
        else:
            raise HTTPException(status_code=400, detail="No candidate ID or comparison context provided.")

        # Convert Pydantic history to dicts
        formatted_history = [{"role": msg.role, "content": msg.content} for msg in request.history]

        # Agent Execution (Llama-3 70B)
        result = chat_agent.answer_query(
            query=request.query, 
            context=context, 
            history=formatted_history
        )
        
        return {
            "answer": result.get("answer", "I couldn't generate an answer."),
            "citation": result.get("citation"),
            "status": "success"
        }

    except Exception as e:
        import traceback
        print(f"CHAT_ERROR: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))