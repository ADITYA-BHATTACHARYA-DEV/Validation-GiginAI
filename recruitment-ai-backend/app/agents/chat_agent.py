import json
from groq import Groq
from app.core.config import settings

class ResumeChatAgent:
    def __init__(self):
        # Initializing Groq client with settings-validated key
        self.client = Groq(api_key=settings.GROQ_API_KEY)

    def answer_query(self, query: str, context: str, history: list = []):
        """
        Answers queries strictly based on the provided context.
        Handles both individual resumes and multi-candidate comparison results.
        """
        
        # System prompt now handles both granular resume data and high-level audit results
        system_prompt = (
            "You are a Senior Talent Strategy Consultant and AI Recruitment Assistant. "
            "Analyze the provided context (which may be a single resume or an audit of multiple candidates) "
            "and answer the user's question with architectural precision.\n\n"
            "STRICT OPERATIONAL RULES:\n"
            "1. GROUNDING: Use ONLY the provided context. If information is missing, state it clearly.\n"
            "2. COMPARISON LOGIC: If the context contains a leaderboard, explain rankings by comparing fit_scores and stability metrics.\n"
            "3. INTERVIEW PREP: If asked for questions, tailor them to the specific 'missing_skills' or 'tenure_risks' found.\n"
            "4. OUTPUT FORMAT: You MUST return a JSON object with two keys:\n"
            "   - 'answer': Your detailed, insightful response (No markdown symbols like * or #).\n"
            "   - 'citation': A direct quote or data point from the context supporting your answer."
        )

        # Prepare the conversation chain
        messages = [{"role": "system", "content": system_prompt}]
        
        # history should be a list of {'role': '...', 'content': '...'}
        # We take the last 6 messages to keep the context window focused
        messages.extend(history[-6:])
        
        # Add context-augmented user prompt
        messages.append({
            "role": "user", 
            "content": f"CONTEXT DATA:\n---\n{context}\n---\n\nUSER QUESTION: {query}"
        })

        try:
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages,
                temperature=0.2,  # Slightly higher for consultant-style reasoning
                response_format={"type": "json_object"} 
            )
            
            # Parse the string content into a dictionary
            content_str = response.choices[0].message.content
            return json.loads(content_str)
            
        except Exception as e:
            import traceback
            print(f"AGENT_QUERY_ERROR: {traceback.format_exc()}")
            return {
                "answer": f"Consultant Error: My reasoning engine encountered an issue: {str(e)}",
                "citation": None
            }