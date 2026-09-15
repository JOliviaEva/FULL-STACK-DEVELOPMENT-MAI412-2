from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth_utils import get_current_user
from app.database import get_db
from app.models import Skill, SkillTrend, User, UserSkill
from app.schemas import DecayScoreResponse, SkillTrendOut, SkillTrendPoint, TrendsResponse
from app.services.forecasting import compute_decay_score, compute_trend
from app.services.openai_service import chat_text, is_ai_enabled

router = APIRouter(prefix="/trends", tags=["trends"])


def _all_trend_results(db: Session):
    skills = db.query(Skill).all()
    results = []
    for skill in skills:
        rows = (
            db.query(SkillTrend)
            .filter(SkillTrend.skill_id == skill.id)
            .order_by(SkillTrend.period.asc())
            .all()
        )
        if not rows:
            continue
        history = [(r.period, r.mention_count) for r in rows]
        results.append((skill, compute_trend(skill.name, skill.category, history)))
    return results


@router.get("", response_model=TrendsResponse)
def get_trends(db: Session = Depends(get_db), _current_user: User = Depends(get_current_user)):
    results = _all_trend_results(db)

    def to_out(skill, trend):
        return SkillTrendOut(
            skill=skill.name,
            category=skill.category,
            history=[SkillTrendPoint(period=p, mention_count=c) for p, c in trend.history],
            slope=round(trend.slope, 3),
            direction=trend.direction,
            forecast_next=round(trend.forecast_next, 1),
        )

    rising = sorted(
        [(s, t) for s, t in results if t.direction == "rising"], key=lambda st: st[1].slope, reverse=True
    )[:8]
    declining = sorted(
        [(s, t) for s, t in results if t.direction == "declining"], key=lambda st: st[1].slope
    )[:8]

    return TrendsResponse(
        rising=[to_out(s, t) for s, t in rising],
        declining=[to_out(s, t) for s, t in declining],
    )


@router.get("/decay-score", response_model=DecayScoreResponse)
def get_decay_score(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    results = {s.id: t for s, t in _all_trend_results(db)}
    user_skills = db.query(UserSkill).filter(UserSkill.user_id == current_user.id).all()

    triples = []
    for us in user_skills:
        trend = results.get(us.skill_id)
        if trend is not None:
            triples.append((us.skill.name, us.proficiency, trend))

    outcome = compute_decay_score(triples)
    risk_score = outcome["risk_score"]

    if risk_score >= 60:
        label = "High risk — act soon"
    elif risk_score >= 30:
        label = "Moderate risk — worth planning for"
    else:
        label = "Low risk — well positioned"

    explanation, ai_generated = None, False
    if is_ai_enabled() and triples:
        system = (
            "You are a supportive career advisor. In 2 sentences, plain language, no markdown, explain "
            "what this skill-obsolescence risk score means for the user and what kind of action would help most."
        )
        prompt = (
            f"Risk score: {risk_score}/100 ({label}).\n"
            f"Skills trending down that the user relies on: {', '.join(outcome['at_risk']) or 'none'}.\n"
            f"Skills the user has that are trending up: {', '.join(outcome['future_proof']) or 'none'}."
        )
        text = chat_text(system, prompt, user_key=f"user:{current_user.id}")
        if text:
            explanation, ai_generated = text, True

    if explanation is None:
        if outcome["at_risk"]:
            explanation = (
                f"{len(outcome['at_risk'])} of your skills ({', '.join(outcome['at_risk'][:3])}) are trending "
                f"down in job postings. Balancing them with rising skills would lower your risk."
            )
        else:
            explanation = "Your current skills are holding steady or trending up in the market — nice position to be in."

    return DecayScoreResponse(
        risk_score=risk_score,
        risk_label=label,
        at_risk_skills=outcome["at_risk"],
        future_proof_skills=outcome["future_proof"],
        explanation=explanation,
        ai_generated=ai_generated,
    )
