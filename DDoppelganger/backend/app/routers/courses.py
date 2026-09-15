from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth_utils import get_current_user
from app.database import get_db
from app.models import Course, User
from app.schemas import CourseOut

router = APIRouter(prefix="/courses", tags=["courses"])


@router.get("", response_model=list[CourseOut])
def list_courses(db: Session = Depends(get_db), _current_user: User = Depends(get_current_user)):
    courses = db.query(Course).all()
    return [
        CourseOut(
            id=c.id, title=c.title, provider=c.provider, description=c.description,
            level=c.level, skills=c.skills_list(), url=c.url,
        )
        for c in courses
    ]
