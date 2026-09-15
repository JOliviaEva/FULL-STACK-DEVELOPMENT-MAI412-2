import { FileUp, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client.js";
import Layout from "../components/Layout.jsx";
import RecommendationCard from "../components/RecommendationCard.jsx";

export default function Recommendations() {
  const [recs, setRecs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const load = async (refresh = false) => {
    if (refresh) setRefreshing(true);
    setError("");
    try {
      const { data } = await client.get("/recommendations", { params: { refresh } });
      setRecs(data);
    } catch {
      setError("Could not load recommendations. Make sure you've uploaded a resume first.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load(false);
  }, []);

  const handleFeedback = async (id, action) => {
    setBusyId(id);
    try {
      const { data } = await client.post(`/recommendations/${id}/feedback`, { action });
      setRecs((prev) => prev.map((r) => (r.id === id ? data : r)));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Layout>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="eyebrow">Recommend</span>
          <h1 className="mt-1 font-display text-3xl font-bold text-cream">Courses matched to you</h1>
          <p className="mt-1 max-w-xl text-sm text-cream/50">
            Blended content similarity + collaborative signal from similar learners, explained in
            plain language.
          </p>
        </div>
        <button onClick={() => load(true)} disabled={refreshing} className="btn-secondary text-sm">
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="card h-56 animate-pulse" />
          ))}
        </div>
      ) : error || !recs?.length ? (
        <div className="card card-sheen p-10 text-center">
          <FileUp className="mx-auto mb-4 text-rose-400" size={30} />
          <h2 className="font-display text-lg font-semibold text-cream">No recommendations yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-cream/50">
            {error || "Upload a resume first so we know what to recommend against."}
          </p>
          <Link to="/resume" className="btn-primary mt-6 inline-flex">
            Upload resume
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {recs
            .slice()
            .sort((a, b) => (a.status === "pending" ? -1 : 1) - (b.status === "pending" ? -1 : 1))
            .map((rec) => (
              <RecommendationCard key={rec.id} rec={rec} onFeedback={handleFeedback} busy={busyId === rec.id} />
            ))}
        </div>
      )}
    </Layout>
  );
}
