import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { createApplication, describeError, getApplication, updateApplication } from "../api.js";
import ApplicationForm from "../components/ApplicationForm.jsx";
import { useToast } from "../components/Toast.jsx";
import { ErrorBlock, LoadingBlock, PageHeader } from "../components/ui.jsx";
import { path } from "../config.js";
import { useAsync } from "../hooks/useAsync.js";
import { useLookups } from "../hooks/useLookups.js";
import { applicationToForm, applicationToPayload } from "../lib/validate.js";

// One page for both routes: /applications/new (create) and /applications/:id/edit (update).
export default function ApplicationEdit() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const lookups = useLookups();

  // Edit mode also loads the application itself (a path-parameter GET).
  const existing = useAsync((signal) => (editing ? getApplication(id, signal) : Promise.resolve(null)), [id]);

  const [serverErrors, setServerErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(values) {
    setSubmitting(true);
    setServerErrors({});
    try {
      const payload = applicationToPayload(values);
      if (editing) {
        await updateApplication(id, payload);
        toast.success("Application updated.");
        navigate(path.application(id));
      } else {
        const created = await createApplication(payload);
        toast.success(`Application ${created.applicationNo} created.`);
        navigate(path.application(created.id));
      }
    } catch (err) {
      // 400 = failed server validation, 409 = duplicate email: show the messages next to the fields.
      const { message, fieldErrors } = describeError(err);
      setServerErrors(fieldErrors);
      toast.error(Object.keys(fieldErrors).length ? "Please fix the highlighted fields." : message);
    } finally {
      setSubmitting(false);
    }
  }

  const error = lookups.error || existing.error;
  const ready = lookups.ready && !existing.loading && !existing.error;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to={editing ? path.application(id) : path.applications} className="inline-flex items-center gap-1.5 text-sm font-medium text-plum-500 hover:underline">
        <ArrowLeft size={14} /> Back
      </Link>
      <PageHeader
        eyebrow={editing ? "Edit" : "New"}
        title={editing ? "Edit application" : "New application"}
        subtitle={editing ? existing.data?.applicationNo : "Programme and campus come from their own tables: pick a programme and the campuses that teach it appear."}
      />
      {error && <ErrorBlock message={error} onRetry={() => (lookups.reload(), existing.reload())} />}
      {!error && !ready && <LoadingBlock />}
      {!error && ready && (
        <ApplicationForm
          initial={existing.data ? applicationToForm(existing.data) : undefined}
          programmes={lookups.programmes}
          officers={lookups.officers}
          serverErrors={serverErrors}
          submitting={submitting}
          submitLabel={editing ? "Save changes" : "Create application"}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
