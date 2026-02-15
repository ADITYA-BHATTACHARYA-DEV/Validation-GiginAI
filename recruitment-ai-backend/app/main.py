from fastapi import FastAPI, UploadFile, File # Added missing imports
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import ingest, analyze
from app.core.config import settings

# 1. DEFINE THE APP FIRST
# Initializing the FastAPI instance before any method calls
app = FastAPI(title=settings.PROJECT_NAME, version="1.0.0")

# 2. SETUP MIDDLEWARE
# Configuring CORS to allow the Next.js frontend to communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. INCLUDE ROUTERS
# Including external routers for organized modular code
app.include_router(ingest.router, prefix=f"{settings.API_V1_STR}/ingest", tags=["ingest"])
app.include_router(analyze.router, prefix=f"{settings.API_V1_STR}/analyze", tags=["analyze"])

@app.get("/health")
async def health_check():
    """Health check endpoint to verify Groq LPU availability"""
    return {"status": "healthy", "provider": "Groq LPU"}

# 4. (OPTIONAL) DIRECT ENDPOINT 
# Only keep this here if you are NOT using ingest.router for the main upload
@app.post("/api/v1/ingest/direct")
async def upload_resume_direct(file: UploadFile = File(...)):
    """Placeholder for direct PDF parsing and RAG embedding"""
    return {"filename": file.filename, "status": "processing"}