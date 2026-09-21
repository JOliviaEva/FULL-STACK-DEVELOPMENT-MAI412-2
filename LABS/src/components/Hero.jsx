import { ArrowDown } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-paper-line">
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
        <div className="animate-rise">
          <p className="stamp-label mb-5 inline-flex items-center gap-2 rounded-full border border-plum-500/25 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
            Full Stack Development Lab
          </p>

          <h1 className="font-serif text-4xl font-semibold leading-[1.08] text-plum-500 sm:text-5xl lg:text-[3.4rem]">
            Welcome to Olivia&rsquo;s Full Stack Development Lab
          </h1>

          <p className="mt-6 max-w-lg text-[1.05rem] leading-relaxed text-ink-soft">
            A digital journal documenting my journey through full stack
            development &mdash; one lab, one exercise, one working build at a
            time.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-5">
            <a
              href="#progress"
              className="group inline-flex items-center gap-2 rounded-sm bg-plum-500 px-6 py-3 font-mono text-[12px] uppercase tracking-[0.12em] text-paper-light shadow-card transition-transform duration-200 hover:-translate-y-0.5 hover:bg-plum-600"
            >
              Explore My Labs
              <ArrowDown size={14} className="transition-transform duration-200 group-hover:translate-y-0.5" />
            </a>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
              4 entries logged &middot; 2 complete
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
