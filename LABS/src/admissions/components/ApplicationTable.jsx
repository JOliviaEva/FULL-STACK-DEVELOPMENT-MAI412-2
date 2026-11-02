import ApplicationRow from "./ApplicationRow.jsx";

export default function ApplicationTable({ applications, editingId, flashId, onEdit, onDelete }) {
  return (
    <div className="uai-table-wrap">
      <table className="uai-table">
        <thead>
          <tr>
            <th scope="col">Applicant</th>
            <th scope="col">Programme &amp; campus</th>
            <th scope="col">Fit score &amp; status</th>
            <th scope="col">
              <span className="uai-sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <ApplicationRow
              key={app.id}
              app={app}
              isEditing={app.id === editingId}
              isFlashing={app.id === flashId}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
