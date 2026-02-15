from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import ingest, analyze, history, chat  # Added chat import
from app.core.config import settings

# 1. INITIALIZE APP
app = FastAPI(title=settings.PROJECT_NAME, version="1.0.0")

# 2. SETUP CORS
# Essential for allowing the Next.js frontend to send POST requests to the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. INCLUDE ROUTERS
# Ensure all routers are registered under the correct API version prefix
app.include_router(ingest.router, prefix=f"{settings.API_V1_STR}/ingest", tags=["ingest"])
app.include_router(analyze.router, prefix=f"{settings.API_V1_STR}/analyze", tags=["analyze"])
app.include_router(history.router, prefix=f"{settings.API_V1_STR}/history", tags=["history"])
app.include_router(chat.router, prefix=f"{settings.API_V1_STR}/chat", tags=["chat"])  # Added Chat Router

# 4. MONITORING
@app.get("/health")
async def health_check():
    """Verify system health and list active endpoints"""
    return {
        "status": "healthy", 
        "version": "1.0.0",
        "endpoints_active": [
            f"{settings.API_V1_STR}/history", 
            f"{settings.API_V1_STR}/analyze",
            f"{settings.API_V1_STR}/chat"
        ]
    }

# 5. DIRECT UPLOAD (Fallback)
@app.post(f"{settings.API_V1_STR}/ingest/direct")
async def upload_resume_direct(file: UploadFile = File(...)):
    return {"filename": file.filename, "status": "processing"}