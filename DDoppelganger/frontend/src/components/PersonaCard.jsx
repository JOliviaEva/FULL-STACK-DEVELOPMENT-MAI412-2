import { Sparkles, Users } from "lucide-react";

export default function PersonaCard({ persona }) {
  if (!persona) return null;
  const { label, description, top_skills, cluster_size, ai_generated } = persona;

  return (
    <div className="card card-sheen relative overflow-hidden p-7">
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-crimson-500/25 to-transparent blur-2xl" />
      <div className="relative">
        <span className="eyebrow">Your data-derived persona</span>
        <h2 className="mt-2 font-display text-3xl font-bold text-gradient">{label}</h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-cream/70">{description}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {top_skills.map((s) => (
            <span
              key={s}
              className="rounded-full border border-rose-500/30 bg-burgundy-900/40 px-3 py-1 text-xs font-medium text-rose-200"
            >
              {s}
            </span>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-cream/50">
          <span className="inline-flex items-center gap-1.5">
            <Users size={13} /> {cluster_size} people share this persona
          </span>
          {ai_generated && (
            <span className="inline-flex items-center gap-1.5 text-rose-300">
              <Sparkles size={13} /> Named by GPT from clustered data
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
