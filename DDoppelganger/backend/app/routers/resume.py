import io

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.auth_utils import get_current_user
from app.database import get_db
from app.models import Skill, User, UserEvent, UserSkill
from app.schemas import ExtractionResult, ResumeTextRequest
from app.services.extraction import extract_skills

router = APIRouter(prefix="/resume", tags=["resume"])


def _upsert_skills(db: Session, user: User, skills: list[dict], source: str):
    for item in skills:
        name = item["name"].strip()
        if not name:
            continue
        skill = db.query(Skill).filter(Skill.name.ilike(name)).first()
        if not skill:
            skill = Skill(name=name, category=item.get("category", "general"))
            db.add(skill)
            db.flush()
        user_skill = (
            db.query(UserSkill)
            .filter(UserSkill.user_id == user.id, UserSkill.skill_id == skill.id)
            .first()
        )
        proficiency = float(item.get("proficiency", 0.5))
        if user_skill:
            user_skill.proficiency = max(user_skill.proficiency, proficiency)
            user_skill.source = source
        else:
            db.add(UserSkill(user_id=user.id, skill_id=skill.id, proficiency=proficiency, source=source))
    db.add(UserEvent(user_id=user.id, event_type="resume_upload", payload=f'{{"skills_found": {len(skills)}}}'))
    db.commit()


@router.post("/upload-text", response_model=ExtractionResult)
def upload_resume_text(
    payload: ResumeTextRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    skills, ai_generated = extract_skills(payload.resume_text, user_key=f"user:{current_user.id}")
    if not skills:
        raise HTTPException(status_code=422, detail="Could not detect any recognizable skills in that text.")
    _upsert_skills(db, current_user, skills, source="resume")
    return ExtractionResult(skills=skills, ai_generated=ai_generated)


@router.post("/upload-file", response_model=ExtractionResult)
async def upload_resume_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    raw = await file.read()
    text = ""
    if file.filename.lower().endswith(".pdf"):
        try:
            from pypdf import PdfReader

            reader = PdfReader(io.BytesIO(raw))
            text = "\n".join((page.extract_text() or "") for page in reader.pages)
        except Exception as exc:  # noqa: BLE001
            raise HTTPException(status_code=400, detail=f"Could not read PDF: {exc}") from exc
    else:
        try:
            text = raw.decode("utf-8", errors="ignore")
        except Exception as exc:  # noqa: BLE001
            raise HTTPException(status_code=400, detail=f"Could not read file: {exc}") from exc

    if len(text.strip()) < 20:
        raise HTTPException(status_code=422, detail="That file didn't contain enough readable text.")

    skills, ai_generated = extract_skills(text, user_key=f"user:{current_user.id}")
    if not skills:
        raise HTTPException(status_code=422, detail="Could not detect any recognizable skills in that file.")
    _upsert_skills(db, current_user, skills, source="resume")
    return ExtractionResult(skills=skills, ai_generated=ai_generated)
