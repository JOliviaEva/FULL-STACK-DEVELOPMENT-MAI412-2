# AI Skill & Industry Trend Analyzer — Backend

FastAPI backend implementing the Digital Doppelgänger loop for career development:
**Learn → Understand → Predict → Recommend → Adapt.**

## Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

`.env` already exists with `OPENAI_API_KEY="xxx"` as a placeholder — paste your real key in when
you're ready. Until then, every AI-powered feature (skill extraction, embeddings, trend
explanations, persona naming) runs on a deterministic fallback, so the whole app is explorable
with zero setup cost.

## Seed the database (courses, 12-month skill trends, synthetic demo users)

```bash
python -m app.seed_data
```

Re-run with `--reset` to wipe and regenerate seed data.

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs
Health/AI-status check: http://localhost:8000/health

## Where the 4 required AI/ML capabilities live

| Capability | File |
|---|---|
| NLP / entity extraction | `app/services/extraction.py` |
| Personalisation & recommendation | `app/services/recommender.py` |
| Prediction / forecasting | `app/services/forecasting.py` |
| Generative AI / RAG explanations | `app/services/recommender.py` (`_explanation`), `app/services/openai_service.py` |
| Non-trivial insight: persona clustering | `app/services/clustering.py` |

## Notes

- `DATABASE_URL` defaults to a local SQLite file so there's nothing to install. Point it at a
  Postgres URL (e.g. from Supabase/Neon) in production — the SQLAlchemy models are portable as-is.
- The OpenAI key is only ever read server-side (`app/config.py` / `app/services/openai_service.py`)
  and is never sent to the frontend.
- A simple in-memory per-user daily call counter (`DAILY_AI_CALL_LIMIT`) caps AI usage during the
  build/demo phase.
