// Domain data and pure helpers for the Admissions module.
// Nothing in here touches React or the network, so it is easy to reuse and test.

export const PROGRAMMES = ["B.Tech AI & ML", "B.Tech CSE", "BBA", "BA LLB"];

export const CAMPUSES = [
  "Central Campus, Bengaluru",
  "Bannerghatta Road, Bengaluru",
  "Kengeri, Bengaluru",
  "Yeshwanthpur, Bengaluru",
  "Delhi NCR",
  "Pune Lavasa",
];

export const STATUSES = [
  { value: "review", label: "Under review", color: "var(--amber)" },
  { value: "shortlisted", label: "Shortlisted", color: "var(--teal)" },
  { value: "admitted", label: "Admitted", color: "var(--green)" },
  { value: "rejected", label: "Rejected", color: "var(--red)" },
];

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "fit", label: "Highest fit score" },
  { value: "name", label: "Name A–Z" },
];

export const SOP_MAX = 300;

export const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  programme: "",
  campus: "",
  twelfthPct: "",
  status: "review",
  sop: "",
};

// Same rules as the Lab 3 admissions form, plus phone and campus.
// Each rule returns true when valid, or an error message.
const RULES = {
  name: (v) => v.trim().length >= 3 || "At least 3 characters",
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || "Enter a valid email",
  phone: (v) => /^[6-9]\d{9}$/.test(v.replace(/\s+/g, "")) || "Enter a 10-digit mobile number",
  programme: (v) => v !== "" || "Choose a programme",
  campus: (v) => v !== "" || "Choose a campus",
  twelfthPct: (v) => {
    if (v === "" || Number.isNaN(+v) || +v < 0 || +v > 100) return "Enter a percentage 0–100";
    return +v >= 60 || "Below the 60% eligibility cut-off";
  },
  sop: (v) => v.trim().length >= 40 || "Write at least 40 characters",
};

export function validate(values) {
  const errors = {};
  for (const [field, rule] of Object.entries(RULES)) {
    const result = rule(String(values[field] ?? ""));
    if (result !== true) errors[field] = result;
  }
  return errors;
}

// The Lab 3 "AI screening" fit score: rewards marks above the cut-off and a fuller SOP.
export function fitScore(twelfthPct, sop) {
  const raw = 40 + (Number(twelfthPct) - 60) * 1.1 + Math.min(sop.trim().length, SOP_MAX) / 10;
  return Math.max(0, Math.min(99, Math.round(raw)));
}

export function fitSuggestion(score) {
  return score >= 70 ? "Shortlist for interview" : "Refer to an admissions officer";
}

export function statusMeta(value) {
  return STATUSES.find((s) => s.value === value) ?? STATUSES[0];
}

// Form values are strings (controlled inputs); records store clean, typed values.
export function toRecord(values) {
  return {
    name: values.name.trim(),
    email: values.email.trim().toLowerCase(),
    phone: values.phone.replace(/\s+/g, ""),
    programme: values.programme,
    campus: values.campus,
    twelfthPct: Number(values.twelfthPct),
    status: values.status,
    sop: values.sop.trim(),
  };
}

export function toFormValues(record) {
  return {
    name: record.name,
    email: record.email,
    phone: record.phone,
    programme: record.programme,
    campus: record.campus,
    twelfthPct: String(record.twelfthPct),
    status: record.status,
    sop: record.sop,
  };
}

export function nextApplicationNo(applications, year = new Date().getFullYear()) {
  const highest = applications.reduce((max, app) => {
    const seq = Number(app.applicationNo?.split("-").pop());
    return Number.isFinite(seq) ? Math.max(max, seq) : max;
  }, 0);
  return `CU-ADM-${year}-${String(highest + 1).padStart(4, "0")}`;
}

export function matchesFilters(app, { query = "", status = "all" }) {
  if (status !== "all" && app.status !== status) return false;
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [app.name, app.email, app.phone, app.programme, app.campus, app.applicationNo].some((field) =>
    String(field).toLowerCase().includes(q)
  );
}

const SORTERS = {
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  fit: (a, b) => fitScore(b.twelfthPct, b.sop) - fitScore(a.twelfthPct, a.sop),
  name: (a, b) => a.name.localeCompare(b.name),
};

export function selectApplications(applications, { query, status, sort }) {
  return applications.filter((app) => matchesFilters(app, { query, status })).sort(SORTERS[sort]);
}
