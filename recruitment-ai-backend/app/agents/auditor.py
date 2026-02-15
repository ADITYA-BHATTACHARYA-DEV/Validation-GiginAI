import os
from dotenv import load_dotenv
load_dotenv() # Explicitly loads variables from the .env file
from groq import Groq
from app.core.config import settings # Use centralized settings for reliability
from app.services.rag_engine import RAGEngine

class ResumeAuditor:
    def __init__(self):
        # Initializing Groq client using validated API key
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        self.rag = RAGEngine()

    def run_full_audit(self, candidate_id: str):
        """
        Coordinates RAG retrieval and Groq inference to generate a resume audit.
        """
        # 1. Retrieve the text for this specific candidate
        context = self.rag.get_full_context(candidate_id)
        
        if not context:
            return "Audit Error: No context retrieved for candidate. Please ensure the PDF was indexed."

        # 2. Execute Groq Inference with a specialized Auditor Persona
        try:
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {
                        "role": "system", 
                        "content": (
                            "You are a specialized Recruitment AI Auditor. Your goal is to find "
                            "inconsistencies, inflated claims, and AI-generated phrasing in resumes. "
                            "Be critical, professional, and highlight specific red flags."
                        )
                    },
                    {
                        "role": "user", 
                        "content": f"Analyze this resume content for authenticity and depth:\n\n{context}"
                    }
                ],
                temperature=0.2 # Lower temperature for more factual, consistent audits
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"AI Generation Failed: {str(e)}"