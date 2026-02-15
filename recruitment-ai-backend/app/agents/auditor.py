import os
import json
from dotenv import load_dotenv
load_dotenv() 

from groq import Groq
from app.core.config import settings 
from app.services.rag_engine import RAGEngine

class ResumeAuditor:
    def __init__(self):
        # Initializing Groq client using validated API key
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        self.rag = RAGEngine()

    def run_full_audit(self, candidate_id: str):
        """
        Coordinates RAG retrieval and Groq inference to generate a 
        detailed, forensic JSON-formatted resume audit.
        """
        # 1. Retrieve the text for this specific candidate from the Vector DB
        context = self.rag.get_full_context(candidate_id)
        
        if not context:
            return {
                "summary_heading": "AUDIT FAILED",
                "summary_text": "No context retrieved for candidate. Please ensure the PDF was indexed.",
                "ai_generated_score": 0,
                "authenticity_score": 0,
                "depth_score": 0,
                "inconsistencies": ["Missing Context"],
                "highlights": [],
                "work_depth_analysis": "N/A",
                "educational_pedigree": "N/A",
                "career_gaps": "N/A",
                "retention_prediction": "N/A"
            }

        # 2. Execute Groq Inference with the Full Forensic Schema
        try:
            system_prompt = (
                "You are a Senior Forensic AI Auditor. Your goal is to detect inconsistencies, "
                "inflated claims, and AI-patterns in resumes. Be critical and professional.\n\n"
                "STRICT RULES:\n"
                "1. Do NOT use asterisks (*) or hashes (#) in any part of the response.\n"
                "2. Ensure all headings and text are clean, plain-text strings.\n\n"
                "STRICT JSON OUTPUT SCHEMA:\n"
                "{\n"
                "  \"summary_heading\": \"A bold stylized title (e.g., FORENSIC VERDICT)\",\n"
                "  \"summary_text\": \"2-sentence executive summary\",\n"
                "  \"ai_generated_score\": 0-100 (Integer),\n"
                "  \"authenticity_score\": 0-100 (Integer),\n"
                "  \"depth_score\": 0-100 (Integer - match the authenticity or complexity level),\n"
                "  \"inconsistencies\": [\"List of factual or formatting gaps\"],\n"
                "  \"highlights\": [\"Key achievements or strengths\"],\n"
                "  \"work_depth_analysis\": \"Analysis of product/company impact and complexity\",\n"
                "  \"educational_pedigree\": \"Analysis of institute tier and academic rigor\",\n"
                "  \"career_gaps\": \"Analysis of any breaks in employment\",\n"
                "  \"retention_prediction\": \"How likely they are to stay and why\"\n"
                "}\n"
                "Return only the raw JSON object."
            )

            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Audit this candidate profile:\n\n{context}"}
                ],
                temperature=0.1, 
                response_format={"type": "json_object"} 
            )

            # Parse the string response into a Python Dictionary
            audit_data = json.loads(response.choices[0].message.content)
            
            # Ensure candidate_id is attached
            audit_data["candidate_id"] = candidate_id
            
            # Helper: Add any missing keys to prevent DB binding errors
            audit_data.setdefault("depth_score", audit_data.get("authenticity_score", 0))
            
            return audit_data

        except Exception as e:
            import traceback
            print(f"AUDIT_AGENT_ERROR: {traceback.format_exc()}")
            return {
                "summary_heading": "SYSTEM ERROR",
                "summary_text": f"Forensic analysis failed: {str(e)}",
                "ai_generated_score": 0,
                "authenticity_score": 0,
                "depth_score": 0,
                "inconsistencies": ["Agent Timeout"],
                "highlights": [],
                "work_depth_analysis": "Error",
                "educational_pedigree": "Error",
                "career_gaps": "Error",
                "retention_prediction": "Error"
            }