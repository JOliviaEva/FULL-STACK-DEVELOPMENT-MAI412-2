import { Link } from "react-router-dom";
import { path } from "../config.js";
import { formatDate } from "../lib/format.js";
import { Avatar, StatusBadge, btnSmall } from "./ui.jsx";

function Officer({ officer }) {
  return officer ? (
    <span className="inline-flex items-center gap-2">
      <Avatar name={officer.name} id={officer.id} size="sm" />
      <span className="whitespace-nowrap text-ink">{officer.name}</span>
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full border border-dashed border-rose-300 px-2 py-0.5 text-xs text-rose-600">Unassigned</span>
  );
}

function Actions({ application, onDelete }) {
  return (
    <div className="flex items-center gap-1">
      <Link to={path.application(application.id)} className={`${btnSmall} text-plum-500 hover:bg-plum-50`}>
        View
      </Link>
      <Link to={path.editApplication(application.id)} className={`${btnSmall} text-ink-soft hover:bg-paper-dark`}>
        Edit
      </Link>
      <button type="button" onClick={() => onDelete(application)} className={`${btnSmall} text-red-600 hover:bg-red-50`}>
        Delete
      </button>
    </div>
  );
}

// A table from md upwards, a stack of cards on phones. Every field of programme / campus / officer
// comes from a JOIN done by the server.
export default function ApplicationTable({ applications, onDelete }) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-paper-line/80 bg-paper-light shadow-paper md:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Admission applications</caption>
          <thead className="bg-paper-dark/60 text-[11px] uppercase tracking-wider text-ink-soft">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Applicant</th>
              <th scope="col" className="px-4 py-3 font-semibold">Programme</th>
              <th scope="col" className="px-4 py-3 font-semibold">Campus</th>
              <th scope="col" className="px-4 py-3 font-semibold">Officer</th>
              <th scope="col" className="whitespace-nowrap px-4 py-3 text-right font-semibold">12th %</th>
              <th scope="col" className="px-4 py-3 font-semibold">Status</th>
              <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-paper-line/70">
            {applications.map((a) => (
              <tr key={a.id} className="hover:bg-white/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={a.name} id={a.id} />
                    <div className="min-w-0">
                      <Link to={path.application(a.id)} className="font-medium text-ink hover:text-plum-500">
                        {a.name}
                      </Link>
                      <div className="truncate text-xs text-ink-soft">{a.applicationNo} · {formatDate(a.createdAt)}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-ink">{a.programme.name}</div>
                  <div className="font-mono text-[11px] text-ink-faint">{a.programme.code}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-ink">{a.campus.name}</div>
                  <div className="text-xs text-ink-faint">{a.campus.city}</div>
                </td>
                <td className="px-4 py-3"><Officer officer={a.officer} /></td>
                <td className="px-4 py-3 text-right font-medium tabular-nums text-ink">{a.twelfthPct}</td>
                <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                <td className="px-3 py-3"><Actions application={a} onDelete={onDelete} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {applications.map((a) => (
          <li key={a.id} className="rounded-xl border border-paper-line/80 bg-paper-light p-4 shadow-paper">
            <div className="flex items-start gap-3">
              <Avatar name={a.name} id={a.id} />
              <div className="min-w-0 flex-1">
                <Link to={path.application(a.id)} className="font-semibold text-ink">
                  {a.name}
                </Link>
                <p className="truncate text-xs text-ink-soft">{a.applicationNo}</p>
              </div>
              <StatusBadge status={a.status} />
            </div>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
              <dt className="text-ink-faint">Programme</dt>
              <dd className="text-right text-ink">{a.programme.name}</dd>
              <dt className="text-ink-faint">Campus</dt>
              <dd className="text-right text-ink">{a.campus.name}</dd>
              <dt className="text-ink-faint">Officer</dt>
              <dd className="flex justify-end"><Officer officer={a.officer} /></dd>
              <dt className="text-ink-faint">12th %</dt>
              <dd className="text-right text-ink">{a.twelfthPct}</dd>
            </dl>
            <div className="mt-3 border-t border-paper-line pt-2">
              <Actions application={a} onDelete={onDelete} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
