import { Check, ExternalLink, Sparkles, ThumbsDown, Trophy } from "lucide-react";

const STATUS_STYLE = {
  pending: "text-cream/50 border-void-line",
  accepted: "text-rose-300 border-rose-500/40 bg-rose-500/10",
  rejected: "text-cream/30 border-void-line line-through",
  completed: "text-crimson-300 border-crimson-500/40 bg-crimson-500/10",
};

export default function RecommendationCard({ rec, onFeedback, busy }) {
  const { course, score, reason, status, ai_generated } = rec;
  const disabled = busy || status !== "pending";

  return (
    <div className={`card card-sheen p-5 transition-opacity ${status === "rejected" ? "opacity-50" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="pill">{course.provider}</span>
            <span className="pill capitalize">{course.level}</span>
            {ai_generated && (
              <span className="pill border-rose-500/40 bg-rose-500/10 text-rose-300">
                <Sparkles size={11} /> AI explained
              </span>
            )}
          </div>
          <h3 className="font-display text-lg font-semibold leading-snug text-cream">{course.title}</h3>
        </div>
        <div className="shrink-0 rounded-lg border border-void-line bg-void-soft px-2.5 py-1.5 text-center">
          <p className="text-[10px] uppercase tracking-wide text-cream/40">Match</p>
          <p className="font-display text-lg font-bold text-rose-300">{Math.round(score * 100)}%</p>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-cream/70">{reason}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {course.skills.map((s) => (
          <span key={s} className="rounded-full bg-burgundy-900/50 px-2.5 py-0.5 text-[11px] text-rose-200/80">
            {s}
          </span>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-void-line pt-4">
        <span className={`rounded-md border px-2 py-1 text-xs font-medium capitalize ${STATUS_STYLE[status]}`}>
          {status}
        </span>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={course.url}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost gap-1 text-xs text-cream/50 hover:text-rose-300"
          >
            View course <ExternalLink size={12} />
          </a>
          {status === "pending" && (
            <>
              <button
                disabled={disabled}
                onClick={() => onFeedback(rec.id, "reject")}
                className="btn-ghost gap-1.5 border border-void-line text-xs"
              >
                <ThumbsDown size={13} /> Not now
              </button>
              <button
                disabled={disabled}
                onClick={() => onFeedback(rec.id, "accept")}
                className="btn-ghost gap-1.5 border border-rose-500/30 text-xs text-rose-300"
              >
                <Check size={13} /> Accept
              </button>
            </>
          )}
          {status === "accepted" && (
            <button
              disabled={busy}
              onClick={() => onFeedback(rec.id, "complete")}
              className="btn-primary py-1.5 text-xs"
            >
              <Trophy size={13} /> Mark completed
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
