from fastapi import APIRouter
from app.services.db_manager import DBManager

router = APIRouter()
db_manager = DBManager()

@router.get("/")
async def get_audit_history():
    """
    Retrieves all audit records from SQLite and formats them for the frontend.
    Ensures all retention data is exposed for the 'All Candidates' table.
    """
    audits = db_manager.get_all_audits()
    
    # We map the database objects into a clean JSON-serializable list
    return [
        {
            "candidate_id": a.candidate_id,
            "depth_score": a.depth_score,
            "retention_risk": a.retention_risk,       # <--- ADDED
            "retention_percentage": a.retention_percentage, # <--- ADDED
            "retention_reasoning": a.retention_reasoning,   # <--- ADDED
            "created_at": a.created_at.isoformat() if a.created_at else None,
        } for a in audits
    ]