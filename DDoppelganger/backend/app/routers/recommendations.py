from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth_utils import get_current_user
from app.database import get_db
from app.models import Feedback, Recommendation, User
from app.schemas import CourseOut, FeedbackRequest, RecommendationOut
from app.services.openai_service import is_ai_enabled
from app.services.recommender import generate_recommendations

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


def _to_out(rec: Recommendation) -> RecommendationOut:
    c = rec.course
    return RecommendationOut(
        id=rec.id,
        course=CourseOut(
            id=c.id, title=c.title, provider=c.provider, description=c.description,
            level=c.level, skills=c.skills_list(), url=c.url,
        ),
        score=round(rec.score, 4),
        content_score=round(rec.content_score, 4),
        collab_score=round(rec.collab_score, 4),
        reason=rec.reason,
        status=rec.status,
        ai_generated=getattr(rec, "_ai_generated", is_ai_enabled()),
    )


@router.get("", response_model=list[RecommendationOut])
def get_recommendations(
    refresh: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.skills and not refresh:
        return []
    existing = (
        db.query(Recommendation)
        .filter(Recommendation.user_id == current_user.id)
        .order_by(Recommendation.score.desc())
        .all()
    )
    if existing and not refresh:
        return [_to_out(r) for r in existing]

    recs = generate_recommendations(db, current_user)
    recs.sort(key=lambda r: r.score, reverse=True)
    return [_to_out(r) for r in recs]


@router.post("/{recommendation_id}/feedback", response_model=RecommendationOut)
def give_feedback(
    recommendation_id: int,
    payload: FeedbackRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rec = (
        db.query(Recommendation)
        .filter(Recommendation.id == recommendation_id, Recommendation.user_id == current_user.id)
        .first()
    )
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found.")

    status_map = {"accept": "accepted", "reject": "rejected", "complete": "completed"}
    rec.status = status_map[payload.action]
    db.add(Feedback(user_id=current_user.id, recommendation_id=rec.id, action=payload.action))

    # Adapt: a completed course folds straight back into the user's skill profile.
    if payload.action == "complete":
        from app.models import Skill, UserSkill

        for skill_name in rec.course.skills_list():
            skill = db.query(Skill).filter(Skill.name.ilike(skill_name)).first()
            if not skill:
                continue
            us = (
                db.query(UserSkill)
                .filter(UserSkill.user_id == current_user.id, UserSkill.skill_id == skill.id)
                .first()
            )
            if us:
                us.proficiency = min(1.0, us.proficiency + 0.2)
            else:
                db.add(UserSkill(user_id=current_user.id, skill_id=skill.id, proficiency=0.55, source="course"))

    db.commit()
    db.refresh(rec)
    return _to_out(rec)
