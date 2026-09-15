# AI Skill & Industry Trend Analyzer — Frontend

React + Vite + Tailwind dashboard for the Digital Doppelgänger career-development app.

## Setup

```bash
cd frontend
npm install
npm run dev
```

Runs at http://localhost:5173 and expects the backend at http://localhost:8000 (see
`.env` / `VITE_API_URL`).

## Pages

| Route | Purpose |
|---|---|
| `/` | Landing page explaining the Learn→Understand→Predict→Recommend→Adapt loop |
| `/signup`, `/login` | Auth |
| `/dashboard` | Skill radar chart + obsolescence risk gauge |
| `/resume` | Resume upload (paste text or file) → NLP skill extraction |
| `/recommendations` | Ranked, explained course recommendations + accept/reject/complete feedback |
| `/trends` | Rising vs. declining market skills (forecasting) |
| `/persona` | The unsupervised-clustering "strange insight" persona |

## Theme

A dark, professional red / pink / black / burgundy palette defined in `tailwind.config.js`
(`void`, `burgundy`, `crimson`, `rose`, `cream`) and `src/index.css`. Headings use Playfair
Display, body text Inter, both loaded from Google Fonts in `index.html`.
