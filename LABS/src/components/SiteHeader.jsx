import { Link } from "react-router-dom";
import { NotebookPen } from "lucide-react";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-paper-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-plum-500/30 bg-paper-light text-plum-500 transition-colors group-hover:bg-plum-500 group-hover:text-paper-light">
            <NotebookPen size={16} strokeWidth={1.75} />
          </span>
          <span className="font-mono text-[13px] tracking-[0.08em] text-ink-soft">
            Olivia&rsquo;s <span className="text-plum-500">Full&nbsp;Stack</span> Lab
          </span>
        </Link>
        <Link
          to="/"
          className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint transition-colors hover:text-plum-500"
        >
          Journal Index
        </Link>
      </div>
    </header>
  );
}
