export default function RiskGauge({ score = 0, label = "" }) {
  const size = 168;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, score));
  const offset = circumference * (1 - pct / 100);

  const color = pct >= 60 ? "#e0294a" : pct >= 30 ? "#ec4f80" : "#ff8fb3";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="#301620" strokeWidth={stroke} fill="none" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.8s ease, stroke 0.8s ease", filter: `drop-shadow(0 0 10px ${color}66)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl font-bold text-cream">{pct.toFixed(0)}</span>
          <span className="text-[11px] uppercase tracking-wide text-cream/40">/ 100 risk</span>
        </div>
      </div>
      {label && <p className="text-center text-sm font-medium text-cream/80">{label}</p>}
    </div>
  );
}
