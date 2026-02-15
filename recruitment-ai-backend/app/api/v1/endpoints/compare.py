from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.agents.comparison_agent import ComparisonAgent
from app.services.rag_engine import RAGEngine

router = APIRouter()
agent = ComparisonAgent()
rag = RAGEngine()

class CompareRequest(BaseModel):
    id_a: str
    id_b: str
    job_description: str

@router.post("/")
async def compare_candidates(request: CompareRequest):
    ctx_a = rag.get_full_context(request.id_a)
    ctx_b = rag.get_full_context(request.id_b)
    
    if not ctx_a or not ctx_b:
        raise HTTPException(status_code=404, detail="One or both candidates not found.")

    # The agent returns a dict: {"winner": "ID", "justification": [], "fit_score_a": 80, etc.}
    return agent.debate_candidates(ctx_a, ctx_b, request.job_description)