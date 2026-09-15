import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


# ---------- Auth ----------

class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: str = ""


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True


# ---------- Skills ----------

class SkillOut(BaseModel):
    name: str
    category: str
    proficiency: float
    source: str

    class Config:
        from_attributes = True


class SkillProfileResponse(BaseModel):
    skills: List[SkillOut]
    categories: dict  # category -> avg proficiency, for the radar chart


class ManualSkillRequest(BaseModel):
    skill_name: str
    proficiency: float = 0.6


class ResumeTextRequest(BaseModel):
    resume_text: str = Field(min_length=20)


class ExtractionResult(BaseModel):
    skills: List[dict]
    ai_generated: bool


# ---------- Courses / Recommendations ----------

class CourseOut(BaseModel):
    id: int
    title: str
    provider: str
    description: str
    level: str
    skills: List[str]
    url: str

    class Config:
        from_attributes = True


class RecommendationOut(BaseModel):
    id: int
    course: CourseOut
    score: float
    content_score: float
    collab_score: float
    reason: str
    status: str
    ai_generated: bool

    class Config:
        from_attributes = True


class FeedbackRequest(BaseModel):
    action: str = Field(pattern="^(accept|reject|complete)$")


# ---------- Trends ----------

class SkillTrendPoint(BaseModel):
    period: str
    mention_count: int


class SkillTrendOut(BaseModel):
    skill: str
    category: str
    history: List[SkillTrendPoint]
    slope: float
    direction: str  # rising | declining | stable
    forecast_next: float


class TrendsResponse(BaseModel):
    rising: List[SkillTrendOut]
    declining: List[SkillTrendOut]


class DecayScoreResponse(BaseModel):
    risk_score: float  # 0..100
    risk_label: str
    at_risk_skills: List[str]
    future_proof_skills: List[str]
    explanation: str
    ai_generated: bool


# ---------- Persona ----------

class PersonaResponse(BaseModel):
    label: str
    description: str
    top_skills: List[str]
    cluster_size: int
    distance: float
    ai_generated: bool


# ---------- Events ----------

class EventRequest(BaseModel):
    event_type: str
    payload: dict = {}
