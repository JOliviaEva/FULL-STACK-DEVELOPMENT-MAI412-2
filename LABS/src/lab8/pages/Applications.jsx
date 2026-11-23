import { useCallback, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { deleteApplication, describeError, listApplications } from "../api.js";
import ApplicationTable from "../components/ApplicationTable.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import FilterBar from "../components/FilterBar.jsx";
import { useToast } from "../components/Toast.jsx";
import { EmptyBlock, ErrorBlock, LoadingBlock, PageHeader, btnPrimary } from "../components/ui.jsx";
import { path } from "../config.js";
import { useAsync } from "../hooks/useAsync.js";
import { useLookups } from "../hooks/useLookups.js";

const FILTER_KEYS = ["q", "programmeId", "campusId", "officerId", "status", "sort"];

export default function Applications() {
  const toast = useToast();
  const lookups = useLookups(); // programmes + campuses + officers for the dropdowns

  // Filters live in the URL (?programmeId=3&status=review) so a refresh or a shared link keeps them.
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = Object.fromEntries(FILTER_KEYS.map((key) => [key, searchParams.get(key) ?? (key === "sort" ? "newest" : "")]));

  // READ: whenever a filter changes, ask the server for the matching, joined rows.
  const { data: applications, error, loading, reload } = useAsync((signal) => listApplications(filters, signal), [filters]);

  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [clearCount, setClearCount] = useState(0); // remounts the search box so its text resets too

  const setFilter = useCallback(
    (key, value) =>
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value && !(key === "sort" && value === "newest")) next.set(key, value);
          else next.delete(key);
          return next;
        },
        { replace: true },
      ),
    [setSearchParams],
  );

  const clearFilters = () => {
    setSearchParams({}, { replace: true });
    setClearCount((n) => n + 1);
  };

  async function confirmDelete() {
    setDeleting(true);
    try {
      await deleteApplication(pendingDelete.id);
      toast.success(`${pendingDelete.name}'s application was deleted.`);
      reload();
    } catch (err) {
      toast.error(describeError(err).message);
    } finally {
      setPendingDelete(null);
      setDeleting(false);
    }
  }

  const filtered = FILTER_KEYS.some((key) => key !== "sort" && filters[key]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Applications"
        title="Applications"
        subtitle="Search and filter every application. Programme, campus and officer are joined in from their own tables."
        actions={
          <Link to={path.newApplication} className={btnPrimary}>
            <Plus size={16} /> New application
          </Link>
        }
      />

      <FilterBar
        filters={filters}
        programmes={lookups.programmes}
        campuses={lookups.campuses}
        officers={lookups.officers}
        resetKey={clearCount}
        onChange={setFilter}
        onClear={clearFilters}
      />

      <section aria-label="Results" aria-busy={loading}>
        {error && !applications && <ErrorBlock message={error} onRetry={reload} />}
        {!applications && !error && <LoadingBlock label="Loading applications…" />}

        {applications && (
          <div className={`transition-opacity ${loading ? "opacity-60" : ""}`}>
            <p className="mb-2 text-sm text-ink-soft" aria-live="polite">
              Showing <b className="text-ink">{applications.length}</b> application{applications.length === 1 ? "" : "s"}
              {filtered && " matching your filters"}
            </p>
            {applications.length === 0 ? (
              <EmptyBlock title={filtered ? "No applications match these filters" : "No applications yet"}>
                {filtered ? (
                  <button type="button" onClick={clearFilters} className="font-medium text-plum-500 hover:underline">
                    Clear the filters
                  </button>
                ) : (
                  <Link to={path.newApplication} className="font-medium text-plum-500 hover:underline">
                    Add the first one
                  </Link>
                )}
              </EmptyBlock>
            ) : (
              <ApplicationTable applications={applications} onDelete={setPendingDelete} />
            )}
          </div>
        )}
      </section>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this application?"
        message={pendingDelete ? `${pendingDelete.name} (${pendingDelete.applicationNo}) and its notes will be permanently removed.` : ""}
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
