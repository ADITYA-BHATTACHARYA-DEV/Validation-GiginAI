# import json
# from groq import Groq
# from app.core.config import settings

# class ComparisonAgent:
#     def __init__(self):
#         self.client = Groq(api_key=settings.GROQ_API_KEY)

#     def debate_candidates(self, candidate_a_context: str, candidate_b_context: str, job_description: str):
#         system_prompt = (
#             "You are an Expert Technical Recruiter. You are provided with two candidate resumes "
#             "and a Job Description. Your task is to perform a detailed comparison debate.\n\n"
#             "STRUCTURE YOUR RESPONSE IN JSON:\n"
#             "1. 'analysis': A breakdown of strengths/weaknesses for both.\n"
#             "2. 'winner': The name/ID of the candidate who fits better.\n"
#             "3. 'justification': 3 bullet points why the winner was chosen.\n"
#             "4. 'risk_comparison': Compare their retention risks."
#         )

#         user_prompt = (
#             f"JOB DESCRIPTION:\n{job_description}\n\n"
#             f"CANDIDATE A:\n{candidate_a_context}\n\n"
#             f"CANDIDATE B:\n{candidate_b_context}"
#         )

#         try:
#             response = self.client.chat.completions.create(
#                 model="llama-3.3-70b-versatile",
#                 messages=[
#                     {"role": "system", "content": system_prompt},
#                     {"role": "user", "content": user_prompt}
#                 ],
#                 response_format={"type": "json_object"}
#             )
#             return json.loads(response.choices[0].message.content)
#         except Exception as e:
#             return {"error": str(e)}


import json
from groq import Groq
from app.core.config import settings

class ComparisonAgent:
    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)

    def debate_candidates(self, context_a: str, context_b: str, job_description: str):
        """
        Performs a structured comparison debate between two candidates.
        Enforces a strict JSON schema to prevent React rendering errors.
        """
        system_prompt = (
            "You are an Expert Technical Recruiter. Compare two candidates against a Job Description (JD).\n\n"
            "STRICT JSON OUTPUT SCHEMA:\n"
            "{\n"
            "  \"winner\": \"String (ID or Name of the winner)\",\n"
            "  \"analysis\": \"String (A 2-3 sentence executive summary of the choice)\",\n"
            "  \"fit_score_a\": 0-100 (Integer),\n"
            "  \"fit_score_b\": 0-100 (Integer),\n"
            "  \"candidate_a\": {\n"
            "    \"strengths\": [\"string\"],\n"
            "    \"weaknesses\": [\"string\"]\n"
            "  },\n"
            "  \"candidate_b\": {\n"
            "    \"strengths\": [\"string\"],\n"
            "    \"weaknesses\": [\"string\"]\n"
            "  },\n"
            "  \"justification\": [\"3 specific points why the winner was chosen\"],\n"
            "  \"risk_comparison\": \"String (Comparison of their retention risks)\"\n"
            "}\n"
            "CRITICAL: The 'analysis' field must be a STRING, not an object. "
            "Use 'candidate_a' and 'candidate_b' as static keys."
        )

        user_prompt = (
            f"JOB DESCRIPTION:\n{job_description}\n\n"
            f"CANDIDATE A DATA:\n{context_a}\n\n"
            f"CANDIDATE B DATA:\n{context_b}"
        )

        try:
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.1, # Keep it strictly logical
                response_format={"type": "json_object"}
            )
            
            # Parse and return the structured JSON
            return json.loads(response.choices[0].message.content)
            
        except Exception as e:
            # Return a valid structure even on failure to prevent frontend crash
            return {
                "winner": "Error in Analysis",
                "analysis": f"Failed to perform debate: {str(e)}",
                "fit_score_a": 0,
                "fit_score_b": 0,
                "candidate_a": {"strengths": [], "weaknesses": []},
                "candidate_b": {"strengths": [], "weaknesses": []},
                "justification": ["Analysis failed"],
                "risk_comparison": "N/A"
            }