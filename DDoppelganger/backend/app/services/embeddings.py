"""
Embedding generation + cosine similarity.

Real embeddings come from OpenAI (text-embedding-3-small) when a valid key is
configured. When it isn't, we fall back to a deterministic hashing-trick
bag-of-words vector so similarity search still works (skill/course overlap
still produces sensible neighbours) — the app is never blocked on a key.

Each cached embedding remembers which "mode" produced it (openai | hash) so
that pasting in a real key later automatically triggers re-embedding instead
of silently comparing incompatible vectors.
"""
import hashlib
import json
import math
import re
from typing import List, Tuple

from app.services.openai_service import embed_texts, is_ai_enabled

HASH_DIM = 256
_TOKEN_RE = re.compile(r"[a-z0-9+#.]+")


def _tokenize(text: str) -> List[str]:
    return _TOKEN_RE.findall((text or "").lower())


def _hash_embedding(text: str, dim: int = HASH_DIM) -> List[float]:
    vec = [0.0] * dim
    for token in _tokenize(text):
        h = int(hashlib.md5(token.encode("utf-8")).hexdigest(), 16)
        idx = h % dim
        sign = 1.0 if (h // dim) % 2 == 0 else -1.0
        vec[idx] += sign
    norm = math.sqrt(sum(v * v for v in vec)) or 1.0
    return [v / norm for v in vec]


def current_mode() -> str:
    return "openai" if is_ai_enabled() else "hash"


def embed_text(text: str, user_key: str = "system") -> Tuple[List[float], str]:
    """Returns (vector, mode)."""
    if is_ai_enabled():
        result = embed_texts([text], user_key=user_key)
        if result:
            return result[0], "openai"
    return _hash_embedding(text), "hash"


def embed_batch(texts: List[str], user_key: str = "system") -> Tuple[List[List[float]], str]:
    if is_ai_enabled():
        result = embed_texts(texts, user_key=user_key)
        if result:
            return result, "openai"
    return [_hash_embedding(t) for t in texts], "hash"


def cosine_similarity(a: List[float], b: List[float]) -> float:
    if not a or not b or len(a) != len(b):
        return 0.0
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a)) or 1e-9
    norm_b = math.sqrt(sum(y * y for y in b)) or 1e-9
    return dot / (norm_a * norm_b)


def pack_cache(vector: List[float], mode: str) -> str:
    return json.dumps({"mode": mode, "vector": vector})


def unpack_cache(raw: str):
    """Returns (vector, mode) or (None, None) if empty/unparseable."""
    if not raw:
        return None, None
    try:
        data = json.loads(raw)
        return data.get("vector"), data.get("mode")
    except (json.JSONDecodeError, AttributeError):
        return None, None


def get_or_embed_cached(cached_raw: str, text: str, user_key: str = "system"):
    """Returns (vector, mode, changed) — `changed` tells the caller whether to
    persist a fresh cache value (either nothing was cached yet, or the mode
    the cache was built with no longer matches — e.g. a key was just added)."""
    vector, mode = unpack_cache(cached_raw)
    if vector is not None and mode == current_mode():
        return vector, mode, False
    vector, mode = embed_text(text, user_key=user_key)
    return vector, mode, True
