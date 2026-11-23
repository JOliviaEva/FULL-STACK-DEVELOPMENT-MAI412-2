const { get, all } = require("../database/db");

// Each officer with their caseload (applications assigned to them), split by status.
const SELECT = `
  SELECT o.*,
         (SELECT COUNT(*) FROM applications a WHERE a.officer_id = o.id)                                  AS caseload,
         (SELECT COUNT(*) FROM applications a WHERE a.officer_id = o.id AND a.status IN ('review', 'shortlisted')) AS open_cases,
         (SELECT COUNT(*) FROM notes n WHERE n.officer_id = o.id)                                         AS note_count
    FROM officers o`;

const toOfficer = (r) =>
  r && {
    id: r.id,
    name: r.name,
    email: r.email,
    designation: r.designation,
    caseload: r.caseload,
    openCases: r.open_cases,
    noteCount: r.note_count,
  };

const findAll = async () => (await all(`${SELECT} ORDER BY o.name`)).map(toOfficer);
const findById = async (id) => toOfficer(await get(`${SELECT} WHERE o.id = ?`, [id]));

module.exports = { findAll, findById };
