"""
Personalisation & recommendation engine.

Blends:
  1. Content similarity — cosine similarity between the user's proficiency-
     weighted skill-blob embedding and each course's description+skills
     embedding (cached on the Course row, see services/embeddings.py).
  2. A lightweight collaborative-filtering signal — how often *other* users
     who share skills with this user went on to accept/complete a given
     course's recommendation.

Then explains the top matches in plain language via a RAG-style call: only
the retrieved top-k courses (not the whole catalog) are passed to GPT, to
keep cost and hallucination risk down. Falls back to a template explanation
when no key is configured or a call fails.
"""
from typing import List

from sqlalchemy.orm import Session

from app.models import Course, Recommendation, User, UserSkill, Skill, Feedback
from app.services.embeddings import cosine_similarity, get_or_embed_cached, pack_cache
from app.services.openai_service import chat_text, is_ai_enabled

CONTENT_WEIGHT = 0.7
COLLAB_WEIGHT = 0.3


def _user_skill_blob(skill_rows: List[tuple]) -> str:
    parts = []
    for name, proficiency in skill_rows:
        repeats = max(1, round(proficiency * 3))
        parts.extend([name] * repeats)
    return ", ".join(parts) if parts else "general professional skills"


def _course_text(course: Course) -> str:
    return f"{course.title}. {course.description} Skills: {', '.join(course.skills_list())}"


def _collab_score(db: Session, course_id: int, user_skill_names: set, current_user_id: int) -> float:
    if not user_skill_names:
        return 0.0
    similar_user_ids = {
        us.user_id
        for us in db.query(UserSkill)
        .join(Skill, UserSkill.skill_id == Skill.id)
        .filter(Skill.name.in_(user_skill_names))
        .all()
        if us.user_id != current_user_id
    }
    if not similar_user_ids:
        return 0.0
    recs = (
        db.query(Recommendation)
        .filter(Recommendation.course_id == course_id, Recommendation.user_id.in_(similar_user_ids))
        .all()
    )
    if not recs:
        return 0.0
    accepted = sum(1 for r in recs if r.status in ("accepted", "completed"))
    return accepted / len(recs)


def _explanation(user_email: str, top_skills: List[str], missing_skills: List[str], course: Course, user_key: str) -> tuple:
    if is_ai_enabled():
        system = (
            "You are a friendly, plain-spoken career advisor inside a skill-recommendation app. "
            "In 2 short sentences, explain to the user why THIS ONE course closes a real gap between "
            "their current skills and where the market is heading. Be specific, no generic filler, no markdown."
        )
        prompt = (
            f"User's current strong skills: {', '.join(top_skills) or 'none yet'}.\n"
            f"Skills this course would add that the user lacks: {', '.join(missing_skills) or 'reinforces existing skills'}.\n"
            f"Course: {course.title} ({course.level}) — {course.description}\n"
            "Write the explanation now."
        )
        text = chat_text(system, prompt, user_key=user_key)
        if text:
            return text, True
    if missing_skills:
        reason = (
            f"Recommended because it teaches {', '.join(missing_skills[:3])}, which you don't have yet "
            f"but pair closely with your existing strengths in {', '.join(top_skills[:2]) or 'your current stack'}."
        )
    else:
        reason = (
            f"Recommended to deepen your existing strengths in {', '.join(top_skills[:3]) or 'your field'} "
            f"toward {course.level} level."
        )
    return reason, False


def generate_recommendations(db: Session, user: User, top_n: int = 8) -> List[Recommendation]:
    skill_rows = [(us.skill.name, us.proficiency) for us in user.skills]
    user_skill_names = {name for name, _ in skill_rows}
    user_key = f"user:{user.id}"

    blob = _user_skill_blob(skill_rows)
    from app.services.embeddings import embed_text
    user_vector, _mode = embed_text(blob, user_key=user_key)

    courses = db.query(Course).all()
    scored = []
    for course in courses:
        vector, _mode, changed = get_or_embed_cached(course.embedding_json, _course_text(course), user_key="system")
        if changed:
            course.embedding_json = pack_cache(vector, _mode)
        content_score = max(0.0, cosine_similarity(user_vector, vector))
        collab = _collab_score(db, course.id, user_skill_names, user.id)
        final = CONTENT_WEIGHT * content_score + COLLAB_WEIGHT * collab
        scored.append((course, content_score, collab, final))
    db.commit()

    scored.sort(key=lambda t: t[3], reverse=True)
    top = scored[:top_n]

    top_skill_names = [n for n, _ in sorted(skill_rows, key=lambda t: t[1], reverse=True)][:5]

    results = []
    for course, content_score, collab, final in top:
        missing = [s for s in course.skills_list() if s not in user_skill_names]
        reason, ai_generated = _explanation(user.email, top_skill_names, missing, course, user_key)

        existing = (
            db.query(Recommendation)
            .filter(Recommendation.user_id == user.id, Recommendation.course_id == course.id)
            .first()
        )
        if existing:
            existing.score = final
            existing.content_score = content_score
            existing.collab_score = collab
            existing.reason = reason
            rec = existing
        else:
            rec = Recommendation(
                user_id=user.id,
                course_id=course.id,
                score=final,
                content_score=content_score,
                collab_score=collab,
                reason=reason,
                status="pending",
            )
            db.add(rec)
        rec._ai_generated = ai_generated  # transient, read by the router before serialization
        results.append(rec)

    db.commit()
    for rec in results:
        db.refresh(rec)
    return results
