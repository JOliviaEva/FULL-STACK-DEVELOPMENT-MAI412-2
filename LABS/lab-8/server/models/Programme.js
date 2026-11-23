const { run, get, all, transaction } = require("../database/db");

// ---------- validation ----------
const isInt = (v) => Number.isInteger(typeof v === "string" && v.trim() !== "" ? Number(v) : v);
const inRange = (v, min, max) => isInt(v) && Number(v) >= min && Number(v) <= max;

const RULES = {
  code: (v) => (/^[A-Za-z0-9-]{2,12}$/.test(String(v ?? "").trim()) ? null : "2-12 letters, digits or dashes"),
  name: (v) => {
    const n = String(v ?? "").trim().length;
    return n >= 2 && n <= 60 ? null : "Name must be 2-60 characters";
  },
  department: (v) => {
    const n = String(v ?? "").trim().length;
    return n >= 3 && n <= 80 ? null : "Department must be 3-80 characters";
  },
  durationYears: (v) => (inRange(v, 1, 6) ? null : "Duration must be 1-6 years"),
  seats: (v) => (inRange(v, 1, 2000) ? null : "Seats must be a whole number from 1 to 2000"),
  annualFee: (v) => (inRange(v, 0, 5000000) ? null : "Fee must be a whole number of rupees (0-50,00,000)"),
  campusIds: (v) =>
    Array.isArray(v) && v.length > 0 && v.every((id) => isInt(id) && Number(id) > 0)
      ? null
      : "Pick at least one campus",
};

function validate(body = {}) {
  const errors = {};
  for (const [field, rule] of Object.entries(RULES)) {
    const message = rule(body[field]);
    if (message) errors[field] = message;
  }
  const values = {
    code: String(body.code ?? "").trim().toUpperCase(),
    name: String(body.name ?? "").trim(),
    department: String(body.department ?? "").trim(),
    durationYears: Number(body.durationYears),
    seats: Number(body.seats),
    annualFee: Number(body.annualFee),
    campusIds: Array.isArray(body.campusIds) ? [...new Set(body.campusIds.map(Number))] : [],
  };
  return { errors, values };
}

// ---------- reads ----------
// Seat usage comes from the applications table: one sub-select per number we need.
const SELECT = `
  SELECT p.*,
         (SELECT COUNT(*) FROM applications a WHERE a.programme_id = p.id)                        AS applicants,
         (SELECT COUNT(*) FROM applications a WHERE a.programme_id = p.id AND a.status = 'admitted')    AS admitted,
         (SELECT COUNT(*) FROM applications a WHERE a.programme_id = p.id AND a.status = 'shortlisted') AS shortlisted
    FROM programmes p`;

const toProgramme = (r, campuses = []) =>
  r && {
    id: r.id,
    code: r.code,
    name: r.name,
    department: r.department,
    durationYears: r.duration_years,
    seats: r.seats,
    annualFee: r.annual_fee,
    applicants: r.applicants,
    admitted: r.admitted,
    shortlisted: r.shortlisted,
    seatsLeft: r.seats - r.admitted,
    campuses,
  };

// programme_campuses JOIN campuses -> the campuses where each programme is taught
async function campusesFor(programmeIds) {
  if (!programmeIds.length) return new Map();
  const marks = programmeIds.map(() => "?").join(",");
  const rows = await all(
    `SELECT pc.programme_id, c.id, c.name, c.city
       FROM programme_campuses pc JOIN campuses c ON c.id = pc.campus_id
      WHERE pc.programme_id IN (${marks}) ORDER BY c.name`,
    programmeIds
  );
  const map = new Map();
  for (const { programme_id, ...campus } of rows) map.set(programme_id, [...(map.get(programme_id) ?? []), campus]);
  return map;
}

async function findAll() {
  const rows = await all(`${SELECT} ORDER BY p.name COLLATE NOCASE`);
  const campuses = await campusesFor(rows.map((r) => r.id));
  return rows.map((r) => toProgramme(r, campuses.get(r.id) ?? []));
}

async function findById(id) {
  const row = await get(`${SELECT} WHERE p.id = ?`, [id]);
  return row ? toProgramme(row, (await campusesFor([id])).get(id) ?? []) : null;
}

async function findByCode(code) {
  const row = await get("SELECT id FROM programmes WHERE code = ?", [code]);
  return row ? findById(row.id) : null;
}

const isOffered = async (programmeId, campusId) =>
  Boolean(await get("SELECT 1 AS ok FROM programme_campuses WHERE programme_id = ? AND campus_id = ?", [programmeId, campusId]));

// Which of these ids are real campuses? Used to reject unknown ids with a clear message.
async function missingCampuses(ids) {
  const rows = await all(`SELECT id FROM campuses WHERE id IN (${ids.map(() => "?").join(",")})`, ids);
  const found = new Set(rows.map((r) => r.id));
  return ids.filter((id) => !found.has(id));
}

// Name and code must be unique (case-insensitive); `exceptId` lets an edit keep its own values.
async function duplicates({ code, name }, exceptId = null) {
  const found = {};
  if (await get("SELECT 1 AS x FROM programmes WHERE code = ? AND id IS NOT ?", [code, exceptId])) found.code = "This code is already used";
  if (await get("SELECT 1 AS x FROM programmes WHERE name = ? AND id IS NOT ?", [name, exceptId])) found.name = "A programme with this name already exists";
  return found;
}

// ---------- writes ----------
async function create(v) {
  const id = await transaction(async () => {
    const { lastID } = await run(
      "INSERT INTO programmes (code, name, department, duration_years, seats, annual_fee) VALUES (?, ?, ?, ?, ?, ?)",
      [v.code, v.name, v.department, v.durationYears, v.seats, v.annualFee]
    );
    for (const campusId of v.campusIds) {
      await run("INSERT INTO programme_campuses (programme_id, campus_id) VALUES (?, ?)", [lastID, campusId]);
    }
    return lastID;
  });
  return findById(id);
}

// Rules a plain CHECK constraint cannot express: seats can't drop below the students already
// admitted, and a campus can't be removed while it still has applications for this programme.
async function updateProblems(id, v) {
  const problems = {};
  const { admitted } = await get("SELECT COUNT(*) AS admitted FROM applications WHERE programme_id = ? AND status = 'admitted'", [id]);
  if (v.seats < admitted) problems.seats = `${admitted} students are already admitted, so seats cannot be fewer than that`;
  const used = await all(
    `SELECT DISTINCT c.id, c.name FROM applications a JOIN campuses c ON c.id = a.campus_id WHERE a.programme_id = ?`,
    [id]
  );
  const dropped = used.filter((c) => !v.campusIds.includes(c.id));
  if (dropped.length) problems.campusIds = `Cannot remove ${dropped.map((c) => c.name).join(", ")}: applications already exist there`;
  return problems;
}

async function update(id, v) {
  await transaction(async () => {
    await run(
      "UPDATE programmes SET code = ?, name = ?, department = ?, duration_years = ?, seats = ?, annual_fee = ? WHERE id = ?",
      [v.code, v.name, v.department, v.durationYears, v.seats, v.annualFee, id]
    );
    await run("DELETE FROM programme_campuses WHERE programme_id = ?", [id]);
    for (const campusId of v.campusIds) {
      await run("INSERT INTO programme_campuses (programme_id, campus_id) VALUES (?, ?)", [id, campusId]);
    }
  });
  return findById(id);
}

const applicationCount = async (id) =>
  (await get("SELECT COUNT(*) AS n FROM applications WHERE programme_id = ?", [id])).n;

async function remove(id) {
  const { changes } = await run("DELETE FROM programmes WHERE id = ?", [id]);
  return changes > 0;
}

module.exports = {
  validate, findAll, findById, findByCode, isOffered, missingCampuses, duplicates,
  create, update, updateProblems, applicationCount, remove,
};
