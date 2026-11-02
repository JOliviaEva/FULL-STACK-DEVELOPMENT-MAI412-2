export default function StatCard({ label, value, note, accent = "var(--teal)" }) {
  return (
    <div className="uai-stat" style={{ "--accent": accent }}>
      <p className="uai-label">{label}</p>
      <p className="uai-stat-value">{value}</p>
      {note && <p className="uai-stat-note">{note}</p>}
    </div>
  );
}
