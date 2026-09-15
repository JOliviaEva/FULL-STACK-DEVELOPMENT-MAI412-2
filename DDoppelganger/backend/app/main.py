from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import Base, engine
from app.routers import auth, clusters, courses, events, recommendations, resume, skills, trends

settings = get_settings()

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Skill & Industry Trend Analyzer",
    description="Digital Doppelgänger for career development — Learn, Understand, Predict, Recommend, Adapt.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin, "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(resume.router)
app.include_router(skills.router)
app.include_router(courses.router)
app.include_router(recommendations.router)
app.include_router(trends.router)
app.include_router(clusters.router)
app.include_router(events.router)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "ai_enabled": settings.is_ai_enabled,
        "note": (
            "Live OpenAI calls active."
            if settings.is_ai_enabled
            else "Running on deterministic fallbacks — paste a real OPENAI_API_KEY into backend/.env to enable live AI."
        ),
    }
