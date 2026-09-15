# AI Skill & Industry Trend Analyzer

A Digital Doppelgänger for career development: it learns your skills from your resume and
in-app behaviour, understands where you sit relative to market demand, predicts which skills
are about to matter (or fade), recommends the courses/electives that close the gap, and adapts
as you accept, reject or complete recommendations.

```
Learn → Understand → Predict → Recommend → Adapt
```

## Project layout

```
DDoppelganger/
├── backend/     FastAPI + SQLAlchemy + OpenAI (Python)
└── frontend/    React + Vite + Tailwind (red / pink / black / burgundy theme)
```

## Quick start

**1. Backend**

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m app.seed_data          # courses, 12mo skill trends, synthetic demo users
uvicorn app.main:app --reload --port 8000
```

**2. Frontend** (separate terminal)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

## Adding your OpenAI key

`backend/.env` ships with `OPENAI_API_KEY="xxx"` as a placeholder. Paste your real key in and
restart uvicorn — skill extraction, embeddings, trend explanations and persona naming all
switch from their deterministic fallbacks to live GPT-4o-mini / text-embedding-3-small calls
automatically (check the "AI mode" banner at the top of every page, or `GET /health`). Nothing
is exposed to the browser — the key is read only in `backend/app/config.py` /
`backend/app/services/openai_service.py`.

## Where each required capability lives

| Capability | Location |
|---|---|
| NLP / entity extraction | `backend/app/services/extraction.py` |
| Personalisation & recommendation | `backend/app/services/recommender.py` |
| Prediction / forecasting | `backend/app/services/forecasting.py` |
| Generative AI / RAG explanations | `backend/app/services/recommender.py`, `openai_service.py` |
| Non-trivial insight (persona clustering) | `backend/app/services/clustering.py` |

See `backend/README.md` and `frontend/README.md` for more detail on each side.
