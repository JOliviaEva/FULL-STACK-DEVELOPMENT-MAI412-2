"""
Thin, defensive wrapper around the OpenAI SDK.

All OpenAI calls in the app go through here. This keeps the API key strictly
server-side, gives us one place to rate-limit / cost-cap, and — importantly —
lets the rest of the app degrade gracefully (instead of crashing) whenever
`OPENAI_API_KEY` is still the "xxx" placeholder or a request fails, so the
product stays demoable at every step of setup.
"""
import json
import logging
import threading
from collections import defaultdict
from datetime import date
from typing import List, Optional

from openai import OpenAI

from app.config import get_settings

logger = logging.getLogger("doppelganger.openai")
settings = get_settings()

_client: Optional[OpenAI] = None
_lock = threading.Lock()

# very small in-memory per-user-per-day call counter (see spec: "basic rate
# limiting and per-user daily token caps"). Resets naturally on restart; good
# enough for a build/demo phase guardrail.
_call_counts = defaultdict(int)
_count_lock = threading.Lock()


def _get_client() -> Optional[OpenAI]:
    global _client
    if not settings.is_ai_enabled:
        return None
    with _lock:
        if _client is None:
            _client = OpenAI(api_key=settings.openai_api_key)
    return _client


def within_daily_limit(user_key: str) -> bool:
    today = date.today().isoformat()
    key = f"{user_key}:{today}"
    with _count_lock:
        return _call_counts[key] < settings.daily_ai_call_limit


def _record_call(user_key: str):
    today = date.today().isoformat()
    key = f"{user_key}:{today}"
    with _count_lock:
        _call_counts[key] += 1


def is_ai_enabled() -> bool:
    return settings.is_ai_enabled


def chat_json(system_prompt: str, user_prompt: str, user_key: str = "system") -> Optional[dict]:
    """Call the chat model and expect a JSON object back. Returns None on any failure
    (missing key, network error, bad JSON) so callers can fall back to heuristics."""
    client = _get_client()
    if client is None or not within_daily_limit(user_key):
        return None
    try:
        resp = client.chat.completions.create(
            model=settings.openai_chat_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.3,
            max_tokens=800,
        )
        _record_call(user_key)
        content = resp.choices[0].message.content
        return json.loads(content)
    except Exception as exc:  # noqa: BLE001 - defensive by design
        logger.warning("OpenAI chat_json call failed, falling back: %s", exc)
        return None


def chat_text(system_prompt: str, user_prompt: str, user_key: str = "system") -> Optional[str]:
    client = _get_client()
    if client is None or not within_daily_limit(user_key):
        return None
    try:
        resp = client.chat.completions.create(
            model=settings.openai_chat_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.5,
            max_tokens=350,
        )
        _record_call(user_key)
        return resp.choices[0].message.content.strip()
    except Exception as exc:  # noqa: BLE001
        logger.warning("OpenAI chat_text call failed, falling back: %s", exc)
        return None


def embed_texts(texts: List[str], user_key: str = "system") -> Optional[List[List[float]]]:
    """Returns None on failure so callers fall back to the deterministic
    hashing-based pseudo-embedding in services/embeddings.py."""
    client = _get_client()
    if client is None or not texts or not within_daily_limit(user_key):
        return None
    try:
        resp = client.embeddings.create(model=settings.openai_embedding_model, input=texts)
        _record_call(user_key)
        return [item.embedding for item in resp.data]
    except Exception as exc:  # noqa: BLE001
        logger.warning("OpenAI embeddings call failed, falling back: %s", exc)
        return None
