from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth_utils import get_current_user
from app.database import get_db
from app.models import User
from app.schemas import PersonaResponse
from app.services.clustering import build_user_blob, generate_persona_label, get_cluster_vectors, run_clustering, top_skills_for_cluster

router = APIRouter(prefix="/persona", tags=["persona"])


@router.get("", response_model=PersonaResponse)
def get_persona(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    users = db.query(User).all()
    skill_rows_by_user = []
    blobs = []
    for u in users:
        rows = [(us.skill.name, us.proficiency) for us in u.skills]
        skill_rows_by_user.append(rows)
        blobs.append(build_user_blob(rows))

    vectors = get_cluster_vectors(users, blobs)
    db.commit()

    labels, k = run_clustering([u.id for u in users], vectors)

    current_idx = next(i for i, u in enumerate(users) if u.id == current_user.id)
    my_cluster = labels[current_idx]
    member_indices = [i for i, lbl in enumerate(labels) if lbl == my_cluster]

    top_skills = top_skills_for_cluster(skill_rows_by_user, member_indices)
    label, description, ai_generated = generate_persona_label(top_skills, user_key=f"user:{current_user.id}")

    # distance of this user from the cluster centroid, as a simple "fit" signal
    import numpy as np

    member_vecs = np.array([vectors[i] for i in member_indices])
    centroid = member_vecs.mean(axis=0) if len(member_vecs) else np.array(vectors[current_idx])
    my_vec = np.array(vectors[current_idx])
    distance = float(np.linalg.norm(my_vec - centroid))

    return PersonaResponse(
        label=label,
        description=description,
        top_skills=top_skills,
        cluster_size=len(member_indices),
        distance=round(distance, 4),
        ai_generated=ai_generated,
    )
