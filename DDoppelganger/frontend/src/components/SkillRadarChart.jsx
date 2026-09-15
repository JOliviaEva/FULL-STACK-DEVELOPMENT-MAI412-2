import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

export default function SkillRadarChart({ categories }) {
  const data = Object.entries(categories || {}).map(([category, value]) => ({
    category,
    value: Math.round(value * 100),
  }));

  if (data.length < 3) {
    return (
      <div className="flex h-64 items-center justify-center text-center text-sm text-cream/40">
        Add a few more skills across different categories to see your radar profile.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="#301620" />
        <PolarAngleAxis
          dataKey="category"
          tick={{ fill: "#f7e9ec", fontSize: 11.5, fontWeight: 500 }}
        />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#a8798a", fontSize: 10 }} />
        <Radar
          name="Proficiency"
          dataKey="value"
          stroke="#ec4f80"
          fill="#e0294a"
          fillOpacity={0.38}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
