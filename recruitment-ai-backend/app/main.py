from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import ingest, analyze, history, chat, compare 
from app.core.config import settings

# 1. INITIALIZE APP
app = FastAPI(
    title=settings.PROJECT_NAME, 
    version="1.0.0",
    description="AI-Powered Talent Battle Royale & Forensic Resume Auditor"
)

# 2. SETUP CORS
# Essential for allowing the Next.js frontend (localhost:3000) to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. INCLUDE ROUTERS
# Using versioned prefixes from settings.API_V1_STR (usually "/api/v1")
app.include_router(ingest.router, prefix=f"{settings.API_V1_STR}/ingest", tags=["ingest"])
app.include_router(analyze.router, prefix=f"{settings.API_V1_STR}/analyze", tags=["analyze"])
app.include_router(history.router, prefix=f"{settings.API_V1_STR}/history", tags=["history"])
app.include_router(chat.router, prefix=f"{settings.API_V1_STR}/chat", tags=["chat"])
app.include_router(compare.router, prefix=f"{settings.API_V1_STR}/compare", tags=["compare"])

# 4. MONITORING
@app.get("/health")
async def health_check():
    """Verify system health and list active endpoints."""
    return {
        "status": "healthy", 
        "version": "1.0.0",
        "active_modules": ["Ingest", "Analyze", "History", "Chat", "Compare"],
        "api_prefix": settings.API_V1_STR
    }

# 5. FALLBACKS / DIRECT HANDLERS
@app.post(f"{settings.API_V1_STR}/ingest/direct")
async def upload_resume_direct(file: UploadFile = File(...)):
    """Fallback handler for direct multi-part uploads."""
    return {"filename": file.filename, "status": "processing"}