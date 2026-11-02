import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Atom, Terminal } from "lucide-react";
import Divider from "../components/Divider.jsx";
import AdmissionsApp from "../admissions/AdmissionsApp.jsx";

const concepts = [
  "Functional components",
  "JSX",
  "useState()",
  "Event handling",
  "Form handling",
  "Multiple inputs",
  "Radio buttons",
  "Select dropdown",
  "Reusable components",
  "CSS styling",
  "CRUD · JSON Server",
  "Live search",
];

export default function Lab56() {
  return (
    <div className="min-h-screen">
      {/* journal breadcrumb strip */}
      <div className="border-b border-paper-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-plum-500 hover:text-plum-600"
          >
            <ArrowLeft size={13} />
            Back to Lab Journal
          </Link>
          <span className="stamp-label">Entry 05 &amp; 06</span>
        </div>
      </div>

      {/* exercise brief */}
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <p className="stamp-label mb-3">Lab Journal &middot; Entry 05 &amp; 06</p>
        <h1 className="font-serif text-3xl font-semibold text-plum-500 sm:text-4xl">LAB 05 &amp; 06</h1>
        <p className="mt-2 text-lg text-ink-soft">Domain-Based React Application with CRUD</p>

        <Divider className="my-8" />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="paper-card p-6">
            <p className="stamp-label mb-2">Domain &amp; Module</p>
            <p className="font-serif text-xl font-semibold text-ink">
              AI-Powered University ERP Management System
            </p>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft">
              The Admissions Intake form from Lab 3, rebuilt in React as a full Admissions Desk that
              keeps the same validation rules and AI fit score.
            </p>
          </div>

          <div className="paper-card p-6">
            <div className="mb-2 flex items-center gap-2">
              <Atom size={15} className="text-plum-500" />
              <p className="stamp-label">Exercise Brief</p>
            </div>
            <p className="font-serif text-[1.05rem] font-semibold text-ink">
              Exercise 5 &amp; 6 — React components, hooks and CRUD
            </p>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft">
              Create, read, update and delete admission applications stored in <code>db.json</code>{" "}
              through JSON Server&rsquo;s REST API, with live search and status filtering.
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

        <div className="paper-card mt-6 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex items-center gap-2">
            <Terminal size={15} className="text-plum-500" />
            <p className="stamp-label">Run the database</p>
          </div>
          <p className="text-[0.92rem] text-ink-soft">
            <code className="font-mono text-plum-500">npm run dev</code> also starts JSON Server on{" "}
            <code className="font-mono text-plum-500">localhost:3001/applications</code>
          </p>
        </div>
      </section>

      {/* live implementation */}
      <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <div className="mb-4 flex justify-end">
          <a
            href="/lab-5-6/app"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-sm border border-plum-500/25 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-plum-500 transition-colors hover:bg-plum-50"
          >
            Open full screen
            <ArrowUpRight size={13} />
          </a>
        </div>

        <div className="overflow-clip rounded-sm border border-plum-500/15 shadow-card">
          <AdmissionsApp />
        </div>
        <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
          source: <code className="normal-case">src/admissions/</code> &middot; database:{" "}
          <code className="normal-case">db.json</code>
        </p>
      </section>
    </div>
  );
}
