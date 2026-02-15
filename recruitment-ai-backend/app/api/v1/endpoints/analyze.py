from fastapi import APIRouter, HTTPException
from app.agents.auditor import ResumeAuditor
from app.services.graph_manager import GraphManager

router = APIRouter()
# Specialized agent for Groq-based text analysis
auditor = ResumeAuditor()
# Manager for calculating work experience depth via NetworkX
graph_manager = GraphManager()

@router.get("/{candidate_id}")
async def get_full_analysis(candidate_id: str):
    try:
        # 1. Run RAG-based Text Audit via Groq LPU
        text_audit = auditor.run_full_audit(candidate_id)
        
        # 2. Mock experience data for Graph Depth Calculation
        # In a later step, you'll extract this data automatically from the resume text
        mock_exp = [
            {"company": "Tech Startup", "size": 15, "role": "Fullstack Dev", "impact": 0.8},
            {"company": "Global Corp", "size": 5000, "role": "Junior Dev", "impact": 0.4}
        ]
        
        # Calculate quantitative depth using graph theory
        depth_score = graph_manager.calculate_work_depth(mock_exp)

        return {
            "candidate_id": candidate_id,
            "audit_report": text_audit,
            "depth_score": round(depth_score, 2),
            "retention_risk": "Low" if depth_score > 5 else "Medium"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")