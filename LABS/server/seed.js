// Loads the sample applications from ../db.json (Labs 5 & 6) into MongoDB.
// Only runs on an empty collection; pass --reset to wipe it first.
const mongoose = require("mongoose");
const { Application } = require("./models/Application");
const sample = require("../db.json").applications;

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/uniaiERP";

(async () => {
  await mongoose.connect(MONGO_URI);
  if (process.argv.includes("--reset")) await Application.deleteMany({});
  if ((await Application.countDocuments()) > 0) {
    console.log("Collection already has data. Use `npm run seed -- --reset` to replace it.");
  } else {
    const docs = sample.map(({ id, ...rest }) => rest);
    await Application.insertMany(docs, { timestamps: false });
    console.log(`Seeded ${docs.length} applications into ${MONGO_URI}`);
  }
  await mongoose.disconnect();
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
