import useAiStatus from "../hooks/useAiStatus.js";

export default function AiStatusBanner() {
  const status = useAiStatus();
  if (status.loading) return null;

  return (
    <div
      className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm ${
        status.ai_enabled
          ? "border-rose-500/30 bg-rose-500/10 text-rose-200"
          : "border-void-line bg-void-soft text-cream/60"
      }`}
    >
      <span className={`h-2 w-2 shrink-0 rounded-full ${status.ai_enabled ? "bg-rose-400 shadow-glow-soft" : "bg-cream/30"}`} />
      <span>
        {status.ai_enabled ? (
          <>
            <strong className="font-semibold text-rose-100">Live AI mode</strong> — GPT-4o-mini &amp;
            embeddings active.
          </>
        ) : (
          <>
            <strong className="font-semibold text-cream/80">Fallback mode</strong> — {status.note}
          </>
        )}
      </span>
    </div>
  );
}
