from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Core API Keys
    GROQ_API_KEY: str
    
    # System Paths
    VECTOR_DB_PATH: str = "./data/vector_db"
    UPLOAD_DIR: str = "./data/uploads"
    
    # --- ADD THESE MISSING FIELDS ---
    DATABASE_URL: str = "sqlite:///./recruitment.db"
    SECRET_KEY: str
    
    # API Settings
    PROJECT_NAME: str = "RecruitAI Auditor"
    API_V1_STR: str = "/api/v1"

    class Config:
        env_file = ".env"
        # Optional: allows extra environment variables without crashing
        extra = "ignore" 

settings = Settings()