const { get, all } = require("../database/db");

// Each campus with how many applications it received and how many programmes it teaches.
// Two LEFT JOINs would multiply rows, so the counts are separate sub-selects.
const SELECT = `
  SELECT c.*,
         (SELECT COUNT(*) FROM applications a WHERE a.campus_id = c.id)                      AS applications,
         (SELECT COUNT(*) FROM applications a WHERE a.campus_id = c.id AND a.status = 'admitted') AS admitted,
         (SELECT COUNT(*) FROM programme_campuses pc WHERE pc.campus_id = c.id)              AS programme_count
    FROM campuses c`;

const toCampus = (r) =>
  r && {
    id: r.id,
    name: r.name,
    city: r.city,
    state: r.state,
    applications: r.applications,
    admitted: r.admitted,
    programmeCount: r.programme_count,
  };

// Programmes taught at each campus: a join through the many-to-many table.
async function withProgrammes(campuses) {
  const rows = await all(
    `SELECT pc.campus_id, p.id, p.code, p.name
       FROM programme_campuses pc JOIN programmes p ON p.id = pc.programme_id
      ORDER BY p.name`
  );
  for (const c of campuses) c.programmes = rows.filter((r) => r.campus_id === c.id).map(({ id, code, name }) => ({ id, code, name }));
  return campuses;
}

const findAll = async () => withProgrammes((await all(`${SELECT} ORDER BY c.name`)).map(toCampus));

async function findById(id) {
  const campus = toCampus(await get(`${SELECT} WHERE c.id = ?`, [id]));
  return campus && (await withProgrammes([campus]))[0];
}

module.exports = { findAll, findById };
