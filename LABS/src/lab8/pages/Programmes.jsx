import { useState } from "react";
import { Link } from "react-router-dom";
import { Clock, Pencil, Plus, Trash2, Users } from "lucide-react";
import { createProgramme, deleteProgramme, describeError, listCampuses, listProgrammes, updateProgramme } from "../api.js";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import ProgrammeDialog from "../components/ProgrammeDialog.jsx";
import { useToast } from "../components/Toast.jsx";
import { Card, Chip, EmptyBlock, ErrorBlock, LoadingBlock, Meter, PageHeader, btnPrimary, btnSmall } from "../components/ui.jsx";
import { applicationsWhere } from "../config.js";
import { useAsync } from "../hooks/useAsync.js";
import { STATUS_META, formatFee, percent } from "../lib/format.js";
import { programmeToPayload } from "../lib/validate.js";

const NONE = {};

export default function Programmes() {
  const toast = useToast();
  // Two tables at once: programmes (with seat counts joined from applications) and campuses (for the form).
  const { data, error, loading, reload } = useAsync(
    async (signal) => {
      const [programmes, campuses] = await Promise.all([listProgrammes(signal), listCampuses(signal)]);
      return { programmes, campuses };
    },
    [],
  );

  const [dialog, setDialog] = useState(null); // null | { programme?: {...} }
  const [serverErrors, setServerErrors] = useState(NONE);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const openDialog = (programme) => {
    setServerErrors(NONE);
    setDialog({ programme });
  };

  async function save(values) {
    setSaving(true);
    setServerErrors(NONE);
    try {
      const payload = programmeToPayload(values);
      if (dialog.programme) {
        await updateProgramme(dialog.programme.id, payload);
        toast.success(`${payload.name} updated.`);
      } else {
        await createProgramme(payload);
        toast.success(`${payload.name} added.`);
      }
      setDialog(null);
      reload();
    } catch (err) {
      // 400 invalid, 409 duplicate code/name, or a rule that depends on existing applications
      const { message, fieldErrors } = describeError(err);
      setServerErrors(Object.keys(fieldErrors).length ? fieldErrors : NONE);
      toast.error(Object.keys(fieldErrors).length ? "Please fix the highlighted fields." : message);
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await deleteProgramme(pendingDelete.id);
      toast.success(`${pendingDelete.name} deleted.`);
      reload();
    } catch (err) {
      // The server refuses (409) while applications still reference the programme.
      toast.error(describeError(err).message);
    } finally {
      setPendingDelete(null);
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Programmes"
        title="Programmes"
        subtitle="Seats, fees and where each programme is taught. Applicant counts are calculated from the applications table."
        actions={
          <button type="button" onClick={() => openDialog(undefined)} className={btnPrimary} disabled={!data}>
            <Plus size={16} /> New programme
          </button>
        }
      />

      {error && !data && <ErrorBlock message={error} onRetry={reload} />}
      {!data && !error && <LoadingBlock label="Loading programmes…" />}

      {data && data.programmes.length === 0 && <EmptyBlock title="No programmes yet">Add one to start taking applications.</EmptyBlock>}

      {data && (
        <div className={`grid gap-5 md:grid-cols-2 ${loading ? "opacity-70" : ""}`}>
          {data.programmes.map((p) => (
            <Card key={p.id} className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[11px] tracking-wider text-plum-500">{p.code}</p>
                  <h2 className="font-serif text-xl font-semibold text-ink">{p.name}</h2>
                  <p className="text-sm text-ink-soft">{p.department}</p>
                </div>
                <div className="text-right">
                  <p className="font-serif text-2xl font-semibold text-plum-500">{formatFee(p.annualFee)}</p>
                  <p className="text-xs text-ink-faint">per year</p>
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-1.5 flex items-baseline justify-between text-sm">
                  <span className="text-ink-soft">
                    <b className="text-ink">{p.admitted}</b> admitted of {p.seats} seats
                  </span>
                  <span className="font-medium text-green-700">{p.seatsLeft} left</span>
                </div>
                <Meter
                  label={`${p.admitted} of ${p.seats} seats filled`}
                  max={p.seats}
                  segments={[
                    { label: "Admitted", value: p.admitted, color: STATUS_META.admitted.color },
                    { label: "Shortlisted", value: p.shortlisted, color: STATUS_META.shortlisted.color },
                  ]}
                />
                <p className="mt-1.5 flex items-center gap-3 text-xs text-ink-soft">
                  <span className="inline-flex items-center gap-1"><Users size={12} /> {p.applicants} applicant{p.applicants === 1 ? "" : "s"}</span>
                  <span className="inline-flex items-center gap-1"><Clock size={12} /> {p.durationYears} years</span>
                  <span>{percent(p.admitted + p.shortlisted, p.seats)}% reserved</span>
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {p.campuses.map((c) => (
                  <Chip key={c.id} to={applicationsWhere({ programmeId: p.id, campusId: c.id })}>{c.name}</Chip>
                ))}
              </div>

              <div className="mt-auto flex items-center justify-between gap-2 border-t border-paper-line pt-3 mt-5">
                <Link to={applicationsWhere({ programmeId: p.id })} className="text-sm font-medium text-plum-500 hover:underline">
                  View applications →
                </Link>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => openDialog(p)} className={`${btnSmall} inline-flex items-center gap-1 text-ink-soft hover:bg-paper-dark`}>
                    <Pencil size={12} /> Edit
                  </button>
                  <button type="button" onClick={() => setPendingDelete(p)} className={`${btnSmall} inline-flex items-center gap-1 text-red-600 hover:bg-red-50`}>
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {dialog && data && (
        <ProgrammeDialog
          programme={dialog.programme}
          campuses={data.campuses}
          serverErrors={serverErrors}
          submitting={saving}
          onSubmit={save}
          onClose={() => setDialog(null)}
        />
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this programme?"
        message={
          pendingDelete
            ? pendingDelete.applicants
              ? `${pendingDelete.name} still has ${pendingDelete.applicants} application${pendingDelete.applicants === 1 ? "" : "s"}. The database will refuse to delete it until they are removed.`
              : `${pendingDelete.name} has no applications and will be permanently removed.`
            : ""
        }
        busy={deleting}
        confirmLabel="Try to delete"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
