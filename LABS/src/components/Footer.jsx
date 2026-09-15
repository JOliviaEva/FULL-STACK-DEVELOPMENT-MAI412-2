import { Link } from "react-router-dom";
import { NotebookPen } from "lucide-react";

export default function Footer({ labLine, builtWith = "Built with React &amp; Tailwind CSS", showBackLink = false }) {
  return (
    <footer className="border-t border-paper-line bg-paper-dark/60">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-plum-500/30 text-plum-500">
              <NotebookPen size={15} strokeWidth={1.75} />
            </span>
            <div>
              <p className="font-serif text-base font-semibold text-plum-500">
                Olivia&rsquo;s Full Stack Development Lab
              </p>
              {labLine && (
                <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-faint">
                  {labLine}
                </p>
              )}
              <p
                className="mt-1 text-[13px] text-ink-soft"
                dangerouslySetInnerHTML={{ __html: builtWith }}
              />
            </div>
          </div>

          <div className="flex flex-col items-start gap-2 sm:items-end">
            {showBackLink && (
              <Link
                to="/"
                className="font-mono text-[11px] uppercase tracking-[0.12em] text-plum-500 hover:text-plum-600"
              >
                &larr; Back to Lab Journal
              </Link>
            )}
            <p className="font-mono text-[11px] text-ink-faint">
              &copy; {new Date().getFullYear()} Olivia. All rights reserved.
            </p>
          </div>
        </div>

        <div className="hairline mt-8 pt-4 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          entry logged in the lab notebook
        </div>
      </div>
    </footer>
  );
}
