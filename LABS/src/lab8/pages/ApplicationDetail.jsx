import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Building2, GraduationCap, MessageSquarePlus, Pencil, Trash2, UserRound } from "lucide-react";
import { addNote, deleteApplication, deleteNote, describeError, getApplication, patchApplication } from "../api.js";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { useToast } from "../components/Toast.jsx";
import { Avatar, Card, Chip, ErrorBlock, LoadingBlock, StatusBadge, btnDangerGhost, btnGhost, btnPrimary, inputClass } from "../components/ui.jsx";
import { applicationsWhere, path } from "../config.js";
import { useAsync } from "../hooks/useAsync.js";
import { useLookups } from "../hooks/useLookups.js";
import { STATUS_KEYS, STATUS_META, formatDate, formatDateTime, formatFee } from "../lib/format.js";

function Panel({ icon: Icon, title, children }) {
  return (
    <Card className="p-5">
      <h2 className="mb-3 flex items-center gap-2 font-serif text-base font-semibold text-plum-500">
        <Icon size={16} /> {title}
      </h2>
      {children}
    </Card>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5 text-sm">
      <dt className="shrink-0 text-ink-soft">{label}</dt>
      <dd className="text-right text-ink">{children}</dd>
    </div>
  );
}

// Route /applications/:id  ->  GET /api/applications/:id
// One response holds the application, its programme, campus, officer (joins) and its notes (child table).
export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const lookups = useLookups();
  const { data: application, error, loading, reload } = useAsync((signal) => getApplication(id, signal), [id]);

  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [note, setNote] = useState({ body: "", officerId: "" });
  const [noteError, setNoteError] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  // PATCH: change just the status or the officer, no full form needed.
  async function quickUpdate(fields, message) {
    try {
      await patchApplication(id, fields);
      toast.success(message);
      reload();
    } catch (err) {
      toast.error(describeError(err).message);
    }
  }

  async function submitNote(e) {
    e.preventDefault();
    setSavingNote(true);
    setNoteError("");
    try {
      await addNote(id, { body: note.body, officerId: note.officerId ? Number(note.officerId) : null });
      setNote((n) => ({ ...n, body: "" }));
      toast.success("Note added.");
      reload();
    } catch (err) {
      const { message, fieldErrors } = describeError(err);
      setNoteError(fieldErrors.body ?? fieldErrors.officerId ?? message);
    } finally {
      setSavingNote(false);
    }
  }

  async function removeNote(noteId) {
    try {
      await deleteNote(id, noteId);
      toast.success("Note deleted.");
      reload();
    } catch (err) {
      toast.error(describeError(err).message);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteApplication(id);
      toast.success("Application deleted.");
      navigate(path.applications);
    } catch (err) {
      toast.error(describeError(err).message);
      setConfirming(false);
      setDeleting(false);
    }
  }

  if (error && !application) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <ErrorBlock message={error} hint={false} onRetry={reload} />
        <Link to={path.applications} className="block text-center text-sm font-medium text-plum-500 hover:underline">
          ← Back to applications
        </Link>
      </div>
    );
  }
  if (!application) return <LoadingBlock label="Loading application…" />;

  const a = application;

  return (
    <div className={`space-y-6 transition-opacity ${loading ? "opacity-70" : ""}`}>
      <Link to={path.applications} className="inline-flex items-center gap-1.5 text-sm font-medium text-plum-500 hover:underline">
        <ArrowLeft size={14} /> All applications
      </Link>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 bg-gradient-to-r from-plum-50 to-rose-50 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-4">
            <Avatar name={a.name} id={a.id} size="lg" />
            <div>
              <p className="font-mono text-xs text-plum-500">{a.applicationNo}</p>
              <h1 className="font-serif text-2xl font-semibold text-ink">{a.name}</h1>
              <p className="text-sm text-ink-soft">
                Applied {formatDate(a.createdAt)} · updated {formatDate(a.updatedAt)}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={a.status} />
            <Link to={path.editApplication(a.id)} className={btnPrimary}>
              <Pencil size={14} /> Edit
            </Link>
            <button type="button" onClick={() => setConfirming(true)} className={btnDangerGhost}>
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>

        <div className="grid gap-x-8 gap-y-5 border-t border-paper-line p-5 sm:grid-cols-2 sm:p-6">
          <div>
            <p className="stamp-label mb-1">Contact</p>
            <dl className="divide-y divide-paper-line/70">
              <Row label="Email"><a href={`mailto:${a.email}`} className="text-plum-500 hover:underline">{a.email}</a></Row>
              <Row label="Mobile">{a.phone}</Row>
              <Row label="12th percentage"><b>{a.twelfthPct}%</b></Row>
            </dl>
          </div>
          <div>
            <p className="stamp-label mb-1">Statement of purpose</p>
            <p className="whitespace-pre-line text-sm leading-relaxed text-ink-soft">{a.sop}</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel icon={GraduationCap} title="Programme">
          <p className="font-medium text-ink">{a.programme.name}</p>
          <dl className="mt-2 divide-y divide-paper-line/70">
            <Row label="Code"><span className="font-mono text-xs">{a.programme.code}</span></Row>
            <Row label="Department">{a.programme.department}</Row>
            <Row label="Duration">{a.programme.durationYears} years</Row>
            <Row label="Annual fee">{formatFee(a.programme.annualFee)}</Row>
          </dl>
          <Link to={applicationsWhere({ programmeId: a.programmeId })} className="mt-3 inline-block text-xs font-medium text-plum-500 hover:underline">
            Other applicants for {a.programme.code} →
          </Link>
        </Panel>

        <Panel icon={Building2} title="Campus">
          <p className="font-medium text-ink">{a.campus.name}</p>
          <dl className="mt-2 divide-y divide-paper-line/70">
            <Row label="City">{a.campus.city}</Row>
            <Row label="State">{a.campus.state}</Row>
          </dl>
          <Link to={applicationsWhere({ campusId: a.campusId })} className="mt-3 inline-block text-xs font-medium text-plum-500 hover:underline">
            Other applicants at this campus →
          </Link>
        </Panel>

        <Panel icon={UserRound} title="Handling">
          <label htmlFor="quick-status" className="mb-1 block text-xs font-medium text-ink-soft">Status</label>
          <select id="quick-status" value={a.status} onChange={(e) => quickUpdate({ status: e.target.value }, `Status changed to ${STATUS_META[e.target.value].label}.`)} className={inputClass}>
            {STATUS_KEYS.map((s) => (
              <option key={s} value={s}>{STATUS_META[s].label}</option>
            ))}
          </select>
          <label htmlFor="quick-officer" className="mb-1 mt-3 block text-xs font-medium text-ink-soft">Assigned officer</label>
          <select
            id="quick-officer"
            value={a.officerId ?? ""}
            onChange={(e) => quickUpdate({ officerId: e.target.value ? Number(e.target.value) : null }, e.target.value ? "Officer assigned." : "Officer removed.")}
            className={inputClass}
          >
            <option value="">Unassigned</option>
            {lookups.officers.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
          {a.officer && <p className="mt-2 text-xs text-ink-soft">{a.officer.designation}</p>}
        </Panel>
      </div>

      <Card className="p-5 sm:p-6">
        <h2 className="mb-4 flex items-center gap-2 font-serif text-lg font-semibold text-plum-500">
          <MessageSquarePlus size={18} /> Officer notes <Chip>{a.notes.length}</Chip>
        </h2>

        <form onSubmit={submitNote} className="mb-6 grid gap-3 sm:grid-cols-[1fr_14rem_auto] sm:items-end">
          <div>
            <label htmlFor="note-body" className="mb-1 block text-xs font-medium text-ink-soft">Add a note</label>
            <input
              id="note-body"
              value={note.body}
              onChange={(e) => setNote({ ...note, body: e.target.value })}
              placeholder="e.g. Interview scheduled for Tuesday"
              aria-invalid={Boolean(noteError)}
              aria-describedby={noteError ? "note-error" : undefined}
              className={`${inputClass} ${noteError ? "!border-red-500" : ""}`}
            />
          </div>
          <div>
            <label htmlFor="note-officer" className="mb-1 block text-xs font-medium text-ink-soft">Written by</label>
            <select id="note-officer" value={note.officerId} onChange={(e) => setNote({ ...note, officerId: e.target.value })} className={inputClass}>
              <option value="">Nobody in particular</option>
              {lookups.officers.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={savingNote} className={btnGhost}>
            {savingNote ? "Adding…" : "Add note"}
          </button>
          {noteError && (
            <p id="note-error" className="text-xs font-medium text-red-600 sm:col-span-3">{noteError}</p>
          )}
        </form>

        {a.notes.length === 0 ? (
          <p className="text-sm text-ink-soft">No notes yet.</p>
        ) : (
          <ol className="relative space-y-4 border-l-2 border-plum-100 pl-5">
            {a.notes.map((n) => (
              <li key={n.id} className="relative">
                <span className="absolute -left-[1.62rem] top-1.5 h-2.5 w-2.5 rounded-full bg-plum-400 ring-4 ring-paper-light" aria-hidden="true" />
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-ink">{n.body}</p>
                  <button
                    type="button"
                    onClick={() => removeNote(n.id)}
                    aria-label="Delete note"
                    className="shrink-0 rounded p-1 text-ink-faint hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="mt-0.5 text-xs text-ink-faint">
                  {n.officer ? n.officer.name : "Unknown"} · {formatDateTime(n.createdAt)}
                </p>
              </li>
            ))}
          </ol>
        )}
      </Card>

      <ConfirmDialog
        open={confirming}
        title="Delete this application?"
        message={`${a.name} (${a.applicationNo}) and its ${a.notes.length} note${a.notes.length === 1 ? "" : "s"} will be permanently removed.`}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
