import json
from groq import Groq
from app.core.config import settings

class ResumeChatAgent:
    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)

    def answer_query(self, query: str, context: str, history: list = []):
        """
        Answers queries strictly based on the provided resume context 
        with specific source citations.
        """
        
        # System prompt now demands a JSON structure for grounding
        system_prompt = (
            "You are an AI Recruitment Assistant. Analyze the provided resume context "
            "and answer the user's question accurately. "
            "STRICT RULES:\n"
            "1. Only use the provided resume text.\n"
            "2. If the info is missing, state that it's not mentioned.\n"
            "3. You MUST return a JSON object with two keys:\n"
            "   - 'answer': Your detailed response.\n"
            "   - 'citation': A direct, exact quote from the resume that supports your answer."
        )

        # Prepare the conversation chain
        messages = [{"role": "system", "content": system_prompt}]
        
        # history should be a list of {'role': '...', 'content': '...'}
        messages.extend(history)
        
        # Add context-augmented user prompt
        messages.append({
            "role": "user", 
            "content": f"RESUME CONTEXT:\n---\n{context}\n---\n\nUSER QUESTION: {query}"
        })

        try:
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages,
                temperature=0.1,  # Lowered for higher precision in citations
                response_format={"type": "json_object"} # Forces JSON output
            )
            
            # Parse the string content into a dictionary
            content_str = response.choices[0].message.content
            return json.loads(content_str)
            
        except Exception as e:
            return {
                "answer": f"Agent Error: {str(e)}",
                "citation": None
            }