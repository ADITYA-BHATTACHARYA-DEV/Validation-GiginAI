# from fastapi import APIRouter, HTTPException
# from pydantic import BaseModel
# from app.agents.comparison_agent import ComparisonAgent
# from app.services.rag_engine import RAGEngine

# router = APIRouter()
# agent = ComparisonAgent()
# rag = RAGEngine()

# class CompareRequest(BaseModel):
#     id_a: str
#     id_b: str
#     job_description: str

# @router.post("/")
# async def compare_candidates(request: CompareRequest):
#     ctx_a = rag.get_full_context(request.id_a)
#     ctx_b = rag.get_full_context(request.id_b)
    
#     if not ctx_a or not ctx_b:
#         raise HTTPException(status_code=404, detail="One or both candidates not found.")

#     # The agent returns a dict: {"winner": "ID", "justification": [], "fit_score_a": 80, etc.}
#     return agent.debate_candidates(ctx_a, ctx_b, request.job_description)





from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.agents.comparison_agent import ComparisonAgent
from app.services.rag_engine import RAGEngine

router = APIRouter()
agent = ComparisonAgent()
rag = RAGEngine()

# 1. Define Request Schema
class CompareRequest(BaseModel):
    candidate_ids: List[str] 
    job_description: str

@router.post("/")
async def compare_candidates(request: CompareRequest):
    """
    Endpoint to compare 2-5 candidates against a JD.
    """
    # Validation: Ensure at least two candidates are selected
    if len(request.candidate_ids) < 2:
        raise HTTPException(
            status_code=400, 
            detail="Minimum 2 candidates required for a debate."
        )

    # 2. Collect RAG contexts for all candidates
    candidate_data = []
    for cid in request.candidate_ids:
        # Skip empty strings if they sneak in from the frontend
        if not cid: continue 
            
        context = rag.get_full_context(cid)
        if not context:
            raise HTTPException(
                status_code=404, 
                detail=f"Candidate profile {cid} could not be retrieved from the index."
            )
        candidate_data.append({"id": cid, "context": context})

    # 3. Execute Multi-Candidate Analysis
    try:
        # RECTIFIED: Method name must match ComparisonAgent.compare_multiple_candidates
        result = agent.compare_multiple_candidates(candidate_data, request.job_description)
        return result
        
    except Exception as e:
        import traceback
        print(f"COMPARISON_PIPELINE_ERROR: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500, 
            detail=f"The AI Strategist failed to reach a verdict: {str(e)}"
        )