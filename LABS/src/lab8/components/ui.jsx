// Small presentational pieces shared by every Lab 8 page.
import { Link } from "react-router-dom";
import { AlertTriangle, Inbox, Loader2 } from "lucide-react";
import { STATUS_META, initials, toneFor } from "../lib/format.js";

// ---- button styles (plain class strings so they work on <button> and <Link>) ----
const btn =
  "inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60";
export const btnPrimary = `${btn} bg-plum-500 text-white shadow-sm hover:bg-plum-600`;
export const btnGhost = `${btn} border border-paper-line bg-paper-light text-ink hover:bg-white`;
export const btnDanger = `${btn} bg-red-600 text-white shadow-sm hover:bg-red-700`;
export const btnDangerGhost = `${btn} border border-red-200 bg-paper-light text-red-600 hover:bg-red-50`;
export const btnSmall = "rounded-md px-2.5 py-1 text-xs font-medium transition-colors";

export const inputClass =
  "w-full rounded-lg border border-paper-line bg-white px-3 py-2 text-sm text-ink shadow-sm placeholder:text-ink-faint";

// ---- people / status ----
export function Avatar({ name, id, size = "md" }) {
  const dim = size === "lg" ? "h-12 w-12 text-base" : size === "sm" ? "h-7 w-7 text-[10px]" : "h-9 w-9 text-xs";
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${dim} ${toneFor(id)}`}
    >
      {initials(name)}
    </span>
  );
}

export function StatusBadge({ status }) {
  const meta = STATUS_META[status] ?? STATUS_META.review;
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${meta.badge}`}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} aria-hidden="true" />
      {meta.label}
    </span>
  );
}

export function Chip({ children, to }) {
  const cls =
    "inline-block rounded-full border border-plum-500/15 bg-plum-50 px-2.5 py-0.5 text-[11px] font-medium text-plum-600";
  return to ? (
    <Link to={to} className={`${cls} hover:bg-plum-100`}>
      {children}
    </Link>
  ) : (
    <span className={cls}>{children}</span>
  );
}

// ---- layout ----
export function Card({ className = "", children, ...rest }) {
  return (
    <div className={`rounded-xl border border-paper-line/80 bg-paper-light shadow-paper ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="stamp-label mb-1.5">{eyebrow}</p>}
        <h1 className="font-serif text-3xl font-semibold text-plum-500">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-ink-soft">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

// A number with a label, an icon and a coloured edge. Pass `to` to make it a link.
export function StatCard({ label, value, hint, icon: Icon, color = "#601D49", to, active }) {
  const body = (
    <>
      <span className="absolute inset-x-0 top-0 h-1" style={{ background: color }} aria-hidden="true" />
      <span className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">{label}</span>
        {Icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: `${color}1A`, color }}>
            <Icon size={16} />
          </span>
        )}
      </span>
      <span className="mt-2 block font-serif text-4xl font-semibold leading-none text-ink">{value}</span>
      {hint && <span className="mt-2 block text-xs text-ink-soft">{hint}</span>}
    </>
  );
  const cls = `relative block overflow-hidden rounded-xl border bg-paper-light p-4 pt-5 shadow-paper transition ${
    active ? "border-plum-500 ring-1 ring-plum-500" : "border-paper-line/80"
  }`;
  return to ? (
    <Link to={to} className={`${cls} hover:-translate-y-0.5 hover:shadow-card`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

// A horizontal bar. `segments` = [{ value, color, label }] drawn against `max`.
export function Meter({ segments, max, label, height = "h-2.5" }) {
  return (
    <div
      role="img"
      aria-label={label}
      className={`flex w-full overflow-hidden rounded-full bg-paper-dark ${height}`}
    >
      {segments.map((s) => (
        <span
          key={s.label}
          title={`${s.label}: ${s.value}`}
          style={{ width: `${max ? (s.value / max) * 100 : 0}%`, background: s.color }}
        />
      ))}
    </div>
  );
}

// ---- states ----
export function LoadingBlock({ label = "Loading…" }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 rounded-xl border border-paper-line/80 bg-paper-light p-10 text-sm text-ink-soft">
      <Loader2 size={16} className="animate-spin" />
      {label}
    </div>
  );
}

export function ErrorBlock({ message, onRetry, hint = true }) {
  return (
    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <AlertTriangle className="mx-auto text-red-500" size={22} />
      <p className="mt-2 font-medium text-red-800">{message}</p>
      {hint && (
        <p className="mt-1 text-sm text-red-700">
          Start the API with <code className="rounded bg-red-100 px-1">npm run sql</code> in the LABS folder.
        </p>
      )}
      {onRetry && (
        <button type="button" onClick={onRetry} className={`${btnDanger} mt-4`}>
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyBlock({ title, children }) {
  return (
    <div className="rounded-xl border border-dashed border-plum-500/25 bg-paper-light p-10 text-center">
      <Inbox className="mx-auto text-plum-300" size={26} />
      <p className="mt-2 font-serif text-lg font-semibold text-ink">{title}</p>
      <div className="mt-1 text-sm text-ink-soft">{children}</div>
    </div>
  );
}
