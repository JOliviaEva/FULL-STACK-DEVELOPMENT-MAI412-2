import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, ClipboardList, FileCode2 } from "lucide-react";
import Divider from "../components/Divider.jsx";

export default function Lab1() {
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
          <span className="stamp-label">Entry 01</span>
        </div>
      </div>

      {/* exercise brief */}
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <p className="stamp-label mb-3">Lab Journal &middot; Entry 01</p>
        <h1 className="font-serif text-3xl font-semibold text-plum-500 sm:text-4xl">LAB 01</h1>
        <p className="mt-2 text-lg text-ink-soft">
          Responsive Webpage Layout using Tailwind CSS
        </p>

        <Divider className="my-8" />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="paper-card p-6">
            <p className="stamp-label mb-2">Domain</p>
            <p className="font-serif text-xl font-semibold text-ink">
              AI-Powered University ERP Management System
            </p>
          </div>

          <div className="paper-card p-6">
            <div className="mb-2 flex items-center gap-2">
              <ClipboardList size={15} className="text-plum-500" />
              <p className="stamp-label">Exercise Brief</p>
            </div>
            <p className="font-serif text-[1.05rem] font-semibold text-ink">
              Exercise&nbsp;1 &mdash; Develop a Responsive Webpage Layout using
              Tailwind CSS
            </p>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft">
              Develop a responsive webpage layout using Tailwind CSS. Include
              a header, navigation bar, main content, footer and the
              Tailwind Typography plugin.
            </p>
          </div>
        </div>
      </section>

      {/* framed implementation */}
      <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">

        <div className="mb-4 flex justify-end">
          <a
            href="/lab-1.html"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-sm border border-plum-500/25 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-plum-500 transition-colors hover:bg-plum-50"
          >
            Open lab-1.html in a new tab
            <ArrowUpRight size={13} />
          </a>
        </div>

        <div className="overflow-hidden rounded-sm border border-plum-500/15 shadow-card">
          <iframe
            src="/lab-1.html"
            title="Lab 1 — UniAI ERP responsive webpage (plain HTML &amp; CSS with Tailwind)"
            className="h-[900px] w-full bg-paper-light"
            loading="lazy"
          />
        </div>
        <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
          source file: <code className="normal-case">public/lab-1.html</code>
        </p>
      </section>
    </div>
  );
}
