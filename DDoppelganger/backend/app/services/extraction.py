"""
NLP / entity extraction: pulls structured skills out of resume or job-posting
text. Uses GPT-4o-mini with a strict JSON schema when a key is configured;
otherwise falls back to a deterministic keyword match against SKILL_TAXONOMY
so resume upload always works, key or no key.
"""
import re
from typing import List

from app.services.openai_service import chat_json, is_ai_enabled
from app.skill_taxonomy import ALL_SKILLS, SKILL_TO_CATEGORY

SYSTEM_PROMPT = """You are a precise résumé and job-posting skill extractor for a career-development
platform. Extract the technical and professional skills, tools, and seniority signals present in the
text. Respond ONLY with a JSON object of the shape:
{"skills": [{"name": "<canonical skill name>", "proficiency": <float 0..1>, "category": "<short category>"}]}
Rules:
- Normalize skill names (e.g. "reactjs" -> "React", "py" -> "Python").
- proficiency estimates how strongly/how senior the text suggests the person is at that skill (0.3 = mentioned once, 0.9 = clear deep expertise/years of experience).
- Return at most 25 skills, most relevant first. No prose, no markdown, JSON only."""


def _keyword_fallback(text: str) -> List[dict]:
    lowered = text.lower()
    found = []
    for skill in ALL_SKILLS:
        pattern = r"(?<![a-zA-Z0-9])" + re.escape(skill.lower()).replace(r"\ ", r"[\s\-]?") + r"(?![a-zA-Z0-9])"
        matches = re.findall(pattern, lowered)
        if matches:
            proficiency = min(0.4 + 0.15 * len(matches), 0.9)
            found.append({
                "name": skill,
                "proficiency": round(proficiency, 2),
                "category": SKILL_TO_CATEGORY.get(skill, "general"),
            })
    return found[:25]


def extract_skills(text: str, user_key: str = "system") -> tuple[List[dict], bool]:
    """Returns (skills, ai_generated)."""
    if is_ai_enabled():
        result = chat_json(SYSTEM_PROMPT, text[:8000], user_key=user_key)
        if result and isinstance(result.get("skills"), list) and result["skills"]:
            cleaned = []
            for item in result["skills"]:
                name = str(item.get("name", "")).strip()
                if not name:
                    continue
                try:
                    proficiency = float(item.get("proficiency", 0.5))
                except (TypeError, ValueError):
                    proficiency = 0.5
                proficiency = max(0.0, min(1.0, proficiency))
                category = str(item.get("category") or SKILL_TO_CATEGORY.get(name, "general"))
                cleaned.append({"name": name, "proficiency": proficiency, "category": category})
            if cleaned:
                return cleaned, True
    return _keyword_fallback(text), False
