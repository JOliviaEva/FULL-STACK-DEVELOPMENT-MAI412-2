// Client-side form validation. The server enforces the same rules again (and a few more that need the
// database, like duplicate emails); this copy gives instant feedback while typing.

export const SOP_MAX = 500;

export const EMPTY_APPLICATION = {
  name: "",
  email: "",
  phone: "",
  programmeId: "",
  campusId: "",
  officerId: "",
  twelfthPct: "",
  status: "review",
  sop: "",
};

export const EMPTY_PROGRAMME = {
  code: "",
  name: "",
  department: "",
  durationYears: "4",
  seats: "",
  annualFee: "",
  campusIds: [],
};

const whole = (v, min, max, message) => {
  const text = String(v).trim();
  const n = Number(text);
  return text !== "" && Number.isInteger(n) && n >= min && n <= max ? null : message;
};

// Each rule returns an error message, or null when the value is valid.
const APPLICATION_RULES = {
  name: (v) => (!v.trim() ? "Name is required" : v.trim().length < 3 ? "At least 3 characters" : null),
  email: (v) => (!v.trim() ? "Email is required" : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? null : "Enter a valid email"),
  phone: (v) => (!v.trim() ? "Phone is required" : /^[6-9]\d{9}$/.test(v.replace(/\s+/g, "")) ? null : "Enter a 10-digit mobile number"),
  programmeId: (v) => (v ? null : "Choose a programme"),
  campusId: (v) => (v ? null : "Choose a campus"),
  twelfthPct: (v) => {
    if (!v.trim()) return "12th percentage is required";
    const n = Number(v);
    if (Number.isNaN(n) || n < 0 || n > 100) return "Enter a percentage between 0 and 100";
    return n >= 60 ? null : "Below the 60% eligibility cut-off";
  },
  sop: (v) => {
    const len = v.trim().length;
    if (!len) return "Statement of purpose is required";
    if (len < 40) return `Write at least 40 characters (${len}/40)`;
    return len <= SOP_MAX ? null : `Keep it under ${SOP_MAX} characters`;
  },
};

const PROGRAMME_RULES = {
  code: (v) => (/^[A-Za-z0-9-]{2,12}$/.test(v.trim()) ? null : "2-12 letters, digits or dashes"),
  name: (v) => (v.trim().length >= 2 && v.trim().length <= 60 ? null : "Name must be 2-60 characters"),
  department: (v) => (v.trim().length >= 3 && v.trim().length <= 80 ? null : "Department must be 3-80 characters"),
  durationYears: (v) => whole(v, 1, 6, "Duration must be 1-6 years"),
  seats: (v) => whole(v, 1, 2000, "Seats must be a whole number from 1 to 2000"),
  annualFee: (v) => whole(v, 0, 5000000, "Fee must be a whole number of rupees"),
};

function run(rules, values) {
  const errors = {};
  for (const [field, rule] of Object.entries(rules)) {
    const message = rule(String(values[field] ?? ""));
    if (message) errors[field] = message;
  }
  return errors;
}

export const validateApplication = (values) => run(APPLICATION_RULES, values);

export function validateProgramme(values) {
  const errors = run(PROGRAMME_RULES, values);
  if (!values.campusIds.length) errors.campusIds = "Pick at least one campus";
  return errors;
}

export const applicationToForm = (a) => ({
  name: a.name,
  email: a.email,
  phone: a.phone,
  programmeId: String(a.programmeId),
  campusId: String(a.campusId),
  officerId: a.officerId ? String(a.officerId) : "",
  twelfthPct: String(a.twelfthPct),
  status: a.status,
  sop: a.sop,
});

export const applicationToPayload = (v) => ({
  name: v.name.trim(),
  email: v.email.trim(),
  phone: v.phone.replace(/\s+/g, ""),
  programmeId: Number(v.programmeId),
  campusId: Number(v.campusId),
  officerId: v.officerId ? Number(v.officerId) : null,
  twelfthPct: Number(v.twelfthPct),
  status: v.status,
  sop: v.sop.trim(),
});

export const programmeToForm = (p) => ({
  code: p.code,
  name: p.name,
  department: p.department,
  durationYears: String(p.durationYears),
  seats: String(p.seats),
  annualFee: String(p.annualFee),
  campusIds: p.campuses.map((c) => c.id),
});

export const programmeToPayload = (v) => ({
  code: v.code.trim(),
  name: v.name.trim(),
  department: v.department.trim(),
  durationYears: Number(v.durationYears),
  seats: Number(v.seats),
  annualFee: Number(v.annualFee),
  campusIds: v.campusIds,
});
