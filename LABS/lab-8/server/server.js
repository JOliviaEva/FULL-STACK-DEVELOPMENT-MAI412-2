const express = require("express");
const cors = require("cors");
const db = require("./database/db");
const routes = require("./routes");

const PORT = process.env.PORT || 5000;
// Comma separated list of allowed browser origins. Unset = allow any (fine for local dev).
const ORIGINS = process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(",").map((o) => o.trim()) : true;

const app = express();
app.use(cors({ origin: ORIGINS })); // lets a React app on another origin call this API
app.use(express.json());

app.get("/", (req, res) => res.send("UniAI ERP Admissions API (Express + SQLite) running..."));
app.use("/api", routes);

// Unknown URL -> JSON 404
app.use((req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` }));

// Bad JSON bodies and anything unexpected end up here.
app.use((err, req, res, _next) => {
  if (err.type === "entity.parse.failed") return res.status(400).json({ message: "Request body is not valid JSON" });
  if (err.code === "SQLITE_CONSTRAINT") return res.status(409).json({ message: "Duplicate entry or constraint violated" });
  console.error(err);
  res.status(500).json({ message: "Server error" });
});

db.init()
  .then((seeded) => {
    if (seeded) console.log("Loaded the sample data");
    app.listen(PORT, () => console.log(`API ready at http://localhost:${PORT}  (db: ${db.DB_PATH})`));
  })
  .catch((err) => {
    console.error("Could not start:", err.message);
    process.exit(1);
  });
