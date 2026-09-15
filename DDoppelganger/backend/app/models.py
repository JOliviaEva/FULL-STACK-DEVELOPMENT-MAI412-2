import datetime
import json

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.database import Base


def utcnow():
    return datetime.datetime.utcnow()


class JSONText(Text):
    """A Text column that stores/loads JSON, kept simple for SQLite + Postgres portability."""


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), default="")
    is_seed = Column(Boolean, default=False)  # synthetic demo user used for clustering/CF
    embedding_json = Column(Text, nullable=True)  # cached skill-blob embedding for clustering
    created_at = Column(DateTime, default=utcnow)

    skills = relationship("UserSkill", back_populates="user", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="user", cascade="all, delete-orphan")
    feedback = relationship("Feedback", back_populates="user", cascade="all, delete-orphan")
    events = relationship("UserEvent", back_populates="user", cascade="all, delete-orphan")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    category = Column(String(120), default="general")

    trends = relationship("SkillTrend", back_populates="skill", cascade="all, delete-orphan")


class UserSkill(Base):
    __tablename__ = "user_skills"
    __table_args__ = (UniqueConstraint("user_id", "skill_id", name="uq_user_skill"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    proficiency = Column(Float, default=0.5)  # 0..1
    source = Column(String(50), default="resume")  # resume | quiz | manual | behavior
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="skills")
    skill = relationship("Skill")


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    provider = Column(String(120), default="")
    description = Column(Text, default="")
    level = Column(String(50), default="intermediate")
    skills_json = Column(Text, default="[]")  # list[str]
    url = Column(String(500), default="")
    embedding_json = Column(Text, nullable=True)  # cached vector, list[float] as JSON

    def skills_list(self):
        try:
            return json.loads(self.skills_json or "[]")
        except json.JSONDecodeError:
            return []


class JobPosting(Base):
    __tablename__ = "job_postings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    company = Column(String(255), default="")
    description = Column(Text, default="")
    skills_json = Column(Text, default="[]")
    posted_month = Column(String(7), default="")  # "YYYY-MM"
    source = Column(String(120), default="synthetic")

    def skills_list(self):
        try:
            return json.loads(self.skills_json or "[]")
        except json.JSONDecodeError:
            return []


class SkillTrend(Base):
    """Monthly mention-count time series per skill, used for forecasting."""

    __tablename__ = "skill_trends"
    __table_args__ = (UniqueConstraint("skill_id", "period", name="uq_skill_period"),)

    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    period = Column(String(7), nullable=False)  # "YYYY-MM"
    mention_count = Column(Integer, default=0)

    skill = relationship("Skill", back_populates="trends")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    score = Column(Float, default=0.0)
    content_score = Column(Float, default=0.0)
    collab_score = Column(Float, default=0.0)
    reason = Column(Text, default="")
    status = Column(String(20), default="pending")  # pending | accepted | rejected | completed
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="recommendations")
    course = relationship("Course")


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recommendation_id = Column(Integer, ForeignKey("recommendations.id"), nullable=False)
    action = Column(String(20), nullable=False)  # accept | reject | complete
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="feedback")


class UserEvent(Base):
    """Lightweight in-app behaviour log (search/click/view) feeding the Learn stage."""

    __tablename__ = "user_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    event_type = Column(String(50), nullable=False)  # search | view_course | view_job | quiz_result
    payload = Column(Text, default="{}")
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="events")


class PersonaCluster(Base):
    """Global cluster produced by the unsupervised persona-discovery job."""

    __tablename__ = "persona_clusters"

    id = Column(Integer, primary_key=True, index=True)
    cluster_index = Column(Integer, nullable=False)
    label = Column(String(255), default="")
    description = Column(Text, default="")
    top_skills_json = Column(Text, default="[]")
    generated_at = Column(DateTime, default=utcnow)


class UserPersona(Base):
    __tablename__ = "user_personas"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    cluster_id = Column(Integer, ForeignKey("persona_clusters.id"), nullable=False)
    distance = Column(Float, default=0.0)
    updated_at = Column(DateTime, default=utcnow)

    cluster = relationship("PersonaCluster")
