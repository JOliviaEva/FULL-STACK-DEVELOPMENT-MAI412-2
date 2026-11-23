const { run, get, all } = require("../database/db");

const toNote = (r) =>
  r && {
    id: r.id,
    applicationId: r.application_id,
    body: r.body,
    createdAt: r.created_at,
    officer: r.officer_id ? { id: r.officer_id, name: r.officer_name } : null,
  };

const SELECT = `
  SELECT n.*, o.name AS officer_name
    FROM notes n LEFT JOIN officers o ON o.id = n.officer_id`;

function validate(body = {}) {
  const text = String(body.body ?? "").trim();
  const errors = {};
  if (text.length < 3) errors.body = "Write at least 3 characters";
  else if (text.length > 400) errors.body = "Keep the note under 400 characters";
  const raw = body.officerId;
  const officerId = raw === undefined || raw === null || raw === "" ? null : Number(raw);
  if (officerId !== null && !(Number.isInteger(officerId) && officerId > 0)) errors.officerId = "Choose a valid officer";
  return { errors, values: { body: text, officerId } };
}

const forApplication = async (applicationId) =>
  (await all(`${SELECT} WHERE n.application_id = ? ORDER BY n.created_at DESC, n.id DESC`, [applicationId])).map(toNote);

const findById = async (id) => toNote(await get(`${SELECT} WHERE n.id = ?`, [id]));

async function create(applicationId, { body, officerId }) {
  const { lastID } = await run("INSERT INTO notes (application_id, officer_id, body, created_at) VALUES (?, ?, ?, ?)", [
    applicationId,
    officerId,
    body,
    new Date().toISOString(),
  ]);
  return findById(lastID);
}

async function remove(applicationId, noteId) {
  const { changes } = await run("DELETE FROM notes WHERE id = ? AND application_id = ?", [noteId, applicationId]);
  return changes > 0;
}

module.exports = { validate, forApplication, create, remove };
