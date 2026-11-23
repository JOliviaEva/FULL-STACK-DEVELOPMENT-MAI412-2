const express = require("express");
const applications = require("../controllers/applicationController");
const programmes = require("../controllers/programmeController");
const lookups = require("../controllers/lookupController");

const router = express.Router();

// ---- applications (joined with programme, campus and officer) ----
// Fixed paths are declared before "/:id" so "options" or "status" is never read as an id.
router.get("/applications", applications.list);
router.get("/applications/options", applications.options);
router.get("/applications/status/:status", applications.list);
router.get("/applications/programme/:code", applications.listByProgramme);
router.get("/applications/:id", applications.getOne);
router.post("/applications", applications.create);
router.put("/applications/:id", applications.update);
router.patch("/applications/:id", applications.patch);
router.delete("/applications/:id", applications.remove);
router.post("/applications/:id/notes", applications.addNote);
router.delete("/applications/:id/notes/:noteId", applications.removeNote);

// ---- programmes (full CRUD) ----
router.get("/programmes", programmes.list);
router.get("/programmes/:id", programmes.getOne);
router.post("/programmes", programmes.create);
router.put("/programmes/:id", programmes.update);
router.delete("/programmes/:id", programmes.remove);

// ---- campuses, officers, dashboard (read) ----
router.get("/campuses", lookups.listCampuses);
router.get("/campuses/:id", lookups.getCampus);
router.get("/officers", lookups.listOfficers);
router.get("/officers/:id", lookups.getOfficer);
router.get("/stats", lookups.overview);

module.exports = router;
