import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { listCampuses } from "../api.js";
import { Card, Chip, ErrorBlock, LoadingBlock, Meter, PageHeader } from "../components/ui.jsx";
import { applicationsWhere } from "../config.js";
import { useAsync } from "../hooks/useAsync.js";
import { STATUS_META } from "../lib/format.js";

export default function Campuses() {
  const { data: campuses, error, reload } = useAsync((signal) => listCampuses(signal), []);

  if (error && !campuses) return <ErrorBlock message={error} onRetry={reload} />;
  if (!campuses) return <LoadingBlock label="Loading campuses…" />;

  const max = Math.max(1, ...campuses.map((c) => c.applications));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Campuses"
        title="Campuses"
        subtitle="Each campus with the programmes taught there (a many-to-many link) and the applications it received."
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {campuses.map((c) => (
          <Card key={c.id} className="flex flex-col p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                <MapPin size={18} />
              </span>
              <div>
                <h2 className="font-serif text-lg font-semibold leading-snug text-ink">{c.name}</h2>
                <p className="text-sm text-ink-soft">{c.city}, {c.state}</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-1.5 flex items-baseline justify-between text-sm">
                <span className="text-ink-soft"><b className="text-ink">{c.applications}</b> application{c.applications === 1 ? "" : "s"}</span>
                <span className="text-green-700">{c.admitted} admitted</span>
              </div>
              <Meter
                label={`${c.applications} applications`}
                max={max}
                segments={[
                  { label: "Admitted", value: c.admitted, color: STATUS_META.admitted.color },
                  { label: "Other applicants", value: c.applications - c.admitted, color: "#218DAE" },
                ]}
              />
            </div>

            <p className="stamp-label mb-1.5 mt-4">Teaches {c.programmeCount} programme{c.programmeCount === 1 ? "" : "s"}</p>
            <div className="flex flex-wrap gap-1.5">
              {c.programmes.map((p) => (
                <Chip key={p.id} to={applicationsWhere({ campusId: c.id, programmeId: p.id })}>{p.name}</Chip>
              ))}
            </div>

            <Link to={applicationsWhere({ campusId: c.id })} className="mt-5 border-t border-paper-line pt-3 text-sm font-medium text-plum-500 hover:underline">
              View applications →
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
