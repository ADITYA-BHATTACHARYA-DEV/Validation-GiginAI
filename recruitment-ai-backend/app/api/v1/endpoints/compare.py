from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.agents.comparison_agent import ComparisonAgent
from app.services.rag_engine import RAGEngine
import json
import traceback

router = APIRouter()
agent = ComparisonAgent()
rag = RAGEngine()

# 1. Structured Request Model
class CompareRequest(BaseModel):
    candidate_ids: List[str]
    job_description: str
    # 'forensic' (strict/deductive) or 'helpful' (potential/additive)
    mode: str = "forensic" 

@router.post("/")
async def compare_candidates(request: CompareRequest):
    """
    FastAPI endpoint to orchestrate multi-candidate analysis.
    Now includes verbose debugging for forensic pipeline errors.
    """
    
    # 2. VALIDATION & DEDUPLICATION
    unique_ids = []
    seen = set()
    for cid in request.candidate_ids:
        cleaned_id = cid.strip()
        if cleaned_id and cleaned_id not in seen:
            unique_ids.append(cleaned_id)
            seen.add(cleaned_id)
    
    if len(unique_ids) < 2:
        raise HTTPException(
            status_code=400, 
            detail="Forensic comparison requires at least 2 unique candidates."
        )

    # 3. RAG PIPELINE
    candidate_data = []
    for cid in unique_ids:
        context = rag.get_full_context(cid)
        
        if not context:
            # Helpful error to identify which specific ID is causing the 404
            print(f"DEBUG: Candidate context MISSING for ID: {cid}")
            raise HTTPException(
                status_code=404, 
                detail=f"Candidate reference '{cid}' not found in the index."
            )
            
        candidate_data.append({
            "id": cid, 
            "context": context
        })

    # 4. AGENT EXECUTION WITH VERBOSE DEBUGGING
    try:
        print(f"DEBUG: Starting Comparison Logic for {len(candidate_data)} candidates in {request.mode} mode.")
        
        result = agent.compare_multiple_candidates(
            candidate_data, 
            request.job_description, 
            mode=request.mode
        )
        
        # LOG RAW RESULT KEYS: Ensure all expected keys are present before returning
        required_keys = ["winner_id", "leaderboard", "executive_summary"]
        missing = [k for k in required_keys if k not in result]
        
        if missing:
            print(f"WARNING: AI response is missing keys: {missing}")
            # Optional: You could raise an error here or fill with defaults
            
        return result

    except Exception as e:
        # This will print the full error path to your server console
        error_trace = traceback.format_exc()
        print(f"\n--- PIPELINE CRITICAL ERROR ---\n{error_trace}\n-------------------------------\n")
        
        # Return a more descriptive error to the frontend
        raise HTTPException(
            status_code=500, 
            detail=f"AI Engine Error: {str(e)}"
        )