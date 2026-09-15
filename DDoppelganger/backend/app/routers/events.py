import json

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth_utils import get_current_user
from app.database import get_db
from app.models import User, UserEvent
from app.schemas import EventRequest

router = APIRouter(prefix="/events", tags=["events"])


@router.post("")
def log_event(
    payload: EventRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Captures in-app behaviour (search, course view, job view, quiz result) —
    the raw material for the 'Learn' stage of the doppelgänger loop."""
    db.add(
        UserEvent(
            user_id=current_user.id,
            event_type=payload.event_type,
            payload=json.dumps(payload.payload)[:2000],
        )
    )
    db.commit()
    return {"ok": True}
