import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const COLORS = ["#ec4f80", "#e0294a", "#f56b95", "#9a1836", "#ff8fb3", "#c41f3d", "#7a122c", "#ffc0d4"];

export default function TrendLineChart({ trends }) {
  if (!trends?.length) {
    return <div className="flex h-56 items-center justify-center text-sm text-cream/40">No data yet.</div>;
  }

  const periods = trends[0].history.map((h) => h.period);
  const data = periods.map((period, i) => {
    const row = { period: period.slice(2) };
    trends.forEach((t) => {
      row[t.skill] = t.history[i]?.mention_count ?? null;
    });
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
        <CartesianGrid stroke="#301620" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="period" tick={{ fill: "#a8798a", fontSize: 10.5 }} axisLine={{ stroke: "#301620" }} tickLine={false} />
        <YAxis tick={{ fill: "#a8798a", fontSize: 10.5 }} axisLine={{ stroke: "#301620" }} tickLine={false} />
        <Tooltip
          contentStyle={{
            background: "#1b0d16",
            border: "1px solid #301620",
            borderRadius: 12,
            fontSize: 12,
          }}
          labelStyle={{ color: "#f7e9ec" }}
        />
        {trends.map((t, i) => (
          <Line
            key={t.skill}
            type="monotone"
            dataKey={t.skill}
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
