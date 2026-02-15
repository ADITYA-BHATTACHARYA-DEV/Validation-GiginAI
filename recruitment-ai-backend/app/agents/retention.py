# from groq import Groq
# from app.core.config import settings
# from app.services.rag_engine import RAGEngine

# class RetentionPredictor:
#     def __init__(self):
#         self.client = Groq(api_key=settings.GROQ_API_KEY) #
#         self.rag = RAGEngine()

#     def predict_stability(self, candidate_id: str):
#         """Analyzes job tenure and transition patterns using Groq LPU."""
#         context = self.rag.get_full_context(candidate_id) #
        
#         if not context:
#             return "Medium" # Default risk if no data found

#         prompt = f"""
#         Analyze the following career history for retention risk:
#         ---
#         {context}
#         ---
#         Task:
#         1. Calculate the average tenure (in months) per role.
#         2. Identify if recent moves were 'vertical' (promotion) or 'lateral' (same role).
#         3. Output ONLY one word: 'Low', 'Medium', or 'High' based on their flight risk.
#         """

#         try:
#             response = self.client.chat.completions.create(
#                 model="llama-3.3-70b-versatile",
#                 messages=[{"role": "user", "content": prompt}],
#                 temperature=0.1 # Low temperature for classification tasks
#             )
#             return response.choices[0].message.content.strip()
#         except Exception:
#             return "Medium"



import json
from groq import Groq
from app.core.config import settings
from app.services.rag_engine import RAGEngine

class RetentionPredictor:
    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        self.rag = RAGEngine()

    def predict_stability(self, candidate_id: str):
        """Analyzes tenure patterns and returns structured risk data."""
        context = self.rag.get_full_context(candidate_id)
        
        if not context:
            return {"risk_level": "Medium", "stability_percentage": 50, "reasoning": "No data found."}

        system_prompt = (
            "You are a talent stability analyst. Analyze the career history and return a JSON object "
            "with exactly three keys: 'risk_level' (Low/Medium/High), 'stability_percentage' (0-100), "
            "and 'reasoning' (a brief 1-sentence explanation)."
        )

        user_prompt = f"Analyze this resume context for retention risk:\n---\n{context}\n---"

        try:
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.0,
                response_format={"type": "json_object"}
            )
            
            return json.loads(response.choices[0].message.content)
            
        except Exception as e:
            print(f"Retention API Error: {e}")
            return {"risk_level": "Medium", "stability_percentage": 50, "reasoning": "Analysis failed."}