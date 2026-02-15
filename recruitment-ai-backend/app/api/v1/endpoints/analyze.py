# from fastapi import APIRouter, HTTPException
# from app.agents.auditor import ResumeAuditor
# from app.services.graph_manager import GraphManager

# router = APIRouter()
# # Specialized agent for Groq-based text analysis
# auditor = ResumeAuditor()
# # Manager for calculating work experience depth via NetworkX
# graph_manager = GraphManager()

# @router.get("/{candidate_id}")
# async def get_full_analysis(candidate_id: str):
#     try:
#         # 1. Run RAG-based Text Audit via Groq LPU
#         text_audit = auditor.run_full_audit(candidate_id)
        
#         # 2. Mock experience data for Graph Depth Calculation
#         # In a later step, you'll extract this data automatically from the resume text
#         mock_exp = [
#             {"company": "Tech Startup", "size": 15, "role": "Fullstack Dev", "impact": 0.8},
#             {"company": "Global Corp", "size": 5000, "role": "Junior Dev", "impact": 0.4}
#         ]
        
#         # Calculate quantitative depth using graph theory
#         depth_score = graph_manager.calculate_work_depth(mock_exp)

#         return {
#             "candidate_id": candidate_id,
#             "audit_report": text_audit,
#             "depth_score": round(depth_score, 2),
#             "retention_risk": "Low" if depth_score > 5 else "Medium"
#         }
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


from fastapi import APIRouter, HTTPException
from app.agents.auditor import ResumeAuditor
from app.agents.retention import RetentionPredictor
from app.agents.depth_agent import DepthAgent
from app.agents.parser import ResumeParser
from app.services.rag_engine import RAGEngine
from app.services.db_manager import DBManager # New persistence service

router = APIRouter()

# Initialize all specialized agents
auditor = ResumeAuditor()
retention_agent = RetentionPredictor()
depth_agent = DepthAgent()
parser = ResumeParser()
rag = RAGEngine()
db_manager = DBManager() # Manages SQLite operations

@router.get("/{candidate_id}")
async def get_full_analysis(candidate_id: str):
    try:
        # 1. Database Check (Caching Layer)
        # Check if we have already audited this candidate to save time/tokens
        cached_audit = db_manager.get_audit(candidate_id)
        if cached_audit:
            # SQLAlchemy objects need to be converted to dict for FastAPI response
            return {
                "candidate_id": cached_audit.candidate_id,
                "audit_report": cached_audit.audit_report,
                "depth_score": cached_audit.depth_score,
                "retention_risk": cached_audit.retention_risk,
                "retention_percentage": cached_audit.retention_percentage,
                "retention_reasoning": cached_audit.retention_reasoning,
                "experience_extracted": cached_audit.experience_json,
                "metadata": {"source": "database"}
            }

        # 2. Retrieve raw text context from ChromaDB
        context = rag.get_full_context(candidate_id)
        if not context:
            raise HTTPException(status_code=404, detail="Candidate data not found in vector store.")

        # 3. Execution Phase (AI Agents)
        # Parse text into structured JSON for the Graph Agent
        structured_exp = parser.extract_experience(context)
        
        # Calculate Math-based Depth Score
        depth_score = depth_agent.calculate_depth(structured_exp)
        
        # Predict Stability Risk & Percentage
        retention_data = retention_agent.predict_stability(candidate_id)
        
        # Generate Qualitative Audit Report
        text_audit = auditor.run_full_audit(candidate_id)

        # 4. Persistence Phase
        # Prepare the data dictionary for SQLite
        final_data = {
            "candidate_id": candidate_id,
            "audit_report": text_audit,
            "depth_score": round(depth_score, 2),
            "retention_risk": retention_data.get("risk_level", "Medium"),
            "retention_percentage": retention_data.get("stability_percentage", 50),
            "retention_reasoning": retention_data.get("reasoning", "No data available."),
            "experience_json": structured_exp # Maps to the JSON column in DB
        }
        
        # Save the result so we don't have to run Groq again for this ID
        db_manager.save_audit(final_data)

        # 5. Return Response
        return {
            **final_data,
            "experience_extracted": structured_exp, # Key match for frontend DebugLog
            "metadata": {
                "jobs_analyzed": len(structured_exp),
                "parsing_status": "success" if structured_exp else "failed",
                "source": "ai_engine"
            }
        }
        
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Analysis pipeline failed: {str(e)}")