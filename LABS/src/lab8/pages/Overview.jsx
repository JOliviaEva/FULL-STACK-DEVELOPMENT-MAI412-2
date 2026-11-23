import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, ClipboardList, Clock, Sparkles, UserX } from "lucide-react";
import { getStats, listApplications } from "../api.js";
import { Avatar, Card, ErrorBlock, LoadingBlock, Meter, PageHeader, StatCard, StatusBadge, btnGhost } from "../components/ui.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { applicationsWhere, path } from "../config.js";
import { STATUS_KEYS, STATUS_META, formatDate } from "../lib/format.js";

function Section({ title, hint, to, linkLabel, children }) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-lg font-semibold text-plum-500">{title}</h2>
          {hint && <p className="text-xs text-ink-soft">{hint}</p>}
        </div>
        {to && (
          <Link to={to} className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-plum-500 hover:text-plum-700">
            {linkLabel} <ArrowRight size={12} />
          </Link>
        )}
      </div>
      {children}
    </Card>
  );
}

// One labelled bar per row; `max` makes the bars comparable with each other.
function BarRow({ label, sub, value, admitted = 0, max, to, color = "#BD5579" }) {
  const body = (
    <>
      <span className="flex items-baseline justify-between gap-3 text-sm">
        <span className="min-w-0 truncate font-medium text-ink">{label}</span>
        <span className="shrink-0 tabular-nums text-ink-soft">
          <b className="text-ink">{value}</b> {value === 1 ? sub.replace("applicants", "applicant") : sub}
        </span>
      </span>
      <Meter
        label={`${label}: ${value}`}
        max={max}
        segments={[
          { label: "Admitted", value: admitted, color: STATUS_META.admitted.color },
          { label: "Other applicants", value: value - admitted, color },
        ]}
      />
    </>
  );
  const cls = "block space-y-1.5 rounded-md py-1";
  return to ? (
    <Link to={to} className={`${cls} hover:bg-plum-50/60`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export default function Overview() {
  // Two requests at once: aggregates (joins across tables) and the newest rows.
  const { data, error, loading, reload } = useAsync(
    (signal) => Promise.all([getStats(signal), listApplications({ sort: "newest" }, signal)]),
    [],
  );

  if (error && !data) return <ErrorBlock message={error} onRetry={reload} />;
  if (!data) return <LoadingBlock label="Loading the dashboard…" />;

  const [stats, applications] = data;
  const maxProgramme = Math.max(1, ...stats.byProgramme.map((p) => p.applicants));
  const maxCampus = Math.max(1, ...stats.byCampus.map((c) => c.applicants));
  const maxCaseload = Math.max(1, ...stats.byOfficer.map((o) => o.caseload));

  return (
    <div className={`space-y-8 transition-opacity ${loading ? "opacity-70" : ""}`}>
      <PageHeader
        eyebrow="Overview"
        title="Admissions at a glance"
        subtitle="Live numbers pulled from six linked tables: applications, programmes, campuses, officers, notes and the programme-campus link."
        actions={
          <Link to={path.applications} className={btnGhost}>
            Browse all applications
          </Link>
        }
      />

      <section aria-label="Summary" className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Applications" value={stats.total} hint={`Average 12th: ${stats.averagePct}%`} icon={ClipboardList} to={path.applications} />
        <StatCard
          label="Under review"
          value={stats.byStatus.review}
          color={STATUS_META.review.color}
          icon={Clock}
          to={applicationsWhere({ status: "review" })}
          hint="Waiting for a decision"
        />
        <StatCard
          label="Shortlisted"
          value={stats.byStatus.shortlisted}
          color={STATUS_META.shortlisted.color}
          icon={Sparkles}
          to={applicationsWhere({ status: "shortlisted" })}
          hint="Interview stage"
        />
        <StatCard
          label="Admitted"
          value={stats.byStatus.admitted}
          color={STATUS_META.admitted.color}
          icon={CheckCircle2}
          to={applicationsWhere({ status: "admitted" })}
          hint="Offer issued"
        />
        <StatCard
          label="Needs an officer"
          value={stats.unassigned}
          color="#BD5579"
          icon={UserX}
          to={applicationsWhere({ officerId: "none" })}
          hint="Open, not assigned"
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Applicants by programme" hint="Green = admitted. Seats come from the programmes table." to={path.programmes} linkLabel="Programmes">
          <div className="space-y-2">
            {stats.byProgramme.map((p) => (
              <BarRow
                key={p.id}
                label={p.name}
                sub={`applicants · ${p.admitted}/${p.seats} seats`}
                value={p.applicants}
                admitted={p.admitted}
                max={maxProgramme}
                to={applicationsWhere({ programmeId: p.id })}
                color="#601D49"
              />
            ))}
          </div>
        </Section>

        <Section title="Applicants by campus" hint="Joined with the campuses table." to={path.campuses} linkLabel="Campuses">
          <div className="space-y-2">
            {stats.byCampus.map((c) => (
              <BarRow
                key={c.id}
                label={c.name}
                sub="applicants"
                value={c.applicants}
                admitted={c.admitted}
                max={maxCampus}
                to={applicationsWhere({ campusId: c.id })}
                color="#218DAE"
              />
            ))}
          </div>
        </Section>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-6">
          <Section title="Decision pipeline" hint="Share of applications by status.">
            <Meter
              height="h-4"
              label="Applications by status"
              max={stats.total}
              segments={STATUS_KEYS.map((s) => ({ label: STATUS_META[s].label, value: stats.byStatus[s], color: STATUS_META[s].color }))}
            />
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {STATUS_KEYS.map((s) => (
                <li key={s}>
                  <Link to={applicationsWhere({ status: s })} className="flex items-center gap-2 hover:text-plum-600">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_META[s].color }} aria-hidden="true" />
                    <span className="text-ink-soft">{STATUS_META[s].label}</span>
                    <b className="ml-auto tabular-nums text-ink">{stats.byStatus[s]}</b>
                  </Link>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Team caseload" hint="Applications assigned to each officer." to={path.team} linkLabel="Team">
            <div className="space-y-2">
              {stats.byOfficer.map((o) => (
                <BarRow key={o.id} label={o.name} sub="assigned" value={o.caseload} max={maxCaseload} to={applicationsWhere({ officerId: o.id })} color="#BD5579" />
              ))}
            </div>
          </Section>
        </div>

        <Section title="Latest applications" hint="Each row is joined with its programme, campus and officer." to={path.applications} linkLabel="See all">
          <ul className="divide-y divide-paper-line">
            {applications.slice(0, 6).map((a) => (
              <li key={a.id}>
                <Link to={path.application(a.id)} className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-3 hover:bg-plum-50/60">
                  <Avatar name={a.name} id={a.id} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">{a.name}</span>
                    <span className="block truncate text-xs text-ink-soft">
                      {a.programme.name} · {a.campus.name}
                    </span>
                    <span className="block text-[11px] text-ink-faint">
                      {a.applicationNo} · {formatDate(a.createdAt)}
                      {a.officer ? ` · ${a.officer.name}` : " · unassigned"}
                    </span>
                  </span>
                  <StatusBadge status={a.status} />
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  );
}
