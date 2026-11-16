const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { Application, nextApplicationNo } = require("./models/Application");

const PORT = process.env.PORT || 5001; // 3001 is taken by JSON Server (Labs 5 & 6)
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/uniaiERP";

const app = express();
app.use(cors());
app.use(express.json());

// Only these fields may be written by a client (blocks id / applicationNo tampering).
const WRITABLE = ["name", "email", "phone", "programme", "campus", "twelfthPct", "status", "sop"];
const pickWritable = (body) => Object.fromEntries(WRITABLE.filter((k) => k in body).map((k) => [k, body[k]]));

const SPECIAL_CHARS = new Set(".*+?^${}()|[]\\");
const escapeRegExp = (text) => [...text].map((ch) => (SPECIAL_CHARS.has(ch) ? `\\${ch}` : ch)).join("");

// Turn Mongoose / Mongo errors into clean HTTP responses.
function sendError(res, err) {
  if (err.name === "ValidationError") {
    const errors = Object.fromEntries(Object.entries(err.errors).map(([k, e]) => [k, e.message]));
    return res.status(400).json({ message: "Validation failed", errors });
  }
  if (err.name === "CastError") return res.status(400).json({ message: "Invalid id" });
  if (err.code === 11000) return res.status(409).json({ message: "Duplicate application number, please retry" });
  console.error(err);
  return res.status(500).json({ message: "Server error" });
}

// ---- Health check ----
app.get("/", (req, res) => {
  res.send("UniAI ERP Admissions API running...");
});

// ---- CREATE -> POST /applications ----
app.post("/applications", async (req, res) => {
  try {
    const application = new Application({ ...pickWritable(req.body), applicationNo: await nextApplicationNo() });
    await application.save();
    res.status(201).json(application);
  } catch (err) {
    sendError(res, err);
  }
});

// ---- READ (all) -> GET /applications ----
app.get("/applications", async (req, res) => {
  try {
    res.json(await Application.find().sort({ createdAt: -1 }));
  } catch (err) {
    sendError(res, err);
  }
});

// ---- SEARCH -> GET /applications/search/:name (declared before /:id) ----
app.get("/applications/search/:name", async (req, res) => {
  try {
    const escaped = escapeRegExp(req.params.name); // treat the search term as plain text
    res.json(await Application.find({ name: new RegExp(escaped, "i") }).sort({ createdAt: -1 }));
  } catch (err) {
    sendError(res, err);
  }
});

// ---- READ (one) -> GET /applications/:id ----
app.get("/applications/:id", async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: "Application not found" });
    res.json(application);
  } catch (err) {
    sendError(res, err);
  }
});

// ---- UPDATE -> PUT /applications/:id ----
app.put("/applications/:id", async (req, res) => {
  try {
    const application = await Application.findByIdAndUpdate(req.params.id, pickWritable(req.body), {
      returnDocument: "after",
      runValidators: true,
    });
    if (!application) return res.status(404).json({ message: "Application not found" });
    res.json(application);
  } catch (err) {
    sendError(res, err);
  }
});

// ---- DELETE -> DELETE /applications/:id ----
app.delete("/applications/:id", async (req, res) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);
    if (!application) return res.status(404).json({ message: "Application not found" });
    res.json({ message: "Application deleted successfully" });
  } catch (err) {
    sendError(res, err);
  }
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully");
    app.listen(PORT, () => console.log(`Server Running on Port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
