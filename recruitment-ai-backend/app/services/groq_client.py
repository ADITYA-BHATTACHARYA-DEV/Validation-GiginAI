import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

class GroqAuditService:
    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    def get_analysis(self, context: str, query: str):
        prompt = f"""
        You are a highly critical Recruitment Auditor.
        Review the following candidate data: {context}
        
        Task: {query}
        
        Provide a concise, evidence-based response focusing on:
        1. Authenticity Score
        2. Technical Depth
        3. Potential Inconsistencies
        """
        
        chat_completion = self.client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama3-70b-8192",
            temperature=0.2,
        )
        return chat_completion.choices[0].message.content