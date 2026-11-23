// Model layer for applications: validation + SQL. An application row only stores ids
// (programme_id, campus_id, officer_id); every read JOINs the other tables so the API can
// return the programme, campus and officer details alongside it.
const { run, get, all } = require("../database/db");

const STATUSES = ["review", "shortlisted", "admitted", "rejected"];

// Only these ORDER BY clauses can ever reach the SQL string (no injection via ?sort=).
const SORTS = {
  newest: "a.created_at DESC, a.id DESC",
  oldest: "a.created_at ASC, a.id ASC",
  name: "a.name COLLATE NOCASE ASC",
  marks: "a.twelfth_pct DESC",
};

// ---------- validation ----------
const positiveInt = (v) => {
  const n = typeof v === "string" && v.trim() === "" ? NaN : Number(v);
  return Number.isInteger(n) && n > 0;
};

const RULES = {
  name: (v) => (String(v ?? "").trim().length >= 3 ? null : "Name must be at least 3 characters"),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v ?? "").trim()) ? null : "Enter a valid email address"),
  phone: (v) => (/^[6-9]\d{9}$/.test(String(v ?? "").replace(/\s+/g, "")) ? null : "Enter a 10-digit mobile number"),
  programmeId: (v) => (positiveInt(v) ? null : "Choose a programme"),
  campusId: (v) => (positiveInt(v) ? null : "Choose a campus"),
  officerId: (v) => (v === undefined || v === null || v === "" || positiveInt(v) ? null : "Choose a valid officer"),
  twelfthPct: (v) => {
    const n = typeof v === "string" && v.trim() === "" ? NaN : Number(v);
    if (Number.isNaN(n) || n < 0 || n > 100) return "Enter a percentage between 0 and 100";
    return n >= 60 ? null : "Below the 60% eligibility cut-off";
  },
  status: (v) => (STATUSES.includes(v) ? null : "Status must be review, shortlisted, admitted or rejected"),
  sop: (v) => {
    const len = String(v ?? "").trim().length;
    if (len < 40) return "Statement of purpose must be at least 40 characters";
    return len <= 500 ? null : "Statement of purpose must be 500 characters or fewer";
  },
};

// Checks the shape of the body. Whether the ids exist, and whether the campus teaches the
// programme, needs the database, so the controller checks that next.
function validate(body = {}) {
  const input = { status: "review", ...body };
  const errors = {};
  for (const [field, rule] of Object.entries(RULES)) {
    const message = rule(input[field]);
    if (message) errors[field] = message;
  }
  const values = {
    name: String(input.name ?? "").trim(),
    email: String(input.email ?? "").trim().toLowerCase(),
    phone: String(input.phone ?? "").replace(/\s+/g, ""),
    programmeId: Number(input.programmeId),
    campusId: Number(input.campusId),
    officerId: input.officerId === undefined || input.officerId === null || input.officerId === "" ? null : Number(input.officerId),
    twelfthPct: Number(input.twelfthPct),
    status: input.status,
    sop: String(input.sop ?? "").trim(),
  };
  return { errors, values };
}

// ---------- reads ----------
const SELECT = `
  SELECT a.*,
         p.code AS programme_code, p.name AS programme_name, p.department, p.annual_fee, p.duration_years,
         c.name AS campus_name, c.city AS campus_city, c.state AS campus_state,
         o.name AS officer_name, o.designation AS officer_designation,
         (SELECT COUNT(*) FROM notes n WHERE n.application_id = a.id) AS note_count
    FROM applications a
    JOIN programmes p ON p.id = a.programme_id
    JOIN campuses   c ON c.id = a.campus_id
    LEFT JOIN officers o ON o.id = a.officer_id`;

const toApplication = (r) =>
  r && {
    id: r.id,
    applicationNo: r.application_no,
    name: r.name,
    email: r.email,
    phone: r.phone,
    twelfthPct: r.twelfth_pct,
    status: r.status,
    sop: r.sop,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    noteCount: r.note_count,
    programmeId: r.programme_id,
    campusId: r.campus_id,
    officerId: r.officer_id,
    programme: {
      id: r.programme_id,
      code: r.programme_code,
      name: r.programme_name,
      department: r.department,
      annualFee: r.annual_fee,
      durationYears: r.duration_years,
    },
    campus: { id: r.campus_id, name: r.campus_name, city: r.campus_city, state: r.campus_state },
    officer: r.officer_id ? { id: r.officer_id, name: r.officer_name, designation: r.officer_designation } : null,
  };

// Filters: q (search), programmeId, campusId, officerId ("none" = unassigned), status, sort.
// Every value is bound as a ? parameter, so user input is never concatenated into the SQL text.
async function findAll({ q, programmeId, campusId, officerId, status, sort } = {}) {
  const where = [];
  const params = [];
  if (programmeId) { where.push("a.programme_id = ?"); params.push(Number(programmeId)); }
  if (campusId) { where.push("a.campus_id = ?"); params.push(Number(campusId)); }
  if (officerId === "none") where.push("a.officer_id IS NULL");
  else if (officerId) { where.push("a.officer_id = ?"); params.push(Number(officerId)); }
  if (status) { where.push("a.status = ?"); params.push(status); }
  if (q) {
    const like = `%${String(q).trim().replace(/[\\%_]/g, "\\$&")}%`;
    where.push(
      `(a.name LIKE ? ESCAPE '\\' OR a.email LIKE ? ESCAPE '\\' OR a.application_no LIKE ? ESCAPE '\\'
        OR a.phone LIKE ? ESCAPE '\\' OR p.name LIKE ? ESCAPE '\\' OR c.name LIKE ? ESCAPE '\\')`
    );
    params.push(like, like, like, like, like, like);
  }
  const sql = `${SELECT}${where.length ? ` WHERE ${where.join(" AND ")}` : ""} ORDER BY ${SORTS[sort] ?? SORTS.newest}`;
  return (await all(sql, params)).map(toApplication);
}

const findById = async (id) => toApplication(await get(`${SELECT} WHERE a.id = ?`, [id]));

// Case-insensitive (the column uses COLLATE NOCASE). `exceptId` lets an edit keep its own email.
async function emailTaken(email, exceptId = null) {
  return Boolean(await get("SELECT id FROM applications WHERE email = ? AND id IS NOT ?", [email, exceptId]));
}

// Foreign-key checks, so the client gets a friendly message instead of a raw constraint error.
async function referenceErrors({ programmeId, campusId, officerId }, errors) {
  const found = {};
  if (!errors.programmeId && !(await get("SELECT 1 AS ok FROM programmes WHERE id = ?", [programmeId]))) found.programmeId = "This programme does not exist";
  if (!errors.campusId && !(await get("SELECT 1 AS ok FROM campuses WHERE id = ?", [campusId]))) found.campusId = "This campus does not exist";
  if (officerId !== null && !errors.officerId && !(await get("SELECT 1 AS ok FROM officers WHERE id = ?", [officerId]))) found.officerId = "This officer does not exist";
  if (!found.programmeId && !found.campusId && !errors.programmeId && !errors.campusId) {
    const offered = await get("SELECT 1 AS ok FROM programme_campuses WHERE programme_id = ? AND campus_id = ?", [programmeId, campusId]);
    if (!offered) found.campusId = "This programme is not taught at the selected campus";
  }
  return found;
}

// CU-ADM-<year>-<seq>: one higher than the largest sequence stored for that year.
async function nextApplicationNo(year = new Date().getFullYear()) {
  const prefix = `CU-ADM-${year}-`;
  const row = await get(
    "SELECT MAX(CAST(SUBSTR(application_no, ?) AS INTEGER)) AS seq FROM applications WHERE application_no LIKE ?",
    [prefix.length + 1, `${prefix}%`]
  );
  return `${prefix}${String((row?.seq ?? 0) + 1).padStart(4, "0")}`;
}

async function create(v) {
  const now = new Date().toISOString();
  const { lastID } = await run(
    `INSERT INTO applications
       (application_no, name, email, phone, programme_id, campus_id, officer_id, twelfth_pct, status, sop, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [await nextApplicationNo(), v.name, v.email, v.phone, v.programmeId, v.campusId, v.officerId, v.twelfthPct, v.status, v.sop, now, now]
  );
  return findById(lastID);
}

async function update(id, v) {
  const { changes } = await run(
    `UPDATE applications
        SET name = ?, email = ?, phone = ?, programme_id = ?, campus_id = ?, officer_id = ?,
            twelfth_pct = ?, status = ?, sop = ?, updated_at = ?
      WHERE id = ?`,
    [v.name, v.email, v.phone, v.programmeId, v.campusId, v.officerId, v.twelfthPct, v.status, v.sop, new Date().toISOString(), id]
  );
  return changes ? findById(id) : null;
}

// A quick change from the detail page: only the status and/or the assigned officer.
async function patch(id, fields) {
  const sets = [];
  const params = [];
  if ("status" in fields) { sets.push("status = ?"); params.push(fields.status); }
  if ("officerId" in fields) { sets.push("officer_id = ?"); params.push(fields.officerId); }
  sets.push("updated_at = ?");
  params.push(new Date().toISOString(), id);
  const { changes } = await run(`UPDATE applications SET ${sets.join(", ")} WHERE id = ?`, params);
  return changes ? findById(id) : null;
}

// Deleting an application also deletes its notes (ON DELETE CASCADE in the schema).
async function remove(id) {
  const { changes } = await run("DELETE FROM applications WHERE id = ?", [id]);
  return changes > 0;
}

module.exports = {
  STATUSES, SORTS,
  validate, referenceErrors, findAll, findById, emailTaken, create, update, patch, remove,
};
