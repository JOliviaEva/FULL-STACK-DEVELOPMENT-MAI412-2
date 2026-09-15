import { TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import client from "../api/client.js";
import Layout from "../components/Layout.jsx";
import TrendLineChart from "../components/TrendLineChart.jsx";

function TrendPanel({ title, icon: Icon, tone, trends }) {
  return (
    <div className="card card-sheen p-6">
      <div className="mb-1 flex items-center gap-2">
        <Icon size={18} className={tone === "up" ? "text-rose-400" : "text-cream/40"} />
        <h2 className="section-title text-lg">{title}</h2>
      </div>
      <p className="mb-4 text-sm text-cream/50">
        {tone === "up" ? "Job-posting mentions climbing month over month." : "Mentions fading from job postings."}
      </p>
      <TrendLineChart trends={trends} />
      <div className="mt-4 flex flex-wrap gap-2">
        {trends.map((t) => (
          <span
            key={t.skill}
            className={`pill ${tone === "up" ? "border-rose-500/30 text-rose-300" : "text-cream/50"}`}
          >
            {t.skill}
            <span className="ml-1 opacity-70">
              {tone === "up" ? "▲" : "▼"} {Math.abs(t.slope).toFixed(1)}/mo
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Trends() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .get("/trends")
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="mb-8">
        <span className="eyebrow">Predict</span>
        <h1 className="mt-1 font-display text-3xl font-bold text-cream">Where the market is heading</h1>
        <p className="mt-1 max-w-xl text-sm text-cream/50">
          A trend regression over 12 months of job-posting mentions per skill.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="card h-96 animate-pulse" />
          <div className="card h-96 animate-pulse" />
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <TrendPanel title="Rising skills" icon={TrendingUp} tone="up" trends={data?.rising || []} />
          <TrendPanel title="Declining skills" icon={TrendingDown} tone="down" trends={data?.declining || []} />
        </div>
      )}
    </Layout>
  );
}
