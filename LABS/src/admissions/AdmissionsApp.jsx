import { useCallback, useEffect, useRef, useState } from "react";
import { Database, Moon, RefreshCw, SearchX, Sun } from "lucide-react";
import { useApplications } from "./useApplications.js";
import { JSON_SERVER } from "./backends.js";
import { STATUSES, SORT_OPTIONS, fitScore, matchesFilters, selectApplications } from "./model.js";
import ApplicationForm from "./components/ApplicationForm.jsx";
import ApplicationTable from "./components/ApplicationTable.jsx";
import Button from "./components/Button.jsx";
import ConfirmDialog from "./components/ConfirmDialog.jsx";
import RadioGroup from "./components/RadioGroup.jsx";
import SearchBar from "./components/SearchBar.jsx";
import SelectField from "./components/SelectField.jsx";
import StatCard from "./components/StatCard.jsx";
import Toast from "./components/Toast.jsx";
import "./admissions.css";

// Shared with the Lab 3 page so the theme choice carries across.
const THEME_KEY = "uniai-theme";

function readTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // storage blocked: fall through to the OS preference
  }
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export default function AdmissionsApp({ standalone = false, backend = JSON_SERVER }) {
  const { applications, status, error, reload, addApplication, updateApplication, removeApplication } =
    useApplications(backend.api);

  const [theme, setTheme] = useState(readTheme);
  const [editingId, setEditingId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [toast, setToast] = useState(null);
  const [flashId, setFlashId] = useState(null);
  const formPanelRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // not persisted; the toggle still works for this visit
    }
  }, [theme]);

  // Clear the "just saved" row highlight once its animation has played.
  useEffect(() => {
    if (!flashId) return;
    const timer = setTimeout(() => setFlashId(null), 1800);
    return () => clearTimeout(timer);
  }, [flashId]);

  const notify = (message, tone = "success") => setToast({ id: Date.now(), message, tone });
  const dismissToast = useCallback(() => setToast(null), []);

  const editing = applications.find((app) => app.id === editingId) ?? null;
  const visible = selectApplications(applications, { query, status: statusFilter, sort: sortBy });

  const shortlisted = applications.filter((a) => a.status === "shortlisted").length;
  const admitted = applications.filter((a) => a.status === "admitted").length;
  const avgFit = applications.length
    ? Math.round(applications.reduce((sum, a) => sum + fitScore(a.twelfthPct, a.sop), 0) / applications.length)
    : 0;

  const filterOptions = [
    { value: "all", label: "All", count: applications.length },
    ...STATUSES.map((s) => ({ ...s, count: applications.filter((a) => a.status === s.value).length })),
  ];

  // CREATE + UPDATE share one submit handler; the form tells us which by `editing`.
  async function handleSave(values) {
    try {
      if (editing) {
        const saved = await updateApplication(editing, values);
        setEditingId(null);
        setFlashId(saved.id);
        notify(`Saved changes to ${saved.name}`);
      } else {
        const saved = await addApplication(values);
        if (!matchesFilters(saved, { query, status: statusFilter })) {
          setQuery("");
          setStatusFilter("all");
        }
        setFlashId(saved.id);
        notify(`Added ${saved.name} · ${saved.applicationNo}`);
      }
      return true;
    } catch (err) {
      notify(err.message, "error");
      return false;
    }
  }

  function handleEdit(app) {
    setEditingId(app.id);
    formPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  // DELETE: confirmed through the dialog first.
  async function confirmDelete() {
    const target = pendingDelete;
    setDeleting(true);
    try {
      await removeApplication(target.id);
      if (editingId === target.id) setEditingId(null);
      notify(`Deleted ${target.name}'s application`);
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  }

  const pill = {
    loading: { label: "Connecting…", tone: "var(--amber)" },
    ready: { label: backend.liveLabel, tone: "var(--green)" },
    error: { label: backend.offlineLabel, tone: "var(--red)" },
  }[status];

  return (
    <div className={`uai${standalone ? " uai--standalone" : ""}`} data-theme={theme}>
      <div className="uai-shell">
        <header className="uai-top">
          <div className="uai-brand">
            <span className="uai-brand-logo">
              <img src="/christ-university-logo.png" alt="CHRIST (Deemed to be University)" />
            </span>
            <div>
              <b>UniAI ERP</b>
              <small>Admissions Desk</small>
            </div>
          </div>
          <div className="uai-top-actions">
            <span className="uai-pill" style={{ "--c": pill.tone }}>
              <i className="uai-dot" aria-hidden="true" />
              {pill.label}
            </span>
            <button
              type="button"
              className="uai-theme-btn"
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              title="Switch theme"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </header>

        <section className="uai-hero">
          <p className="uai-eyebrow">
            <span className="uai-dot" style={{ background: "var(--teal)" }} aria-hidden="true" />
            Module · Admissions
          </p>
          <h1 className="uai-h1">
            Every application, <em>one desk.</em>
          </h1>
          <p className="uai-lede">
            Create, review, update and remove admission applications. Every change is written to{" "}
            <code>{backend.store}</code> through {backend.name} and scored by the Lab 3 AI screening model.
          </p>
        </section>

        <section className="uai-stats" aria-label="Summary">
          <StatCard label="Applications" value={applications.length} note={`records in ${backend.store}`} />
          <StatCard label="Shortlisted" value={shortlisted} note="invited to interview" accent="var(--teal)" />
          <StatCard label="Admitted" value={admitted} note="offers released" accent="var(--green)" />
          <StatCard label="Avg. fit score" value={avgFit} note="AI screening model" accent="var(--rose)" />
        </section>

        <div className="uai-main">
          <aside className="uai-panel uai-form-panel" ref={formPanelRef} aria-label="Application form">
            <ApplicationForm
              key={editing?.id ?? "new"}
              editing={editing}
              onSubmit={handleSave}
              onCancel={() => setEditingId(null)}
            />
          </aside>

          <section className="uai-panel uai-records" aria-labelledby="uai-records-title">
            <div className="uai-panel-head">
              <div>
                <p className="uai-label">Read · search · filter</p>
                <h2 id="uai-records-title" className="uai-h3">
                  Applications
                </h2>
              </div>
              {status === "ready" && (
                <p className="uai-mono-note">
                  Showing {visible.length} of {applications.length}
                </p>
              )}
            </div>

            <div className="uai-toolbar">
              <SearchBar value={query} onChange={setQuery} placeholder="Search name, email, programme, campus…" />
              <SelectField
                name="sort"
                label="Sort"
                options={SORT_OPTIONS}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                compact
              />
            </div>

            <RadioGroup
              name="status-filter"
              legend="Filter by status"
              hideLegend
              options={filterOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />

            {status === "loading" && (
              <div className="uai-state" aria-busy="true">
                <span className="uai-spinner" aria-hidden="true" />
                Loading applications from {backend.name}…
              </div>
            )}

            {status === "error" && (
              <div className="uai-state is-error" role="alert">
                <Database size={22} aria-hidden="true" />
                <p className="uai-state-title">Couldn&rsquo;t reach the database</p>
                <p>{error}</p>
                <p>{backend.startHint}</p>
                <Button icon={RefreshCw} onClick={reload}>
                  Retry
                </Button>
              </div>
            )}

            {status === "ready" && applications.length === 0 && (
              <div className="uai-state">
                <p className="uai-state-title">No applications yet</p>
                <p>Add the first one with the form.</p>
              </div>
            )}

            {status === "ready" && applications.length > 0 && visible.length === 0 && (
              <div className="uai-state">
                <SearchX size={22} aria-hidden="true" />
                <p className="uai-state-title">No applications match</p>
                <p>Try a different search term or status filter.</p>
                <Button
                  onClick={() => {
                    setQuery("");
                    setStatusFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}

            {status === "ready" && visible.length > 0 && (
              <ApplicationTable
                applications={visible}
                editingId={editingId}
                flashId={flashId}
                onEdit={handleEdit}
                onDelete={setPendingDelete}
              />
            )}
          </section>
        </div>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this application?"
        confirmLabel="Delete"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      >
        {pendingDelete && (
          <p>
            <b>{pendingDelete.name}</b> ({pendingDelete.applicationNo}) will be removed from <code>{backend.store}</code>. This
            can&rsquo;t be undone.
          </p>
        )}
      </ConfirmDialog>

      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  );
}
