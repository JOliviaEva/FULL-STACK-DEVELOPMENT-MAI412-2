// Dashboard numbers. Each query JOINs a lookup table to the applications and groups the result.
const { get, all } = require("../database/db");
const { STATUSES } = require("./Application");

async function overview() {
  const totals = await get(
    `SELECT COUNT(*) AS total, AVG(twelfth_pct) AS avg_pct,
            SUM(CASE WHEN officer_id IS NULL AND status IN ('review', 'shortlisted') THEN 1 ELSE 0 END) AS unassigned
       FROM applications`
  );

  const byStatus = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  for (const r of await all("SELECT status, COUNT(*) AS n FROM applications GROUP BY status")) byStatus[r.status] = r.n;

  // programmes LEFT JOIN applications: programmes with no applicants still appear (with zeros)
  const byProgramme = await all(
    `SELECT p.id, p.code, p.name, p.seats,
            COUNT(a.id) AS applicants,
            COALESCE(SUM(a.status = 'admitted'), 0) AS admitted
       FROM programmes p LEFT JOIN applications a ON a.programme_id = p.id
      GROUP BY p.id ORDER BY applicants DESC, p.name`
  );

  const byCampus = await all(
    `SELECT c.id, c.name, c.city,
            COUNT(a.id) AS applicants,
            COALESCE(SUM(a.status = 'admitted'), 0) AS admitted
       FROM campuses c LEFT JOIN applications a ON a.campus_id = c.id
      GROUP BY c.id ORDER BY applicants DESC, c.name`
  );

  const byOfficer = await all(
    `SELECT o.id, o.name, COUNT(a.id) AS caseload
       FROM officers o LEFT JOIN applications a ON a.officer_id = o.id
      GROUP BY o.id ORDER BY caseload DESC, o.name`
  );

  return {
    total: totals.total,
    averagePct: totals.avg_pct ? Math.round(totals.avg_pct * 10) / 10 : 0,
    unassigned: totals.unassigned ?? 0,
    byStatus,
    byProgramme,
    byCampus,
    byOfficer,
  };
}

module.exports = { overview };
