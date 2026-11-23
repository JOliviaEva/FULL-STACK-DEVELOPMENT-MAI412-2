// npm run seed            -> create the tables and load the sample rows if the database is empty
// npm run seed -- --reset -> drop every table first, then reload
const { init, reset, db, DB_PATH } = require("./db");

(async () => {
  if (process.argv.includes("--reset")) await reset();
  const seeded = await init();
  console.log(seeded ? `Seeded the sample data into ${DB_PATH}` : "Database already has data. Use `npm run seed -- --reset` to start over.");
  db.close();
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
