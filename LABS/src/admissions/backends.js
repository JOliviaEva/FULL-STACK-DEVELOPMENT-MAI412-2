import { createApplicationsApi } from "./api.js";

// A "backend" bundles the API client with the wording the UI shows about it,
// so one AdmissionsApp serves both the JSON Server labs and the MERN lab.
export const JSON_SERVER = {
  api: createApplicationsApi(
    import.meta.env.VITE_API_URL ?? "/api",
    "Network error: is JSON Server running?"
  ),
  name: "JSON Server",
  store: "db.json",
  liveLabel: "JSON Server · live",
  offlineLabel: "JSON Server offline",
  startHint: "Start JSON Server in a second terminal with npm run server, then retry.",
};

export const MERN = {
  api: createApplicationsApi(
    import.meta.env.VITE_MERN_API_URL ?? "/mern-api",
    "Network error: is the Express server running?"
  ),
  name: "Express + MongoDB",
  store: "MongoDB",
  liveLabel: "MongoDB · live",
  offlineLabel: "Express server offline",
  startHint: "Make sure MongoDB is running, start the API with npm run mern, then retry.",
};
