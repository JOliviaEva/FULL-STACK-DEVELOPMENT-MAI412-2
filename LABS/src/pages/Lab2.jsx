import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, ClipboardList } from "lucide-react";
import Divider from "../components/Divider.jsx";

export default function Lab2() {
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
          <span className="stamp-label">Entry 02</span>
        </div>
      </div>

      {/* exercise brief */}
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <p className="stamp-label mb-3">Lab Journal &middot; Entry 02</p>
        <h1 className="font-serif text-3xl font-semibold text-plum-500 sm:text-4xl">LAB 02</h1>
        <p className="mt-2 text-lg text-ink-soft">
          Integrating HTML5 APIs into the Responsive Webpage
        </p>

        <Divider className="my-8" />
      </section>

      {/* framed implementation */}
      <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">

        <div className="mb-4 flex justify-end">
          <a
            href="/lab-2.html"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-sm border border-plum-500/25 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-plum-500 transition-colors hover:bg-plum-50"
          >
            Open lab-2.html in a new tab
            <ArrowUpRight size={13} />
          </a>
        </div>

        <div className="overflow-hidden rounded-sm border border-plum-500/15 shadow-card">
          <iframe
            src="/lab-2.html"
            title="Lab 2 — CHRIST University ERP dashboard enhanced with HTML5 APIs (Tailwind CSS)"
            className="h-[1100px] w-full bg-paper-light"
            loading="lazy"
          />
        </div>
        <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
          source file: <code className="normal-case">public/lab-2.html</code>
        </p>
      </section>
    </div>
  );
}
