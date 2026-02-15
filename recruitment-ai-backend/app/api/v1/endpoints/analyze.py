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

import json
from fastapi import APIRouter, HTTPException
from app.agents.auditor import ResumeAuditor
from app.agents.retention import RetentionPredictor
from app.agents.depth_agent import DepthAgent
from app.agents.parser import ResumeParser
from app.services.rag_engine import RAGEngine
from app.services.db_manager import DBManager 

router = APIRouter()

# Initialize Agents and Services
auditor = ResumeAuditor()
retention_agent = RetentionPredictor()
depth_agent = DepthAgent()
parser = ResumeParser()
rag = RAGEngine()
db_manager = DBManager()

@router.get("/{candidate_id}")
async def get_full_analysis(candidate_id: str):
    try:
        # 1. READ Cache
        cached_audit = db_manager.get_audit_by_id(candidate_id)
        if cached_audit:
            # We must parse the JSON string back into a dict for the frontend
            try:
                parsed_report = json.loads(cached_audit.audit_report) if isinstance(cached_audit.audit_report, str) else cached_audit.audit_report
            except:
                parsed_report = cached_audit.audit_report

            return {
                "candidate_id": cached_audit.candidate_id,
                # Flatten the report so Dashboard can see keys like 'summary_heading'
                "audit_report": parsed_report,
                **parsed_report, 
                "depth_score": cached_audit.depth_score,
                "retention_risk": cached_audit.retention_risk,
                "retention_percentage": cached_audit.retention_percentage,
                "retention_reasoning": cached_audit.retention_reasoning,
                "experience_extracted": cached_audit.experience_json,
                "metadata": {"source": "database"}
            }

        # 2. RAG & AI Pipeline
        context = rag.get_full_context(candidate_id)
        structured_exp = parser.extract_experience(context)
        depth_score = depth_agent.calculate_depth(structured_exp)
        
        # Retention Data extraction
        retention_data = retention_agent.predict_stability(candidate_id)
        
        # Forensic Audit Data (This is a DICT)
        text_audit_dict = auditor.run_full_audit(candidate_id)

        # 3. RECTIFICATION: Serialize DICTS to JSON STRINGS for SQLite
        # This prevents the "type 'dict' is not supported" error
        text_audit_serialized = json.dumps(text_audit_dict)
        experience_serialized = json.dumps(structured_exp)

        # 4. Prepare payload for DB (Uses STRINGS)
        db_payload = {
            "candidate_id": candidate_id,
            "audit_report": text_audit_serialized, # NOW A STRING
            "depth_score": round(depth_score, 2),
            "retention_risk": retention_data.get("risk_level", "Medium"),
            "retention_percentage": retention_data.get("stability_percentage", 50),
            "retention_reasoning": retention_data.get("reasoning", "Analysis complete."),
            "experience_json": experience_serialized # NOW A STRING
        }
        
        # 5. STORE in DB
        db_manager.save_audit(db_payload)

        # 6. Return to Frontend (Uses DICTS and FLATTENS the structure)
        return {
            "candidate_id": candidate_id,
            "audit_report": text_audit_dict,
            **text_audit_dict, # Spreads keys for Dashboard visibility
            "depth_score": round(depth_score, 2),
            "retention_risk": db_payload["retention_risk"],
            "retention_percentage": db_payload["retention_percentage"],
            "retention_reasoning": db_payload["retention_reasoning"],
            "experience_extracted": structured_exp,
            "metadata": {"source": "ai_engine"}
        }
        
    except Exception as e:
        import traceback
        print("!!! PIPELINE ERROR !!!")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

# @router.get("/{candidate_id}")
# async def get_full_analysis(candidate_id: str):
#     """
#     Retrieves analysis from SQLite cache or triggers the AI Pipeline.
#     """
#     try:
#         # 1. READ: Check if this audit already exists in SQLite
#         cached_audit = db_manager.get_audit_by_id(candidate_id)
#         if cached_audit:
#             return {
#                 "candidate_id": cached_audit.candidate_id,
#                 "audit_report": cached_audit.audit_report,
#                 "depth_score": cached_audit.depth_score,
#                 "retention_risk": cached_audit.retention_risk,
#                 "retention_percentage": cached_audit.retention_percentage,
#                 "retention_reasoning": cached_audit.retention_reasoning,
#                 "experience_extracted": cached_audit.experience_json,
#                 "metadata": {"source": "database", "status": "retrieved"}
#             }

#         # 2. RAG: Retrieve context from ChromaDB
#         context = rag.get_full_context(candidate_id)
#         if not context:
#             raise HTTPException(status_code=404, detail="Resume context not found. Please re-upload.")

#         # 3. AI PIPELINE: Run specialized agents via Groq
#         # A. Parse into structured JSON for the Graph
#         structured_exp = parser.extract_experience(context)
        
#         # B. Calculate Graph-based depth (NetworkX)
#         depth_score = depth_agent.calculate_depth(structured_exp)
        
#         # C. Predict stability and reasoning
#         retention_data = retention_agent.predict_stability(candidate_id)
        
#         # D. Generate qualitative audit
#         text_audit = auditor.run_full_audit(candidate_id)

#         # 4. STORE: Save the final results to SQLite
#         final_payload = {
#             "candidate_id": candidate_id,
#             "audit_report": text_audit,
#             "depth_score": round(depth_score, 2),
#             "retention_risk": retention_data.get("risk_level", "Medium"),
#             "retention_percentage": retention_data.get("stability_percentage", 50),
#             "retention_reasoning": retention_data.get("reasoning", "Analysis complete."),
#             "experience_json": structured_exp
#         }
        
#         db_manager.save_audit(final_payload)

#         # 5. RESPONSE: Return to Next.js Frontend
#         return {
#             **final_payload,
#             "experience_extracted": structured_exp,
#             "metadata": {
#                 "source": "ai_engine",
#                 "jobs_analyzed": len(structured_exp)
#             }
#         }
        
#     except Exception as e:
#         import traceback
#         print(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Analysis pipeline crashed: {str(e)}")