import json
from groq import Groq
from app.core.config import settings

class ComparisonAgent:
    def __init__(self):
        # Initializing Groq client with settings-validated key
        self.client = Groq(api_key=settings.GROQ_API_KEY)

    def compare_multiple_candidates(self, candidates_data: list, job_description: str, mode: str = "forensic"):
        """
        Performs a multi-profile comparison with dynamic strictness.
        Includes specific metrics for retention stability and individual rationales.
        """
        # 1. Map valid IDs to prevent AI hallucinations
        valid_ids = [c['id'] for c in candidates_data]
        
        profiles_block = ""
        for idx, c in enumerate(candidates_data):
            profiles_block += f"[[ START PROFILE {idx + 1} - ID: {c['id']} ]]\n{c['context']}\n[[ END PROFILE {idx + 1} ]]\n\n"

        # Define Persona Logic
        personas = {
            "forensic": (
                "You are a SKEPTICAL FORENSIC AUDITOR. DISQUALIFY candidates who lack proof. "
                "Critically evaluate tenure history for flight risks and job-hopping. "
                "Penalize heavily for missing JD keywords and significant career gaps."
            ),
            "helpful": (
                "You are a HELPFUL RECRUITER. Find potential and transferable skills. "
                "Look for adjacent experience that fits the JD. Focus on growth potential "
                "and explain how career transitions might benefit the role."
            )
        }

        system_prompt = (
            f"{personas.get(mode, personas['forensic'])}\n\n"
            f"STRICT INVENTORY: You are analyzing exactly {len(valid_ids)} candidates. "
            f"Only use these IDs: {', '.join(valid_ids)}.\n\n"
            "STRICT OPERATIONAL RULES:\n"
            "1. IDENTIFICATION: Extract the FULL NAME for each candidate from their context.\n"
            "2. RETENTION AUDIT: Calculate a 'retention_score' (0-100) and provide a 'retention_rationale' "
            "explaining the score based on tenure length, frequency of job changes, and career gaps.\n"
            "3. THRESHOLD: If NO candidate scores >= 50% in fit_score, set 'winner_id' to 'NONE'.\n"
            "4. NO SYMBOLS: Do not use * or # in string values.\n\n"
            "STRICT JSON OUTPUT SCHEMA:\n"
            "{\n"
            "  \"winner_id\": \"String (ID or 'NONE')\",\n"
            "  \"status\": \"String ('SUCCESS' or 'NO_SUITABLE_MATCH')\",\n"
            "  \"executive_summary\": \"String\",\n"
            "  \"leaderboard\": [\n"
            "    {\n"
            "      \"id\": \"String (Must match provided ID)\",\n"
            "      \"candidate_name\": \"String\",\n"
            "      \"rank\": Integer,\n"
            "      \"fit_score\": Integer (0-100),\n"
            "      \"retention_score\": Integer (0-100),\n"
            "      \"tenure_risk\": \"String (Low/Medium/High)\",\n"
            "      \"retention_rationale\": \"String (Detailed reason for the stability score)\",\n"
            "      \"missing_skills\": [\"string\"],\n"
            "      \"verified_strengths\": [\"string\"],\n"
            "      \"verdict\": \"String\"\n"
            "    }\n"
            "  ],\n"
            "  \"justification\": [\"3 points why the winner won\"],\n"
            "  \"risk_comparison\": \"String (Overall group risk summary)\"\n"
            "}"
        )

        try:
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"JD:\n{job_description}\n\nDataset:\n{profiles_block}"}
                ],
                temperature=0.0 if mode == "forensic" else 0.3, 
                # response_format used to ensure JSON structure
                response_format={"type": "json_object"}
            )
            
            parsed_data = json.loads(response.choices[0].message.content)

            # 2. RECTIFICATION: Post-process to fix AI Hallucinations & Looping
            if "leaderboard" in parsed_data:
                # Filter out any candidates the AI invented or duplicated
                parsed_data["leaderboard"] = [c for c in parsed_data["leaderboard"] if c["id"] in valid_ids]
                
                # Re-sort to ensure rank matches fit_score
                parsed_data["leaderboard"].sort(key=lambda x: x.get("fit_score", 0), reverse=True)
                for i, c in enumerate(parsed_data["leaderboard"]):
                    c["rank"] = i + 1

                # Fix winner_id hallucination
                if parsed_data.get("winner_id") not in valid_ids and parsed_data.get("winner_id") != "NONE":
                    if parsed_data["leaderboard"] and parsed_data["leaderboard"][0]["fit_score"] >= 50:
                        parsed_data["winner_id"] = parsed_data["leaderboard"][0]["id"]
                    else:
                        parsed_data["winner_id"] = "NONE"

            return parsed_data
            
        except Exception as e:
            import traceback
            print(f"COMPARISON_AGENT_ERROR: {traceback.format_exc()}")
            return {
                "winner_id": "NONE",
                "status": "ERROR",
                "executive_summary": f"System error: {str(e)}",
                "leaderboard": [],
                "justification": [],
                "risk_comparison": "N/A"
            }