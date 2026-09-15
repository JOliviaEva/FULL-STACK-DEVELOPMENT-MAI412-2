import {
  Compass,
  FileUp,
  LayoutDashboard,
  LogOut,
  Sparkles,
  TrendingUp,
  UserCircle2,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import AiStatusBanner from "./AiStatusBanner.jsx";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/resume", label: "Resume Upload", icon: FileUp },
  { to: "/recommendations", label: "Recommendations", icon: Compass },
  { to: "/trends", label: "Market Trends", icon: TrendingUp },
  { to: "/persona", label: "Skill Persona", icon: Sparkles },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-void">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-void-line bg-void-soft/60 px-4 py-6 lg:flex">
        <div className="mb-8 flex items-center gap-2.5 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-crimson-400 to-burgundy-800 shadow-glow-soft">
            <Sparkles className="h-4.5 w-4.5 text-white" size={18} />
          </div>
          <div>
            <p className="font-display text-lg font-semibold leading-tight text-cream">Doppelgänger</p>
            <p className="text-[11px] uppercase tracking-wider text-rose-400/80">Career Intelligence</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-gradient-to-r from-burgundy-800/70 to-crimson-500/20 text-white shadow-glow-soft"
                    : "text-cream/60 hover:bg-void-raised hover:text-cream"
                }`
              }
            >
              <Icon size={17} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-3 border-t border-void-line pt-4">
          <div className="flex items-center gap-2.5 rounded-xl bg-void-raised px-3 py-2.5">
            <UserCircle2 size={22} className="text-rose-400" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-cream">{user?.full_name || "You"}</p>
              <p className="truncate text-xs text-cream/40">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-ghost w-full justify-center gap-2 border border-void-line">
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-void-line bg-void/80 px-5 py-3 backdrop-blur-md lg:hidden">
          <div className="flex items-center justify-between">
            <span className="font-display text-lg font-semibold text-cream">Doppelgänger</span>
            <button onClick={handleLogout} className="btn-ghost">
              <LogOut size={15} />
            </button>
          </div>
        </header>

        <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-6 lg:px-8 lg:py-8">
          <div className="mb-6">
            <AiStatusBanner />
          </div>
          {children}
        </div>

        <nav className="sticky bottom-0 z-10 flex justify-around border-t border-void-line bg-void/90 px-2 py-2 backdrop-blur-md lg:hidden">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-medium ${
                  isActive ? "text-rose-400" : "text-cream/50"
                }`
              }
            >
              <Icon size={18} />
              {label.split(" ")[0]}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
