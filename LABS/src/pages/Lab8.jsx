import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, Database, KeyRound, Terminal } from "lucide-react";
import Divider from "../components/Divider.jsx";

const concepts = [
  "REST API",
  "Express routes",
  "Controllers",
  "SQLite",
  "SQL JOINs",
  "Foreign keys",
  "Many-to-many",
  "Axios",
  "Query parameters",
  "Path parameters",
  "CORS",
  "Validation",
  "React Router",
  "Tailwind CSS",
];

const flow = ["React UI", "Axios", "Express server", "Route", "Controller", "Model (SQL)", "SQLite", "JSON", "React UI updates"];

// The six tables. `fk` marks a column that points at another table.
const tables = [
  {
    name: "applications",
    note: "the main table",
    columns: [
      { name: "id", pk: true },
      { name: "application_no" },
      { name: "name, email, phone" },
      { name: "programme_id", fk: "programmes" },
      { name: "campus_id", fk: "campuses" },
      { name: "officer_id", fk: "officers", optional: true },
      { name: "twelfth_pct, status, sop" },
    ],
  },
  {
    name: "programmes",
    note: "seats and fees",
    columns: [{ name: "id", pk: true }, { name: "code, name" }, { name: "department" }, { name: "duration_years" }, { name: "seats, annual_fee" }],
  },
  {
    name: "campuses",
    note: "where programmes run",
    columns: [{ name: "id", pk: true }, { name: "name" }, { name: "city, state" }],
  },
  {
    name: "programme_campuses",
    note: "many-to-many link",
    columns: [{ name: "programme_id", pk: true, fk: "programmes" }, { name: "campus_id", pk: true, fk: "campuses" }],
  },
  {
    name: "officers",
    note: "admissions team",
    columns: [{ name: "id", pk: true }, { name: "name, email" }, { name: "designation" }],
  },
  {
    name: "notes",
    note: "child of applications",
    columns: [{ name: "id", pk: true }, { name: "application_id", fk: "applications" }, { name: "officer_id", fk: "officers", optional: true }, { name: "body, created_at" }],
  },
];

const routeGroups = [
  {
    title: "Applications",
    routes: [
      ["GET", "/api/applications", "All records, joined with programme, campus and officer"],
      ["GET", "/api/applications?programmeId=3&status=review", "Filter with query parameters"],
      ["GET", "/api/applications/status/admitted", "Filter with a path parameter"],
      ["GET", "/api/applications/programme/BTECH-CSE", "Path parameter (programme code)"],
      ["GET", "/api/applications/:id", "One record plus its notes"],
      ["POST", "/api/applications", "Add a record"],
      ["PUT", "/api/applications/:id", "Update a record"],
      ["PATCH", "/api/applications/:id", "Change only status / officer"],
      ["DELETE", "/api/applications/:id", "Delete (notes cascade)"],
      ["POST", "/api/applications/:id/notes", "Add a note"],
    ],
  },
  {
    title: "Other tables",
    routes: [
      ["GET · POST", "/api/programmes", "List with seats left · add"],
      ["PUT · DELETE", "/api/programmes/:id", "Edit · delete (409 while in use)"],
      ["GET", "/api/campuses", "With programmes taught + counts"],
      ["GET", "/api/officers", "With caseload + notes written"],
      ["GET", "/api/stats", "GROUP BY totals for the dashboard"],
    ],
  },
];

const joins = [
  { label: "Applications list", sql: "applications JOIN programmes JOIN campuses LEFT JOIN officers" },
  { label: "Seats left", sql: "programmes + COUNT(applications WHERE status = 'admitted')" },
  { label: "Campus programmes", sql: "campuses JOIN programme_campuses JOIN programmes" },
  { label: "Dashboard bars", sql: "programmes / campuses / officers LEFT JOIN applications GROUP BY id" },
  { label: "Notes timeline", sql: "notes LEFT JOIN officers WHERE application_id = ?" },
];

const steps = [
  { label: "Install (once)", cmd: "npm run sql:install" },
  { label: "Start everything", cmd: "npm run dev   (React :5173 + Express API :5000)" },
  { label: "Or start the API alone", cmd: "npm run sql" },
  { label: "Reset the sample data", cmd: "cd lab-8/server && npm run seed -- --reset" },
];

const methodColor = (m) => (m.startsWith("GET") ? "text-teal-600" : m.startsWith("DELETE") ? "text-red-600" : "text-plum-500");

export default function Lab8() {
  return (
    <div className="min-h-screen">
      <div className="border-b border-paper-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-plum-500 hover:text-plum-600"
          >
            <ArrowLeft size={13} />
            Back to Lab Journal
          </Link>
          <span className="stamp-label">Entry 08</span>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <p className="stamp-label mb-3">Lab Journal &middot; Entry 08</p>
        <h1 className="font-serif text-3xl font-semibold text-plum-500 sm:text-4xl">LAB 08</h1>
        <p className="mt-2 text-lg text-ink-soft">Full Stack REST API &mdash; React + Express.js + SQLite</p>

        <Divider className="my-8" />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="paper-card p-6">
            <p className="stamp-label mb-2">Domain &amp; Module</p>
            <p className="font-serif text-xl font-semibold text-ink">AI-Powered University ERP Management System</p>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft">
              The Admissions module again, now backed by a relational database. Applications link to programmes, campuses
              and officers, so every screen combines data from several tables.
            </p>
          </div>

          <div className="paper-card p-6">
            <div className="mb-2 flex items-center gap-2">
              <Database size={15} className="text-plum-500" />
              <p className="stamp-label">Exercise Brief</p>
            </div>
            <p className="font-serif text-[1.05rem] font-semibold text-ink">Exercise 8 &mdash; Full Stack REST API Application</p>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft">
              Node.js + Express.js REST API on SQLite, integrated with React through Axios: full CRUD, filtering with query
              and path parameters, validation, CORS and a responsive Tailwind interface.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {concepts.map((concept) => (
            <span
              key={concept}
              className="rounded-full border border-plum-500/20 bg-paper-light px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.08em] text-plum-500"
            >
              {concept}
            </span>
          ))}
        </div>

        {/* request flow */}
        <div className="paper-card mt-6 p-5">
          <p className="stamp-label mb-3">Request flow</p>
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-2">
            {flow.map((node, i) => (
              <li key={node} className="flex items-center gap-2">
                <span className="rounded-sm border border-plum-500/20 bg-paper-light px-3 py-1.5 font-mono text-[12px] text-ink">{node}</span>
                {i < flow.length - 1 && <ArrowRight size={14} className="text-plum-500" aria-hidden="true" />}
              </li>
            ))}
          </ol>
        </div>

        {/* schema */}
        <div className="mt-10">
          <p className="stamp-label mb-1">Database</p>
          <h2 className="font-serif text-2xl font-semibold text-plum-500">Six linked tables</h2>
          <p className="mt-1 max-w-2xl text-sm text-ink-soft">
            Foreign keys are enforced by SQLite (<code className="font-mono text-[12.5px]">PRAGMA foreign_keys = ON</code>):
            you cannot delete a programme that has applications, and deleting an application removes its notes.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tables.map((t) => (
              <div key={t.name} className="paper-card overflow-hidden">
                <div className="flex items-baseline justify-between border-b border-paper-line bg-plum-50/70 px-4 py-2.5">
                  <span className="font-mono text-[13px] font-semibold text-plum-600">{t.name}</span>
                  <span className="text-[11px] text-ink-faint">{t.note}</span>
                </div>
                <ul className="divide-y divide-paper-line/60 px-4 py-1 font-mono text-[12.5px]">
                  {t.columns.map((c) => (
                    <li key={c.name} className="flex items-center gap-2 py-1.5">
                      {c.pk ? <KeyRound size={12} className="shrink-0 text-amber-600" aria-label="primary key" /> : <span className="w-3 shrink-0" />}
                      <span className="text-ink">{c.name}</span>
                      {c.fk && (
                        <span className="ml-auto inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-teal-50 px-2 py-0.5 text-[10.5px] text-teal-700">
                          <ArrowRight size={10} /> {c.fk}
                          {c.optional && <span className="text-teal-500">?</span>}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-faint">
            key = primary key &middot; arrow = foreign key &middot; ? = optional (may be empty)
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* routes */}
          <div className="paper-card p-5">
            <p className="stamp-label mb-3">REST endpoints</p>
            {routeGroups.map((g) => (
              <div key={g.title} className="mb-4 last:mb-0">
                <p className="mb-1 font-serif text-sm font-semibold text-ink">{g.title}</p>
                <ul className="divide-y divide-paper-line">
                  {g.routes.map(([method, route, note]) => (
                    <li key={method + route} className="grid grid-cols-[5.5rem_1fr] gap-x-3 gap-y-0.5 py-2 text-[0.88rem] sm:grid-cols-[6.5rem_1.2fr_1fr]">
                      <span className={`font-mono text-[11px] font-semibold uppercase tracking-[0.06em] ${methodColor(method)}`}>{method}</span>
                      <code className="break-all font-mono text-[12px] text-ink">{route}</code>
                      <span className="col-span-2 text-ink-soft sm:col-span-1">{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            {/* joins */}
            <div className="paper-card p-5">
              <p className="stamp-label mb-3">Where the data comes from</p>
              <ul className="space-y-2.5">
                {joins.map((j) => (
                  <li key={j.label} className="text-[0.9rem]">
                    <b className="font-serif text-ink">{j.label}</b>
                    <code className="mt-0.5 block font-mono text-[11.5px] leading-snug text-ink-soft">{j.sql}</code>
                  </li>
                ))}
              </ul>
            </div>

            {/* run it */}
            <div className="paper-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <Terminal size={15} className="text-plum-500" />
                <p className="stamp-label">Run it (from the LABS folder)</p>
              </div>
              <ol className="space-y-2.5">
                {steps.map((s, i) => (
                  <li key={s.label} className="flex gap-3 text-[0.92rem]">
                    <span className="font-mono text-[11px] text-plum-500">0{i + 1}</span>
                    <span>
                      <b className="font-serif text-ink">{s.label}</b>
                      <code className="mt-0.5 block font-mono text-[12.5px] text-ink-soft">{s.cmd}</code>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="stamp-label">Live preview &middot; needs the API running</p>
          <a
            href="/lab-8/app"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-sm border border-plum-500/25 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-plum-500 transition-colors hover:bg-plum-50"
          >
            Open full screen
            <ArrowUpRight size={13} />
          </a>
        </div>

        <div className="overflow-clip rounded-sm border border-plum-500/15 shadow-card">
          <iframe title="UniAI Admissions Console (Lab 8)" src="/lab-8/app" loading="lazy" className="block h-[760px] w-full bg-paper" />
        </div>
        <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
          client: <code className="normal-case">src/lab8/</code> &middot; server: <code className="normal-case">lab-8/server/</code> &middot; database:{" "}
          <code className="normal-case">uniai.db (SQLite)</code>
        </p>
      </section>
    </div>
  );
}
