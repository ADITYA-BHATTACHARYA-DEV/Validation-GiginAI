# import json
# from fastapi import APIRouter, HTTPException
# from app.agents.auditor import ResumeAuditor
# from app.agents.retention import RetentionPredictor
# from app.agents.depth_agent import DepthAgent
# from app.agents.parser import ResumeParser
# from app.services.rag_engine import RAGEngine
# from app.services.db_manager import DBManager 

# router = APIRouter()

# # Initialize Agents and Services
# auditor = ResumeAuditor()
# retention_agent = RetentionPredictor()
# depth_agent = DepthAgent()
# parser = ResumeParser()
# rag = RAGEngine()
# db_manager = DBManager()

# @router.get("/{candidate_id}")
# async def get_full_analysis(candidate_id: str):
#     try:
#         # 1. READ Cache
#         cached_audit = db_manager.get_audit_by_id(candidate_id)
#         if cached_audit:
#             # We must parse the JSON string back into a dict for the frontend
#             try:
#                 parsed_report = json.loads(cached_audit.audit_report) if isinstance(cached_audit.audit_report, str) else cached_audit.audit_report
#             except:
#                 parsed_report = cached_audit.audit_report

#             return {
#                 "candidate_id": cached_audit.candidate_id,
#                 # Flatten the report so Dashboard can see keys like 'summary_heading'
#                 "audit_report": parsed_report,
#                 **parsed_report, 
#                 "depth_score": cached_audit.depth_score,
#                 "retention_risk": cached_audit.retention_risk,
#                 "retention_percentage": cached_audit.retention_percentage,
#                 "retention_reasoning": cached_audit.retention_reasoning,
#                 "experience_extracted": cached_audit.experience_json,
#                 "metadata": {"source": "database"}
#             }

#         # 2. RAG & AI Pipeline
#         context = rag.get_full_context(candidate_id)
#         structured_exp = parser.extract_experience(context)
#         depth_score = depth_agent.calculate_depth(structured_exp)
        
#         # Retention Data extraction
#         retention_data = retention_agent.predict_stability(candidate_id)
        
#         # Forensic Audit Data (This is a DICT)
#         text_audit_dict = auditor.run_full_audit(candidate_id)

#         # 3. RECTIFICATION: Serialize DICTS to JSON STRINGS for SQLite
#         # This prevents the "type 'dict' is not supported" error
#         text_audit_serialized = json.dumps(text_audit_dict)
#         experience_serialized = json.dumps(structured_exp)

#         # 4. Prepare payload for DB (Uses STRINGS)
#         db_payload = {
#             "candidate_id": candidate_id,
#             "audit_report": text_audit_serialized, # NOW A STRING
#             "depth_score": round(depth_score, 2),
#             "retention_risk": retention_data.get("risk_level", "Medium"),
#             "retention_percentage": retention_data.get("stability_percentage", 50),
#             "retention_reasoning": retention_data.get("reasoning", "Analysis complete."),
#             "experience_json": experience_serialized # NOW A STRING
#         }
        
#         # 5. STORE in DB
#         db_manager.save_audit(db_payload)

#         # 6. Return to Frontend (Uses DICTS and FLATTENS the structure)
#         return {
#             "candidate_id": candidate_id,
#             "audit_report": text_audit_dict,
#             **text_audit_dict, # Spreads keys for Dashboard visibility
#             "depth_score": round(depth_score, 2),
#             "retention_risk": db_payload["retention_risk"],
#             "retention_percentage": db_payload["retention_percentage"],
#             "retention_reasoning": db_payload["retention_reasoning"],
#             "experience_extracted": structured_exp,
#             "metadata": {"source": "ai_engine"}
#         }
        
#     except Exception as e:
#         import traceback
#         print("!!! PIPELINE ERROR !!!")
#         print(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=str(e))


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
            try:
                # Load the string back into a dictionary
                parsed_report = json.loads(cached_audit.audit_report) if isinstance(cached_audit.audit_report, str) else cached_audit.audit_report
            except:
                parsed_report = cached_audit.audit_report

            return {
                "candidate_id": cached_audit.candidate_id,
                # RECTIFIED: Explicitly pull candidate name from report
                "candidate_name": parsed_report.get("candidate_name", "Unknown Candidate"),
                **parsed_report, 
                "depth_score": cached_audit.depth_score, # Correctly pass numeric depth_score
                "retention_risk": cached_audit.retention_risk,
                "retention_percentage": cached_audit.retention_percentage,
                "retention_reasoning": cached_audit.retention_reasoning,
                "experience_extracted": json.loads(cached_audit.experience_json) if isinstance(cached_audit.experience_json, str) else cached_audit.experience_json,
                "metadata": {"source": "database"}
            }

        # 2. RAG & AI Pipeline
        context = rag.get_full_context(candidate_id)
        structured_exp = parser.extract_experience(context)
        
        # Calculate Depth Score via Dedicated Agent
        calculated_depth = depth_agent.calculate_depth(structured_exp)
        
        # Stability / Retention Prediction
        retention_data = retention_agent.predict_stability(candidate_id)
        
        # Forensic Audit (Now includes 'candidate_name' in its prompt/output)
        text_audit_dict = auditor.run_full_audit(candidate_id)

        # 3. DB PAYLOAD PREPARATION (Serialize for SQLite)
        text_audit_serialized = json.dumps(text_audit_dict)
        experience_serialized = json.dumps(structured_exp)

        db_payload = {
            "candidate_id": candidate_id,
            "audit_report": text_audit_serialized,
            "depth_score": round(calculated_depth, 2),
            "retention_risk": retention_data.get("risk_level", "Medium"),
            "retention_percentage": retention_data.get("stability_percentage", 50),
            "retention_reasoning": retention_data.get("reasoning", "Analysis complete."),
            "experience_json": experience_serialized
        }
        
        # 4. STORE
        db_manager.save_audit(db_payload)

        # 5. FRONTEND PAYLOAD (Flattened for Dashboard)
        return {
            "candidate_id": candidate_id,
            "candidate_name": text_audit_dict.get("candidate_name", "Unknown"), # RECTIFIED
            **text_audit_dict,
            "depth_score": round(calculated_depth, 2), # RECTIFIED
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