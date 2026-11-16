import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, Database, Terminal } from "lucide-react";
import Divider from "../components/Divider.jsx";
import AdmissionsApp from "../admissions/AdmissionsApp.jsx";
import { MERN } from "../admissions/backends.js";

const concepts = [
  "MERN stack",
  "Express.js routes",
  "Mongoose schema",
  "MongoDB",
  "REST API",
  "CORS",
  "fetch() + async/await",
  "Server-side validation",
  "CRUD",
  "Search endpoint",
];

const flow = ["React", "fetch()", "Express route", "Mongoose", "MongoDB"];

const routes = [
  { op: "Create", method: "POST", path: "/applications" },
  { op: "Read", method: "GET", path: "/applications" },
  { op: "Search", method: "GET", path: "/applications/search/:name" },
  { op: "Update", method: "PUT", path: "/applications/:id" },
  { op: "Delete", method: "DELETE", path: "/applications/:id" },
];

const steps = [
  { label: "MongoDB", cmd: "Windows service on :27017 (or mongod --dbpath <folder>)" },
  { label: "Seed (once)", cmd: "cd server && npm run seed" },
  { label: "Express API", cmd: "npm run mern   (localhost:5001)" },
  { label: "React client", cmd: "npm run dev   (localhost:5173)" },
];

export default function Lab7() {
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
          <span className="stamp-label">Entry 07</span>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <p className="stamp-label mb-3">Lab Journal &middot; Entry 07</p>
        <h1 className="font-serif text-3xl font-semibold text-plum-500 sm:text-4xl">LAB 07</h1>
        <p className="mt-2 text-lg text-ink-soft">Basic MERN Stack &mdash; CRUD Operations</p>

        <Divider className="my-8" />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="paper-card p-6">
            <p className="stamp-label mb-2">Domain &amp; Module</p>
            <p className="font-serif text-xl font-semibold text-ink">
              AI-Powered University ERP Management System
            </p>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft">
              The Admissions Desk from Labs 5 &amp; 6, now backed by a real database: the same React app
              talks to an Express.js API that stores applications in MongoDB through Mongoose.
            </p>
          </div>

          <div className="paper-card p-6">
            <div className="mb-2 flex items-center gap-2">
              <Database size={15} className="text-plum-500" />
              <p className="stamp-label">Exercise Brief</p>
            </div>
            <p className="font-serif text-[1.05rem] font-semibold text-ink">
              Exercise 7 &mdash; Student Registration, in the ERP domain
            </p>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft">
              Collect applicant details in React, send them through Node.js &amp; Express.js and persist them
              in MongoDB, with create, read, search, update and delete endpoints.
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
                <span className="rounded-sm border border-plum-500/20 bg-paper-light px-3 py-1.5 font-mono text-[12px] text-ink">
                  {node}
                </span>
                {i < flow.length - 1 && <ArrowRight size={14} className="text-plum-500" aria-hidden="true" />}
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
          {/* CRUD routes */}
          <div className="paper-card p-5">
            <p className="stamp-label mb-3">CRUD operations covered</p>
            <ul className="divide-y divide-paper-line">
              {routes.map((r) => (
                <li key={r.op} className="flex items-center gap-3 py-2 text-[0.92rem]">
                  <span className="w-16 font-serif font-semibold text-ink">{r.op}</span>
                  <span className="w-16 font-mono text-[11px] uppercase tracking-[0.08em] text-plum-500">
                    {r.method}
                  </span>
                  <code className="font-mono text-[12.5px] text-ink-soft">{r.path}</code>
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
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <div className="mb-4 flex justify-end">
          <a
            href="/lab-7/app"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-sm border border-plum-500/25 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-plum-500 transition-colors hover:bg-plum-50"
          >
            Open full screen
            <ArrowUpRight size={13} />
          </a>
        </div>

        <div className="overflow-clip rounded-sm border border-plum-500/15 shadow-card">
          <AdmissionsApp backend={MERN} />
        </div>
        <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
          client: <code className="normal-case">src/admissions/</code> &middot; server:{" "}
          <code className="normal-case">server/server.js</code> &middot; database:{" "}
          <code className="normal-case">MongoDB uniaiERP</code>
        </p>
      </section>
    </div>
  );
}
