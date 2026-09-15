import { ArrowRight, Brain, Compass, Radar, Sparkles, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const STAGES = [
  {
    icon: Radar,
    title: "Learn",
    copy: "Ingests your resume, quiz results and in-app behaviour to build a living picture of your skills.",
  },
  {
    icon: Brain,
    title: "Understand",
    copy: "NLP extraction and embeddings turn scattered signals into a structured skill profile.",
  },
  {
    icon: TrendingUp,
    title: "Predict",
    copy: "Trend forecasting flags which of your skills are rising or fading in the market — before it's obvious.",
  },
  {
    icon: Compass,
    title: "Recommend",
    copy: "Course and elective matches ranked by relevance, explained in plain language, not a static list.",
  },
  {
    icon: Sparkles,
    title: "Adapt",
    copy: "Every accept, reject and completion retrains what gets suggested next.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-void">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-crimson-400 to-burgundy-800 shadow-glow-soft">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="font-display text-lg font-semibold text-cream">Doppelgänger</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost">
            Log in
          </Link>
          <Link to="/signup" className="btn-primary text-sm">
            Get started <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-10 lg:pt-20">
        <div className="max-w-3xl">
          <span className="eyebrow">AI Skill &amp; Industry Trend Analyzer</span>
          <h1 className="mt-4 font-display text-4xl font-bold leading-[1.1] text-cream lg:text-6xl">
            Your career has a <span className="text-gradient">digital doppelgänger</span> — one that
            never stops watching the market.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-cream/60 lg:text-lg">
            Upload a resume, and it builds a living model of your skills, benchmarks you against
            real market demand, predicts where you'll fall behind, and tells you exactly which
            course closes the gap — before that gap costs you a job.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/signup" className="btn-primary">
              Build my skill profile <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="btn-secondary">
              I already have an account
            </Link>
          </div>
        </div>

        <div className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STAGES.map(({ icon: Icon, title, copy }, i) => (
            <div key={title} className="card card-sheen p-5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-void-soft text-rose-400">
                <Icon size={18} />
              </div>
              <p className="mb-1 font-display text-sm font-semibold text-cream">
                <span className="mr-1.5 text-rose-500/60">{String(i + 1).padStart(2, "0")}</span>
                {title}
              </p>
              <p className="text-xs leading-relaxed text-cream/50">{copy}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 card card-sheen overflow-hidden p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="eyebrow">The non-obvious part</span>
              <h2 className="mt-2 font-display text-2xl font-semibold text-cream">
                It finds the job title before the job boards do.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-cream/60">
                Instead of hand-coded "if skill missing, recommend course" rules, unsupervised
                clustering surfaces latent skill personas from your accumulated activity —
                sometimes months before that combination has a name in the market.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="w-full max-w-sm rounded-2xl border border-rose-500/20 bg-gradient-to-br from-burgundy-900/60 to-void-raised p-6 text-center">
                <Sparkles className="mx-auto mb-3 text-rose-400" size={24} />
                <p className="font-display text-xl font-semibold text-gradient">
                  "AI-Augmented Product Engineer"
                </p>
                <p className="mt-2 text-xs text-cream/40">
                  A persona detected from clustering — not typed anywhere in your resume.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-void-line px-6 py-8 text-center text-xs text-cream/30">
        Built for career &amp; learning development · Digital Doppelgänger pattern
      </footer>
    </div>
  );
}
