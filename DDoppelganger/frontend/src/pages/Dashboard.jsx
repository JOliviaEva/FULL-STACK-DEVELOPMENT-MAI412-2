import { ArrowRight, Compass, FileUp, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client.js";
import Layout from "../components/Layout.jsx";
import RiskGauge from "../components/RiskGauge.jsx";
import SkillRadarChart from "../components/SkillRadarChart.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [decay, setDecay] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [profileRes, decayRes] = await Promise.all([
          client.get("/skills/profile"),
          client.get("/trends/decay-score"),
        ]);
        if (!cancelled) {
          setProfile(profileRes.data);
          setDecay(decayRes.data);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const hasSkills = profile?.skills?.length > 0;
  const firstName = (user?.full_name || "").split(" ")[0];

  return (
    <Layout>
      <div className="mb-8">
        <span className="eyebrow">Dashboard</span>
        <h1 className="mt-1 font-display text-3xl font-bold text-cream">
          {firstName ? `Welcome back, ${firstName}.` : "Welcome back."}
        </h1>
        <p className="mt-1 text-sm text-cream/50">Here's where your skillset stands against the market today.</p>
      </div>

      {loading ? (
        <div className="grid gap-5 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card h-64 animate-pulse" />
          ))}
        </div>
      ) : !hasSkills ? (
        <div className="card card-sheen p-10 text-center">
          <FileUp className="mx-auto mb-4 text-rose-400" size={32} />
          <h2 className="font-display text-xl font-semibold text-cream">Let's build your skill profile</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-cream/50">
            Upload a resume (or paste it as text) and the extraction engine will map out your
            skills, categories and proficiency in seconds.
          </p>
          <Link to="/resume" className="btn-primary mt-6 inline-flex">
            Upload resume <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="card card-sheen p-6 lg:col-span-2">
            <h2 className="section-title mb-1">Skill radar</h2>
            <p className="mb-2 text-sm text-cream/50">Average proficiency by category.</p>
            <SkillRadarChart categories={profile.categories} />
          </div>

          <div className="card card-sheen flex flex-col items-center justify-center p-6">
            <h2 className="section-title mb-1 self-start">Obsolescence risk</h2>
            <p className="mb-4 self-start text-sm text-cream/50">6–12 month outlook.</p>
            {decay && <RiskGauge score={decay.risk_score} label={decay.risk_label} />}
            {decay?.explanation && (
              <p className="mt-4 text-center text-xs leading-relaxed text-cream/50">{decay.explanation}</p>
            )}
          </div>

          <div className="card card-sheen p-6 lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="section-title">Your skills ({profile.skills.length})</h2>
              <Link to="/resume" className="btn-ghost text-xs">
                Add more
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.skills
                .slice()
                .sort((a, b) => b.proficiency - a.proficiency)
                .map((s) => (
                  <span
                    key={s.name}
                    className="inline-flex items-center gap-1.5 rounded-full border border-void-line bg-void-soft px-3 py-1.5 text-xs font-medium text-cream/80"
                  >
                    {s.name}
                    <span className="text-rose-400">{Math.round(s.proficiency * 100)}%</span>
                  </span>
                ))}
            </div>
          </div>

          <Link to="/recommendations" className="card card-sheen group p-6 transition-colors hover:border-rose-500/40">
            <Compass className="mb-3 text-rose-400" size={22} />
            <h3 className="font-display text-base font-semibold text-cream">See recommendations</h3>
            <p className="mt-1 text-xs text-cream/50">Ranked courses that close your specific skill gaps.</p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-rose-400 group-hover:gap-2 transition-all">
              Explore <ArrowRight size={13} />
            </span>
          </Link>

          <Link to="/trends" className="card card-sheen group p-6 transition-colors hover:border-rose-500/40">
            <Sparkles className="mb-3 text-rose-400" size={22} />
            <h3 className="font-display text-base font-semibold text-cream">Market trends</h3>
            <p className="mt-1 text-xs text-cream/50">Which skills are rising, which are fading.</p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-rose-400 group-hover:gap-2 transition-all">
              View trends <ArrowRight size={13} />
            </span>
          </Link>

          <Link to="/persona" className="card card-sheen group p-6 transition-colors hover:border-rose-500/40">
            <Sparkles className="mb-3 text-rose-400" size={22} />
            <h3 className="font-display text-base font-semibold text-cream">Your persona</h3>
            <p className="mt-1 text-xs text-cream/50">The emerging role your data quietly points toward.</p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-rose-400 group-hover:gap-2 transition-all">
              Discover <ArrowRight size={13} />
            </span>
          </Link>
        </div>
      )}
    </Layout>
  );
}
