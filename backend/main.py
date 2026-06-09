from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import optimize, export

app = FastAPI(
    title="Resume Optimizer API",
    description="ATS Resume Optimization powered by Groq LLM",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(optimize.router, prefix="/api", tags=["Optimize"])
app.include_router(export.router, prefix="/api", tags=["Export"])


@app.get("/health")
def health():
    return {"status": "ok", "service": "Resume Optimizer API"}
