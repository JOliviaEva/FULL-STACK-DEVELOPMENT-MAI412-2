import { Link } from "react-router-dom";
import { listOfficers } from "../api.js";
import { Avatar, Card, ErrorBlock, LoadingBlock, PageHeader } from "../components/ui.jsx";
import { applicationsWhere } from "../config.js";
import { useAsync } from "../hooks/useAsync.js";

function Figure({ value, label }) {
  return (
    <div className="rounded-lg bg-paper px-3 py-2 text-center">
      <p className="font-serif text-2xl font-semibold text-plum-500">{value}</p>
      <p className="text-[11px] uppercase tracking-wider text-ink-soft">{label}</p>
    </div>
  );
}

export default function Team() {
  const { data: officers, error, reload } = useAsync((signal) => listOfficers(signal), []);

  if (error && !officers) return <ErrorBlock message={error} onRetry={reload} />;
  if (!officers) return <LoadingBlock label="Loading the team…" />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Team"
        title="Admissions team"
        subtitle="Officers and their workload: assigned applications from one table, notes written from another."
      />

      <div className="grid gap-5 md:grid-cols-3">
        {officers.map((o) => (
          <Card key={o.id} className="flex flex-col p-5">
            <div className="flex items-center gap-3">
              <Avatar name={o.name} id={o.id} size="lg" />
              <div className="min-w-0">
                <h2 className="font-serif text-lg font-semibold leading-snug text-ink">{o.name}</h2>
                <p className="text-sm text-ink-soft">{o.designation}</p>
                <a href={`mailto:${o.email}`} className="block truncate text-xs text-plum-500 hover:underline">{o.email}</a>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <Figure value={o.caseload} label="Assigned" />
              <Figure value={o.openCases} label="Open" />
              <Figure value={o.noteCount} label="Notes" />
            </div>

            <Link to={applicationsWhere({ officerId: o.id })} className="mt-5 border-t border-paper-line pt-3 text-sm font-medium text-plum-500 hover:underline">
              View their applications →
            </Link>
          </Card>
        ))}
      </div>

      <p className="text-sm text-ink-soft">
        Applications nobody has picked up yet:{" "}
        <Link to={applicationsWhere({ officerId: "none" })} className="font-medium text-plum-500 hover:underline">
          see unassigned
        </Link>
        .
      </p>
    </div>
  );
}
