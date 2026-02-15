import json
from groq import Groq
from app.core.config import settings

class ResumeParser:
    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)

    def extract_experience(self, text_context: str):
        """Uses Groq LPU to parse text into a strictly structured JSON object."""
        
        # We explicitly ask for a root key "experience" to satisfy the 'json_object' requirement
        prompt = f"""
        Extract the work history from the following resume text. 
        Return a JSON object with a single key "experience" containing a list of jobs.
        
        Each job must have:
        - 'company': string
        - 'role': string
        - 'duration': integer (total months)
        - 'impact': float (0.1 to 1.0)

        Resume Text:
        ---
        {text_context}
        ---
        """

        try:
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": "You are a data extraction agent. Always return valid JSON with an 'experience' key."},
                    {"role": "user", "content": prompt}
                ],
                response_format={ "type": "json_object" } 
            )
            
            # Parse the string response into a Python dictionary
            raw_content = response.choices[0].message.content
            data = json.loads(raw_content)
            
            # Extract the list from the "experience" key
            experience_list = data.get("experience", [])
            
            # Basic validation to ensure we return a list for the DepthAgent
            return experience_list if isinstance(experience_list, list) else []

        except Exception as e:
            # This will now show up in your FastAPI terminal logs
            print(f"CRITICAL: ResumeParser failed: {str(e)}")
            return []