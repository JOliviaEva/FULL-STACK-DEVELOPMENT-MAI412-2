from collections import defaultdict

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth_utils import get_current_user
from app.database import get_db
from app.models import Skill, User, UserSkill
from app.schemas import ManualSkillRequest, SkillOut, SkillProfileResponse
from app.skill_taxonomy import SKILL_TO_CATEGORY

router = APIRouter(prefix="/skills", tags=["skills"])


@router.get("/profile", response_model=SkillProfileResponse)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(UserSkill).filter(UserSkill.user_id == current_user.id).all()
    skills = [
        SkillOut(
            name=r.skill.name,
            category=r.skill.category or SKILL_TO_CATEGORY.get(r.skill.name, "general"),
            proficiency=r.proficiency,
            source=r.source,
        )
        for r in rows
    ]
    cat_totals = defaultdict(list)
    for s in skills:
        cat_totals[s.category].append(s.proficiency)
    categories = {cat: round(sum(vals) / len(vals), 2) for cat, vals in cat_totals.items()}
    return SkillProfileResponse(skills=skills, categories=categories)


@router.post("/manual", response_model=SkillOut)
def add_manual_skill(
    payload: ManualSkillRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    name = payload.skill_name.strip()
    skill = db.query(Skill).filter(Skill.name.ilike(name)).first()
    if not skill:
        skill = Skill(name=name, category=SKILL_TO_CATEGORY.get(name, "general"))
        db.add(skill)
        db.flush()
    user_skill = (
        db.query(UserSkill).filter(UserSkill.user_id == current_user.id, UserSkill.skill_id == skill.id).first()
    )
    if user_skill:
        user_skill.proficiency = payload.proficiency
        user_skill.source = "manual"
    else:
        user_skill = UserSkill(
            user_id=current_user.id, skill_id=skill.id, proficiency=payload.proficiency, source="manual"
        )
        db.add(user_skill)
    db.commit()
    return SkillOut(name=skill.name, category=skill.category, proficiency=user_skill.proficiency, source="manual")


@router.delete("/{skill_name}")
def remove_skill(skill_name: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    skill = db.query(Skill).filter(Skill.name.ilike(skill_name)).first()
    if skill:
        db.query(UserSkill).filter(UserSkill.user_id == current_user.id, UserSkill.skill_id == skill.id).delete()
        db.commit()
    return {"ok": True}
