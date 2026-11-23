# Lab 8 — Full Stack REST API (React + Express + SQLite)

The Admissions module of the UniAI ERP, backed by a relational database with **six linked tables**.
The React app is part of the lab journal (`LABS/src/lab8/`, page at `/lab-8`, console at `/lab-8/app`);
the Express API lives here in `lab-8/server/`.

```
React UI → Axios → Express server → Route → Controller → Model (SQL) → SQLite → JSON → React UI updates
```

## Run it

From the `LABS` folder:

```bash
npm install
npm run sql:install     # once: installs the server's packages (lab-8/server)
npm run dev             # React on :5173, and it starts the Express API on :5000 for you
```

Open http://localhost:5173/lab-8 (journal entry) or http://localhost:5173/lab-8/app (the console).

Other ways to run the API: `npm run sql` (from `LABS`) or `npm run dev` / `npm start` inside `lab-8/server`
(nodemon / node). The first start creates `lab-8/server/database/uniai.db` and loads sample data.
`cd lab-8/server && npm run seed -- --reset` wipes and reloads it.

## Database (SQLite, foreign keys enforced)

| Table | Purpose | Links |
| --- | --- | --- |
| `applications` | the main table | `programme_id` → programmes, `campus_id` → campuses, `officer_id` → officers (optional) |
| `programmes` | code, name, department, years, seats, annual fee | |
| `campuses` | name, city, state | |
| `programme_campuses` | which programme is taught where (many-to-many) | → programmes, → campuses |
| `officers` | admissions team | |
| `notes` | officer notes on an application | `application_id` → applications (cascade delete), `officer_id` → officers (optional) |

Rules the database and API enforce: a programme with applications cannot be deleted (`409`); deleting an
application deletes its notes; an application's campus must teach its programme; seats cannot drop below the
number already admitted; a campus cannot be removed from a programme while applications exist there.

### Where data from several tables is combined

| Screen / endpoint | SQL |
| --- | --- |
| Applications list and detail | `applications JOIN programmes JOIN campuses LEFT JOIN officers` |
| Programme cards (seats left) | `programmes` + sub-selects counting `applications` |
| Campus cards | `campuses` + `programme_campuses JOIN programmes` |
| Dashboard bars (`/api/stats`) | `programmes / campuses / officers LEFT JOIN applications GROUP BY id` |
| Notes timeline | `notes LEFT JOIN officers` |

## REST API

Base URL `http://localhost:5000/api` (the React app reaches it through the Vite proxy at `/sql-api`).

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/applications` | All records (joined) |
| GET | `/applications?programmeId=3&campusId=1&officerId=2&status=review&q=oli&sort=name` | Filter with **query parameters**. `officerId=none` = unassigned; `sort` = newest, oldest, name, marks |
| GET | `/applications/status/:status` | Filter with a **path parameter** |
| GET | `/applications/programme/:code` | Path parameter, e.g. `/applications/programme/BTECH-CSE` |
| GET | `/applications/:id` | One record with its notes |
| POST | `/applications` | Add a record |
| PUT | `/applications/:id` | Update a record |
| PATCH | `/applications/:id` | Change only `status` and/or `officerId` |
| DELETE | `/applications/:id` | Delete (notes cascade) |
| POST / DELETE | `/applications/:id/notes`, `/applications/:id/notes/:noteId` | Add / remove a note |
| GET POST PUT DELETE | `/programmes`, `/programmes/:id` | Full CRUD on a second table |
| GET | `/campuses`, `/campuses/:id`, `/officers`, `/officers/:id` | Read the lookup tables (with counts) |
| GET | `/stats` | Dashboard totals |

Status codes: `200` OK · `201` created · `400` validation / bad id / bad filter · `404` not found ·
`409` duplicate (email, programme code or name) or a rule broken by existing data · `500` unexpected.
Errors are JSON: `{ "message": "Validation failed", "errors": { "email": "…" } }`.

Example — `POST /api/applications`:

```json
{
  "name": "Test Student",
  "email": "test@example.com",
  "phone": "9845012399",
  "programmeId": 3,
  "campusId": 2,
  "officerId": 1,
  "twelfthPct": 81.5,
  "sop": "I want to study business analytics because I enjoy turning data into decisions."
}
```

## Validation

Checked in the browser for instant feedback (`src/lab8/lib/validate.js`) and again on the server, which never
trusts the client (`server/models/*.js`). Empty fields, bad formats, out-of-range numbers, unknown ids and
duplicates all produce field-level messages; success and failure also appear as toasts.
SQL values are always bound parameters, and `sort` is looked up in a whitelist, so there is no SQL injection route.

## Code map

```
lab-8/server/
  server.js                  CORS, JSON, routes, error handlers
  routes/index.js            URL -> controller function
  controllers/               HTTP in/out and status codes (applications, programmes, lookups)
  models/                    validation + SQL (Application, Programme, Campus, Officer, Note, Stats)
  database/                  db.js (schema, seed, transactions), seedData.js, seed.js, uniai.db (created on first run)

LABS/src/lab8/
  Lab8App.jsx                routes and layout    api.js    the only file that uses Axios
  components/                Shell (header + nav + footer), FilterBar, ApplicationTable, ApplicationForm,
                             ProgrammeDialog, ConfirmDialog, Toast, ui (cards, meters, badges)
  pages/                     Overview, Applications, ApplicationDetail, ApplicationEdit,
                             Programmes, Campuses, Team
  hooks/ lib/                useAsync, useLookups, useDebouncedValue, validation, formatting
LABS/src/pages/Lab8.jsx      the journal page (brief, schema, endpoints, live preview)
```

## Deployment (bonus)

**Backend (Render / Railway)** — root `LABS/lab-8/server`, build `npm install`, start `npm start`. Variables:
`CLIENT_ORIGIN` = the deployed frontend URL (comma separated for several), and `DB_PATH` for a persistent disk
(free tiers reset the SQLite file on each deploy; the tables are recreated and re-seeded automatically).

**Frontend (Vercel / Netlify)** — root `LABS`, build `npm run build`, output `dist`. Set
`VITE_SQL_API_URL=https://<your-api-host>/api` (see `.env.example`) and rewrite all paths to `/index.html`
so deep links like `/lab-8/app/applications/3` work.
