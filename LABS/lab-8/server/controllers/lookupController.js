// Read-only endpoints for the smaller tables, plus the dashboard numbers.
const Campus = require("../models/Campus");
const Officer = require("../models/Officer");
const Stats = require("../models/Stats");
const { sendError, parseId } = require("./http");

const listCampuses = async (req, res) => res.json(await Campus.findAll());
const listOfficers = async (req, res) => res.json(await Officer.findAll());
const overview = async (req, res) => res.json(await Stats.overview());

async function getCampus(req, res) {
  const id = parseId(req.params.id);
  if (!id) return sendError(res, 400, "Invalid id");
  const campus = await Campus.findById(id);
  if (!campus) return sendError(res, 404, "Campus not found");
  res.json(campus);
}

async function getOfficer(req, res) {
  const id = parseId(req.params.id);
  if (!id) return sendError(res, 400, "Invalid id");
  const officer = await Officer.findById(id);
  if (!officer) return sendError(res, 404, "Officer not found");
  res.json(officer);
}

module.exports = { listCampuses, listOfficers, overview, getCampus, getOfficer };
