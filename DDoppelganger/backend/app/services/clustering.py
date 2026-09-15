"""
Unsupervised "strange insight" persona discovery.

Runs k-means over every user's skill-embedding vector (their skills joined
into one text blob, proficiency-weighted) to surface latent skill personas
nobody explicitly labelled — the required non-trivial, data-derived insight
from the brief, as opposed to a hand-coded "if skill X missing -> recommend Y"
rule.

Needs a handful of users to form meaningful clusters, so `seed_data.py`
populates a pool of synthetic demo users; the signed-in user is clustered
alongside them.
"""
from collections import Counter
from typing import Dict, List, Tuple

import numpy as np
from sklearn.cluster import KMeans

from app.services.embeddings import embed_batch, get_or_embed_cached, pack_cache
from app.services.openai_service import chat_text, is_ai_enabled

MIN_USERS_FOR_CLUSTERING = 4
MAX_CLUSTERS = 5


def build_user_blob(skill_rows: List[Tuple[str, float]]) -> str:
    """skill_rows: list of (skill_name, proficiency). Repeats higher-proficiency
    skills so they weigh more in the bag-of-words-ish embedding."""
    parts = []
    for name, proficiency in skill_rows:
        repeats = max(1, round(proficiency * 3))
        parts.extend([name] * repeats)
    return ", ".join(parts) if parts else "no skills yet"


def choose_k(n_users: int) -> int:
    if n_users < MIN_USERS_FOR_CLUSTERING:
        return 1
    return max(2, min(MAX_CLUSTERS, n_users // 4))


def get_cluster_vectors(users: List, blobs: List[str]) -> List[List[float]]:
    """Reuses each user's cached skill-blob embedding where still valid (same
    embedding mode), and batch-embeds only the users that need a fresh one —
    caches results in the vector store (User.embedding_json) instead of
    recomputing per request. Caller is responsible for db.commit()."""
    vectors: List[List[float]] = [None] * len(users)
    to_embed_idx, to_embed_text = [], []

    for i, (user, blob) in enumerate(zip(users, blobs)):
        vector, mode, changed = get_or_embed_cached(user.embedding_json, blob, user_key="clustering")
        if not changed:
            vectors[i] = vector
        else:
            to_embed_idx.append(i)
            to_embed_text.append(blob)

    if to_embed_text:
        fresh_vectors, mode = embed_batch(to_embed_text, user_key="clustering")
        for idx, vec in zip(to_embed_idx, fresh_vectors):
            vectors[idx] = vec
            users[idx].embedding_json = pack_cache(vec, mode)

    return vectors


def run_clustering(user_ids: List[int], vectors: List[List[float]]) -> Tuple[np.ndarray, int]:
    """Returns (labels array, k) from already-embedded vectors."""
    X = np.array(vectors)
    k = choose_k(len(user_ids))
    if k <= 1:
        return np.zeros(len(user_ids), dtype=int), 1
    model = KMeans(n_clusters=k, n_init=10, random_state=42)
    labels = model.fit_predict(X)
    return labels, k


def top_skills_for_cluster(all_skill_rows: List[List[Tuple[str, float]]], member_indices: List[int], top_n: int = 6) -> List[str]:
    counter = Counter()
    for idx in member_indices:
        for name, proficiency in all_skill_rows[idx]:
            counter[name] += proficiency
    return [name for name, _ in counter.most_common(top_n)]


def generate_persona_label(top_skills: List[str], user_key: str = "system") -> Tuple[str, str, bool]:
    """Returns (label, description, ai_generated)."""
    if is_ai_enabled() and top_skills:
        system = (
            "You are a career-trend analyst. Given a cluster of co-occurring professional "
            "skills, invent a short, evocative persona title (3-5 words, title case, no quotes) "
            "that this emerging role could be called before it becomes a common job title, plus a "
            "2-sentence plain-English description of what makes this persona distinct and why it "
            "matters for their career trajectory. Respond as plain text in the form:\nTITLE: <title>\nDESC: <description>"
        )
        user_prompt = "Co-occurring skills: " + ", ".join(top_skills)
        text = chat_text(system, user_prompt, user_key=user_key)
        if text:
            title, desc = "", ""
            for line in text.splitlines():
                if line.upper().startswith("TITLE:"):
                    title = line.split(":", 1)[1].strip()
                elif line.upper().startswith("DESC:"):
                    desc = line.split(":", 1)[1].strip()
            if title:
                return title, desc or text, True

    # Deterministic fallback: compose a persona name from the top 2 skills.
    if not top_skills:
        return "Emerging Generalist", "Not enough skill data yet to detect a distinct persona.", False
    anchor = top_skills[0]
    secondary = top_skills[1] if len(top_skills) > 1 else "Cross-Functional"
    label = f"{anchor}-Driven {secondary} Specialist"
    description = (
        f"Your skill pattern clusters most strongly around {', '.join(top_skills[:4])}. "
        f"That combination doesn't map cleanly onto one traditional job title yet, which is "
        f"often an early signal of where the market is heading."
    )
    return label, description, False
