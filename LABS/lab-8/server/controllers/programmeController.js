const Programme = require("../models/Programme");
const { sendError, parseId, hasKeys } = require("./http");

// GET /api/programmes  - every programme with applicants / admitted / seats left and the campuses teaching it
async function list(req, res) {
  res.json(await Programme.findAll());
}

// GET /api/programmes/:id
async function getOne(req, res) {
  const id = parseId(req.params.id);
  if (!id) return sendError(res, 400, "Invalid id");
  const programme = await Programme.findById(id);
  if (!programme) return sendError(res, 404, "Programme not found");
  res.json(programme);
}

// Shared by POST and PUT: shape, unknown campuses, then duplicate code / name.
async function checkBody(req, res, exceptId = null) {
  const { errors, values } = Programme.validate(req.body);
  if (!errors.campusIds) {
    const missing = await Programme.missingCampuses(values.campusIds);
    if (missing.length) errors.campusIds = `Unknown campus id: ${missing.join(", ")}`;
  }
  if (hasKeys(errors)) return sendError(res, 400, "Validation failed", errors), null;
  const duplicates = await Programme.duplicates(values, exceptId);
  if (hasKeys(duplicates)) return sendError(res, 409, "Duplicate entry", duplicates), null;
  return values;
}

// POST /api/programmes
async function create(req, res) {
  const values = await checkBody(req, res);
  if (values) res.status(201).json(await Programme.create(values));
}

// PUT /api/programmes/:id
async function update(req, res) {
  const id = parseId(req.params.id);
  if (!id) return sendError(res, 400, "Invalid id");
  if (!(await Programme.findById(id))) return sendError(res, 404, "Programme not found");
  const values = await checkBody(req, res, id);
  if (!values) return;
  const problems = await Programme.updateProblems(id, values);
  if (hasKeys(problems)) return sendError(res, 409, "This change conflicts with existing applications", problems);
  res.json(await Programme.update(id, values));
}

// DELETE /api/programmes/:id  - refused while applications still point at it
async function remove(req, res) {
  const id = parseId(req.params.id);
  if (!id) return sendError(res, 400, "Invalid id");
  if (!(await Programme.findById(id))) return sendError(res, 404, "Programme not found");
  const count = await Programme.applicationCount(id);
  if (count) return sendError(res, 409, `Cannot delete: ${count} application${count === 1 ? "" : "s"} still use this programme`);
  await Programme.remove(id);
  res.json({ message: "Programme deleted", id });
}

module.exports = { list, getOne, create, update, remove };
