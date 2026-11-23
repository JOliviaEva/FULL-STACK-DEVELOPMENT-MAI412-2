import { Link, NavLink, Outlet } from "react-router-dom";
import { ArrowLeft, Building2, ClipboardList, GraduationCap, LayoutDashboard, Plus, Users } from "lucide-react";
import { path } from "../config.js";

const TABS = [
  { to: path.home, label: "Overview", icon: LayoutDashboard, end: true },
  { to: path.applications, label: "Applications", icon: ClipboardList },
  { to: path.programmes, label: "Programmes", icon: GraduationCap },
  { to: path.campuses, label: "Campuses", icon: Building2 },
  { to: path.team, label: "Team", icon: Users },
];

const tabClass = ({ isActive }) =>
  `inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
    isActive ? "bg-paper-light text-plum-600 shadow" : "text-plum-100 hover:bg-white/10 hover:text-white"
  }`;

// Header + navigation + footer around every Lab 8 page.
export default function Shell() {
  return (
    <div className="min-h-screen" style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
      <header className="relative overflow-hidden bg-gradient-to-br from-plum-700 via-plum-500 to-rose-600 text-white">
        {/* soft decorative circles */}
        <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/10" />
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-28 right-40 h-64 w-64 rounded-full bg-rose-300/10" />

        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <div className="flex items-center justify-between pt-4">
            <Link
              to="/lab-8"
              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-plum-100 hover:text-white"
            >
              <ArrowLeft size={13} />
              Lab Journal · Entry 08
            </Link>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-plum-100 sm:block">
              React · Express · SQLite
            </span>
          </div>

          <div className="flex flex-col gap-4 pb-5 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <Link to={path.home} className="flex items-center gap-3.5">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
                <GraduationCap size={26} />
              </span>
              <span>
                <span className="block font-serif text-2xl font-semibold leading-tight">UniAI Admissions Console</span>
                <span className="block text-sm text-plum-100">AI-Powered University ERP · Admissions module</span>
              </span>
            </Link>
            <Link
              to={path.newApplication}
              className="inline-flex items-center justify-center gap-1.5 self-start rounded-lg bg-white px-4 py-2 text-sm font-semibold text-plum-600 shadow hover:bg-paper-light sm:self-auto"
            >
              <Plus size={16} />
              New application
            </Link>
          </div>

          <nav aria-label="Lab 8 sections" className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-4">
            {TABS.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={tabClass}>
                <Icon size={15} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <Outlet />
      </main>

      <footer className="border-t border-paper-line bg-paper-light/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-5 text-xs text-ink-soft sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>UniAI ERP · Lab 8 · sample data is fictional</p>
          <p className="font-mono">React → Axios → Express → Route → Controller → SQLite (6 tables)</p>
        </div>
      </footer>
    </div>
  );
}
