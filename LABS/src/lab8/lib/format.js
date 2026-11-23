// Display helpers: status colours, dates, money, initials.

export const STATUS_META = {
  review: { label: "Under review", badge: "bg-amber-100 text-amber-800 ring-amber-300/60", color: "#D97706" },
  shortlisted: { label: "Shortlisted", badge: "bg-teal-50 text-teal-700 ring-teal-200", color: "#218DAE" },
  admitted: { label: "Admitted", badge: "bg-green-100 text-green-800 ring-green-300/60", color: "#16A34A" },
  rejected: { label: "Rejected", badge: "bg-red-100 text-red-800 ring-red-300/60", color: "#DC2626" },
};
export const STATUS_KEYS = Object.keys(STATUS_META);

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name", label: "Name A–Z" },
  { value: "marks", label: "Highest 12th %" },
];

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export const formatDateTime = (iso) =>
  new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

// 285000 -> "₹2.85 L"; 12000000 -> "₹1.2 Cr"
export function formatFee(rupees) {
  if (rupees >= 10000000) return `₹${+(rupees / 10000000).toFixed(2)} Cr`;
  if (rupees >= 100000) return `₹${+(rupees / 100000).toFixed(2)} L`;
  return `₹${rupees.toLocaleString("en-IN")}`;
}

export const initials = (name) =>
  name
    .replace(/^(dr|mr|ms|mrs)\.?\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

// A stable colour per person/row so avatars are easy to tell apart.
const TONES = [
  "bg-plum-100 text-plum-600",
  "bg-rose-100 text-rose-700",
  "bg-teal-100 text-teal-700",
  "bg-amber-100 text-amber-800",
];
export const toneFor = (id) => TONES[Math.abs(Number(id) || 0) % TONES.length];

export const percent = (part, whole) => (whole ? Math.min(100, Math.round((part / whole) * 100)) : 0);
