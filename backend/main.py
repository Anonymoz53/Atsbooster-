import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import optimize, export

app = FastAPI(
    title="Resume Optimizer API",
    description="ATS Resume Optimization powered by Groq LLM",
    version="1.0.0",
)

# Allow all origins by default (for Vercel/Render deployment).
# Set ALLOWED_ORIGINS env var to restrict in production e.g. "https://myapp.vercel.app"
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
allowed_origins = allowed_origins_env.split(",") if allowed_origins_env != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(optimize.router, prefix="/api", tags=["Optimize"])
app.include_router(export.router, prefix="/api", tags=["Export"])


@app.get("/health")
def health():
    return {"status": "ok", "service": "Resume Optimizer API"}
