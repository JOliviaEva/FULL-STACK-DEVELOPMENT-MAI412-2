// SQLite connection, schema and seed data.
// sqlite3 is callback based, so run/get/all are wrapped in promises for async/await.
//
//  campuses ──┐                       ┌── programmes
//             ├── programme_campuses ─┘      (which programme is taught where: many-to-many)
//  applications  ->  programme_id, campus_id (required), officer_id (optional)
//  notes         ->  application_id (deleted with the application), officer_id (optional)
//  officers
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const seed = require("./seedData");

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "uniai.db");
const db = new sqlite3.Database(DB_PATH);

const run = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    })
  );

const get = (sql, params = []) =>
  new Promise((resolve, reject) => db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row))));

const all = (sql, params = []) =>
  new Promise((resolve, reject) => db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows))));

// Runs `work` inside BEGIN/COMMIT; any error rolls everything back.
// (One shared connection, so callers must not overlap transactions.)
let queue = Promise.resolve();
function transaction(work) {
  const result = queue.then(async () => {
    await run("BEGIN");
    try {
      const value = await work();
      await run("COMMIT");
      return value;
    } catch (err) {
      await run("ROLLBACK");
      throw err;
    }
  });
  queue = result.catch(() => {});
  return result;
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS campuses (
     id    INTEGER PRIMARY KEY AUTOINCREMENT,
     name  TEXT NOT NULL UNIQUE,
     city  TEXT NOT NULL,
     state TEXT NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS programmes (
     id             INTEGER PRIMARY KEY AUTOINCREMENT,
     code           TEXT    NOT NULL UNIQUE COLLATE NOCASE,
     name           TEXT    NOT NULL UNIQUE COLLATE NOCASE,
     department     TEXT    NOT NULL,
     duration_years INTEGER NOT NULL CHECK (duration_years BETWEEN 1 AND 6),
     seats          INTEGER NOT NULL CHECK (seats > 0),
     annual_fee     INTEGER NOT NULL CHECK (annual_fee >= 0)
   )`,
  `CREATE TABLE IF NOT EXISTS programme_campuses (
     programme_id INTEGER NOT NULL REFERENCES programmes (id) ON DELETE CASCADE,
     campus_id    INTEGER NOT NULL REFERENCES campuses (id)   ON DELETE CASCADE,
     PRIMARY KEY (programme_id, campus_id)
   )`,
  `CREATE TABLE IF NOT EXISTS officers (
     id          INTEGER PRIMARY KEY AUTOINCREMENT,
     name        TEXT NOT NULL,
     email       TEXT NOT NULL UNIQUE COLLATE NOCASE,
     designation TEXT NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS applications (
     id             INTEGER PRIMARY KEY AUTOINCREMENT,
     application_no TEXT    NOT NULL UNIQUE,
     name           TEXT    NOT NULL,
     email          TEXT    NOT NULL UNIQUE COLLATE NOCASE,
     phone          TEXT    NOT NULL,
     programme_id   INTEGER NOT NULL REFERENCES programmes (id) ON DELETE RESTRICT,
     campus_id      INTEGER NOT NULL REFERENCES campuses (id)   ON DELETE RESTRICT,
     officer_id     INTEGER REFERENCES officers (id) ON DELETE SET NULL,
     twelfth_pct    REAL    NOT NULL CHECK (twelfth_pct BETWEEN 0 AND 100),
     status         TEXT    NOT NULL DEFAULT 'review'
                            CHECK (status IN ('review', 'shortlisted', 'admitted', 'rejected')),
     sop            TEXT    NOT NULL,
     created_at     TEXT    NOT NULL,
     updated_at     TEXT    NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS notes (
     id             INTEGER PRIMARY KEY AUTOINCREMENT,
     application_id INTEGER NOT NULL REFERENCES applications (id) ON DELETE CASCADE,
     officer_id     INTEGER REFERENCES officers (id) ON DELETE SET NULL,
     body           TEXT NOT NULL,
     created_at     TEXT NOT NULL
   )`,
  "CREATE INDEX IF NOT EXISTS idx_applications_programme ON applications (programme_id)",
  "CREATE INDEX IF NOT EXISTS idx_applications_campus    ON applications (campus_id)",
  "CREATE INDEX IF NOT EXISTS idx_applications_officer   ON applications (officer_id)",
  "CREATE INDEX IF NOT EXISTS idx_applications_status    ON applications (status)",
  "CREATE INDEX IF NOT EXISTS idx_notes_application      ON notes (application_id)",
];

// Fills every table from seedData.js. Only called when the database is empty.
async function loadSeed() {
  await transaction(async () => {
    const campusId = {};
    for (const c of seed.campuses) {
      campusId[c.name] = (await run("INSERT INTO campuses (name, city, state) VALUES (?, ?, ?)", [c.name, c.city, c.state])).lastID;
    }
    const programmeId = {};
    for (const p of seed.programmes) {
      const { lastID } = await run(
        "INSERT INTO programmes (code, name, department, duration_years, seats, annual_fee) VALUES (?, ?, ?, ?, ?, ?)",
        [p.code, p.name, p.department, p.durationYears, p.seats, p.annualFee]
      );
      programmeId[p.code] = lastID;
      for (const campus of p.campuses) {
        await run("INSERT INTO programme_campuses (programme_id, campus_id) VALUES (?, ?)", [lastID, campusId[campus]]);
      }
    }
    const officerId = {};
    for (const o of seed.officers) {
      officerId[o.email] = (await run("INSERT INTO officers (name, email, designation) VALUES (?, ?, ?)", [o.name, o.email, o.designation])).lastID;
    }
    const applicationId = {};
    for (const a of seed.applications) {
      applicationId[a.applicationNo] = (
        await run(
          `INSERT INTO applications
             (application_no, name, email, phone, programme_id, campus_id, officer_id, twelfth_pct, status, sop, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [a.applicationNo, a.name, a.email, a.phone, programmeId[a.programmeCode], campusId[a.campusName],
           a.officerEmail ? officerId[a.officerEmail] : null, a.twelfthPct, a.status, a.sop, a.createdAt, a.updatedAt]
        )
      ).lastID;
    }
    for (const n of seed.notes) {
      await run("INSERT INTO notes (application_id, officer_id, body, created_at) VALUES (?, ?, ?, ?)", [
        applicationId[n.applicationNo], officerId[n.officerEmail], n.body, n.createdAt,
      ]);
    }
  });
}

// Creates the tables (with foreign keys enforced) and seeds an empty database.
// Resolves to true when sample data was loaded.
async function init() {
  await run("PRAGMA foreign_keys = ON");
  for (const statement of SCHEMA) await run(statement);
  const { count } = await get("SELECT COUNT(*) AS count FROM programmes");
  if (count > 0) return false;
  await loadSeed();
  return true;
}

// Drops every table (used by `npm run seed -- --reset`).
async function reset() {
  await run("PRAGMA foreign_keys = OFF");
  for (const table of ["notes", "applications", "officers", "programme_campuses", "programmes", "campuses"]) {
    await run(`DROP TABLE IF EXISTS ${table}`);
  }
  await run("PRAGMA foreign_keys = ON");
}

module.exports = { db, run, get, all, transaction, init, reset, DB_PATH };
