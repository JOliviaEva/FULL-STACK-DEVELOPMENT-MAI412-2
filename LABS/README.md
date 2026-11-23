# Olivia's Full Stack Development Lab

A vintage academic lab-journal website documenting a full stack development
journey, built with React, React Router and Tailwind CSS (with the
Typography plugin).

## Run it

```bash
npm install
npm run dev
```

Open the printed local URL (typically `http://localhost:5173`).

To build for production:

```bash
npm run build
npm run preview
```

## Routes

- `/` — the lab journal home: hero cover, "Lab Journal — Progress So Far"
  with 4 entries: Lab 1, Lab 2, Labs 3 & 4 (combined) and Labs 5 & 6.
- `/lab-3-4` — Labs 3 & 4, JavaScript event handling (`/lab-3` still works).
- `/lab-1` — Exercise 1 brief plus the actual implementation. **The
  implementation itself is plain HTML & CSS**, not React: it lives at
  `public/lab-1.html`, served as a static file at `/lab-1.html`, built with
  Tailwind CSS via CDN (including the Typography plugin) and vanilla JS for
  the mobile menu toggle. The `/lab-1` journal page embeds it live in an
  `<iframe>` and also links to open it directly in a new tab.

## Labs 5 & 6 — React CRUD (UniAI Admissions Desk)

The Lab 3 Admissions Intake module rebuilt in React, with full CRUD backed
by **JSON Server** (`db.json`).

```bash
npm run dev      # React app → http://localhost:5173/lab-5-6
                 # also starts JSON Server → http://localhost:3001/applications
```

`npm run server` still starts JSON Server on its own; if it is already
running, `npm run dev` reuses it.

- `/lab-5-6` — journal entry with the app embedded inline.
- `/lab-5-6/app` — the app full screen (use this for the demo/screenshots).
- The app calls `/api/applications`; Vite proxies `/api` to port 3001
  (`vite.config.js`). Set `VITE_API_URL` to use another backend.

| Operation | UI | HTTP |
| --- | --- | --- |
| Create | "Add application" form | `POST /applications` |
| Read | Applications table | `GET /applications` |
| Update | Edit → "Save changes" | `PUT /applications/:id` |
| Delete | Delete → confirm dialog | `DELETE /applications/:id` |
| Search | Search box, status filter, sort | client-side, live |

```
db.json                      ← database (8 seed applications)
src/admissions/
  AdmissionsApp.jsx          container: state, search/filter/sort, CRUD handlers
  useApplications.js         custom hook owning the list + CRUD calls
  api.js                     fetch-based REST client for JSON Server
  model.js                   options, validation rules, AI fit score, helpers
  admissions.css             plain CSS (Lab 3 design tokens, dark/light, responsive)
  components/                ApplicationForm, ApplicationTable, ApplicationRow,
                             FormField, InputField, SelectField, TextAreaField,
                             RadioGroup, SearchBar, Button, StatCard,
                             StatusBadge, FitMeter, ConfirmDialog, Toast
```

## Lab 8 — Full Stack REST API (React + Express + SQLite)

The Admissions module on a relational database with six linked tables (applications, programmes, campuses,
programme_campuses, officers, notes): joins, foreign keys, query and path parameters, full CRUD and validation.

```bash
npm run sql:install   # once: install the Express server in lab-8/server
npm run dev           # React :5173 + Express/SQLite API :5000 (started for you)
```

- `/lab-8` — journal entry (brief, schema, endpoints, live preview). `/lab-8/app` — the console.
- Client code: `src/lab8/`. Server and full documentation: `lab-8/` (see `lab-8/README.md`).

## Structure

```
public/
  lab-1.html              ← LAB 1 ITSELF: plain HTML + CSS (Tailwind CDN +
                             Typography plugin), header/nav/main/footer,
                             vanilla JS mobile-menu toggle. No React here.
src/
  components/
    Divider.jsx          thin decorative journal rule
    JournalMark.jsx       hero illustration (SVG notebook + circuit sketch)
    SiteHeader.jsx         slim top bar for the journal pages
    Hero.jsx                home page hero / journal cover
    LabProgress.jsx        "progress so far" section (renders 4 LabCards)
    LabCard.jsx             single journal-entry card
    Footer.jsx               shared, configurable footer
  pages/
    Home.jsx
    Lab1.jsx                exercise brief + <iframe> embedding lab-1.html
  App.jsx                  route table
  main.jsx                 app entry + BrowserRouter
  index.css                Tailwind layers + journal-specific utilities
tailwind.config.js         palette, fonts, shadows, animation tokens (for
                            the React journal shell — lab-1.html has its
                            own inline Tailwind config since it's static)
```

## Notes

- Color palette: `#601D49` (plum, dominant), `#BD5579` (rose), `#218DAE`
  (teal), plus warm paper and ink neutrals — configured in
  `tailwind.config.js`.
- Fonts: Source Serif 4 for headings/journal voice, IBM Plex Mono for
  labels, data and navigation — loaded via Google Fonts in `index.html`.
- The Tailwind Typography plugin (`@tailwindcss/typography`) is installed
  and used with the `prose` class in the "About UniAI ERP" section on the
  Lab 1 page.
- Labs 2–4 are intentionally left as placeholders with disabled
  "Coming Soon" states — no fabricated content was added for them.
- **Lab 1 is plain HTML & CSS.** `public/lab-1.html` is a fully
  self-contained static file — open it directly in any browser (double-click
  it, no build step needed) and it works on its own. It's also reachable at
  `/lab-1.html` when the site is running, and the journal's `/lab-1` route
  embeds it live via an `<iframe>`.
