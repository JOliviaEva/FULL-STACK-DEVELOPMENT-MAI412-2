"""
Central configuration for the AI Skill & Industry Trend Analyzer backend.

Everything OpenAI-related is read here, server-side only — the key is never
exposed to the frontend. If OPENAI_API_KEY is missing or still the "xxx"
placeholder, `is_ai_enabled` is False and every AI-powered service falls back
to a deterministic, non-AI heuristic so the app stays fully demoable before a
real key is pasted in.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    openai_api_key: str = "xxx"
    openai_chat_model: str = "gpt-4o-mini"
    openai_embedding_model: str = "text-embedding-3-small"

    database_url: str = "sqlite:///./doppelganger.db"

    jwt_secret_key: str = "change-this-to-a-long-random-string"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440

    daily_ai_call_limit: int = 200

    frontend_origin: str = "http://localhost:5173"

    @property
    def is_ai_enabled(self) -> bool:
        key = (self.openai_api_key or "").strip()
        return bool(key) and key.lower() != "xxx" and not key.startswith("sk-REPLACE")


@lru_cache
def get_settings() -> Settings:
    return Settings()
