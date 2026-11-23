// Controller layer: reads the request, calls the models, sends the HTTP response.
// (Express 5 passes errors from async handlers to the error middleware by itself.)
const Application = require("../models/Application");
const Programme = require("../models/Programme");
const Officer = require("../models/Officer");
const Note = require("../models/Note");
const { sendError, parseId, hasKeys } = require("./http");

const DUPLICATE_EMAIL = { email: "An application with this email already exists" };

// Reads and checks the filters from the query string and the path.
// Returns { filters } or { error } (a message for a 400).
function readFilters(req) {
  const raw = { ...req.query, ...req.params }; // path parameters win over query parameters
  const filters = {};
  for (const key of ["q", "programmeId", "campusId", "officerId", "status", "sort"]) {
    if (raw[key] === undefined) continue;
    if (Array.isArray(raw[key])) return { error: `Send ${key} only once` };
    filters[key] = String(raw[key]);
  }
  for (const key of ["programmeId", "campusId", "officerId"]) {
    if (filters[key] && !(parseId(filters[key]) || (key === "officerId" && filters[key] === "none"))) {
      return { error: `${key} must be a number${key === "officerId" ? ' or "none"' : ""}` };
    }
  }
  if (filters.status && !Application.STATUSES.includes(filters.status)) {
    return { error: `Unknown status. Use one of: ${Application.STATUSES.join(", ")}` };
  }
  if (filters.sort && !(filters.sort in Application.SORTS)) {
    return { error: `Unknown sort. Use one of: ${Object.keys(Application.SORTS).join(", ")}` };
  }
  return { filters };
}

// GET /api/applications?q=&programmeId=&campusId=&officerId=&status=&sort=
// GET /api/applications/status/:status        (path-parameter filter)
async function list(req, res) {
  const { filters, error } = readFilters(req);
  if (error) return sendError(res, 400, error);
  res.json(await Application.findAll(filters));
}

// GET /api/applications/programme/:code   e.g. /programme/BTECH-CSE
async function listByProgramme(req, res) {
  const programme = await Programme.findByCode(req.params.code);
  if (!programme) return sendError(res, 404, `No programme with code ${req.params.code}`);
  req.params = { programmeId: String(programme.id) };
  return list(req, res);
}

// GET /api/applications/options
function options(req, res) {
  res.json({ statuses: Application.STATUSES, sorts: Object.keys(Application.SORTS) });
}

// GET /api/applications/:id  - the application (joined with programme, campus, officer) plus its notes
async function getOne(req, res) {
  const id = parseId(req.params.id);
  if (!id) return sendError(res, 400, "Invalid id");
  const application = await Application.findById(id);
  if (!application) return sendError(res, 404, "Application not found");
  res.json({ ...application, notes: await Note.forApplication(id) });
}

// Shared by POST and PUT. Returns { values } or sends the error response itself and returns null.
async function checkBody(req, res, exceptId = null) {
  const { errors, values } = Application.validate(req.body);
  Object.assign(errors, await Application.referenceErrors(values, errors));
  if (hasKeys(errors)) return sendError(res, 400, "Validation failed", errors), null;
  if (await Application.emailTaken(values.email, exceptId)) return sendError(res, 409, "Duplicate entry", DUPLICATE_EMAIL), null;
  return values;
}

// POST /api/applications
async function create(req, res) {
  const values = await checkBody(req, res);
  if (values) res.status(201).json(await Application.create(values));
}

// PUT /api/applications/:id  (replaces every editable field)
async function update(req, res) {
  const id = parseId(req.params.id);
  if (!id) return sendError(res, 400, "Invalid id");
  if (!(await Application.findById(id))) return sendError(res, 404, "Application not found");
  const values = await checkBody(req, res, id);
  if (values) res.json(await Application.update(id, values));
}

// PATCH /api/applications/:id  - change only status and/or officerId
async function patch(req, res) {
  const id = parseId(req.params.id);
  if (!id) return sendError(res, 400, "Invalid id");
  if (!(await Application.findById(id))) return sendError(res, 404, "Application not found");
  const fields = {};
  const errors = {};
  if ("status" in req.body) {
    if (Application.STATUSES.includes(req.body.status)) fields.status = req.body.status;
    else errors.status = "Status must be review, shortlisted, admitted or rejected";
  }
  if ("officerId" in req.body) {
    const raw = req.body.officerId;
    if (raw === null || raw === "") fields.officerId = null;
    else if (parseId(raw) && (await Officer.findById(parseId(raw)))) fields.officerId = parseId(raw);
    else errors.officerId = "Choose a valid officer";
  }
  if (!hasKeys(errors) && !hasKeys(fields)) errors.body = "Send status and/or officerId";
  if (hasKeys(errors)) return sendError(res, 400, "Validation failed", errors);
  res.json(await Application.patch(id, fields));
}

// DELETE /api/applications/:id  (its notes go with it)
async function remove(req, res) {
  const id = parseId(req.params.id);
  if (!id) return sendError(res, 400, "Invalid id");
  if (!(await Application.remove(id))) return sendError(res, 404, "Application not found");
  res.json({ message: "Application deleted", id });
}

// POST /api/applications/:id/notes
async function addNote(req, res) {
  const id = parseId(req.params.id);
  if (!id) return sendError(res, 400, "Invalid id");
  if (!(await Application.findById(id))) return sendError(res, 404, "Application not found");
  const { errors, values } = Note.validate(req.body);
  if (!errors.officerId && values.officerId !== null && !(await Officer.findById(values.officerId))) errors.officerId = "This officer does not exist";
  if (hasKeys(errors)) return sendError(res, 400, "Validation failed", errors);
  res.status(201).json(await Note.create(id, values));
}

// DELETE /api/applications/:id/notes/:noteId
async function removeNote(req, res) {
  const id = parseId(req.params.id);
  const noteId = parseId(req.params.noteId);
  if (!id || !noteId) return sendError(res, 400, "Invalid id");
  if (!(await Note.remove(id, noteId))) return sendError(res, 404, "Note not found");
  res.json({ message: "Note deleted", id: noteId });
}

module.exports = { list, listByProgramme, options, getOne, create, update, patch, remove, addNote, removeNote };
