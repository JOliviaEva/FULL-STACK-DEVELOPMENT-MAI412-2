import { Link } from "react-router-dom";
import { ArrowRight, Lock } from "lucide-react";

const statusStyles = {
  Completed: "bg-teal-50 text-teal-700 border-teal-200",
  "In Progress": "bg-rose-50 text-rose-700 border-rose-200",
};

export default function LabCard({ index, title, status, description, icon: Icon, href }) {
  const isDone = status === "Completed";

  const CardInner = (
    <div
      className={`paper-card group relative flex h-full flex-col p-6 transition-all duration-300 ${
        isDone ? "hover:-translate-y-1 hover:shadow-card" : "opacity-90"
      }`}
    >
      {/* washi-tape corner accent */}
      <span
        aria-hidden="true"
        className="absolute -top-2 left-7 h-4 w-14 -rotate-3 rounded-[1px] bg-rose-200/70"
      />

      <div className="flex items-start justify-between gap-3">
        <span className="stamp-label">Entry 0{index}</span>
        <span
          className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] ${statusStyles[status]}`}
        >
          {status}
        </span>
      </div>

      <div className="mt-4 flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-plum-500/25 text-plum-500">
          <Icon size={17} strokeWidth={1.75} />
        </span>
        <div>
          <h3 className="font-serif text-lg font-semibold leading-snug text-plum-500">{title}</h3>
        </div>
      </div>

      {description && (
        <p className="mt-4 flex-1 text-[0.95rem] leading-relaxed text-ink-soft">{description}</p>
      )}

      <div className="hairline mt-5 pt-4">
        {isDone ? (
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-plum-500 transition-transform duration-200 group-hover:translate-x-1">
            View Lab {index}
            <ArrowRight size={13} />
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-ink-faint">
            <Lock size={12} />
          </span>
        )}
      </div>
    </div>
  );

  if (isDone && href) {
    return (
      <Link to={href} className="block h-full focus-visible:outline-none">
        {CardInner}
      </Link>
    );
  }

  return <div className="h-full cursor-not-allowed select-none">{CardInner}</div>;
}
