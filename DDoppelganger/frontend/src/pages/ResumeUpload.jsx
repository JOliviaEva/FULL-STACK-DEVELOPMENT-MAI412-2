import { ArrowRight, CheckCircle2, FileText, Sparkles, Upload } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client.js";
import Layout from "../components/Layout.jsx";

const SAMPLE =
  "Senior software engineer with 5 years building data products. Strong in Python, SQL and " +
  "machine learning; shipped a recommendation pipeline using scikit-learn and deployed it on AWS " +
  "with Docker and Kubernetes. Comfortable with React for internal tooling and Tableau for " +
  "stakeholder reporting. Led an Agile/Scrum team of 4 engineers.";

export default function ResumeUpload() {
  const [mode, setMode] = useState("text");
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const submitText = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const { data } = await client.post("/resume/upload-text", { resume_text: text });
      setResult(data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not extract skills from that text.");
    } finally {
      setLoading(false);
    }
  };

  const submitFile = async (e) => {
    e.preventDefault();
    if (!file) return;
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const { data } = await client.post("/resume/upload-file", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not read that file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <span className="eyebrow">Learn</span>
        <h1 className="mt-1 font-display text-3xl font-bold text-cream">Feed it your resume</h1>
        <p className="mt-1 max-w-xl text-sm text-cream/50">
          NLP extraction pulls out skills, tools and seniority signals — paste text or upload a
          file (.pdf or .txt).
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card card-sheen p-6">
          <div className="mb-5 flex gap-1 rounded-lg bg-void-soft p-1">
            <button
              onClick={() => setMode("text")}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
                mode === "text" ? "bg-void-raised text-cream shadow-sm" : "text-cream/50"
              }`}
            >
              Paste text
            </button>
            <button
              onClick={() => setMode("file")}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
                mode === "file" ? "bg-void-raised text-cream shadow-sm" : "text-cream/50"
              }`}
            >
              Upload file
            </button>
          </div>

          {mode === "text" ? (
            <form onSubmit={submitText} className="space-y-3">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={10}
                className="input-field resize-none font-mono text-xs leading-relaxed"
                placeholder="Paste your resume text here…"
              />
              <button
                type="button"
                onClick={() => setText(SAMPLE)}
                className="text-xs font-medium text-rose-400 hover:text-rose-300"
              >
                Use sample text
              </button>
              <button type="submit" disabled={loading || text.trim().length < 20} className="btn-primary w-full">
                {loading ? "Extracting skills…" : "Extract skills"} <Sparkles size={15} />
              </button>
            </form>
          ) : (
            <form onSubmit={submitFile} className="space-y-4">
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-void-line py-10 text-center transition-colors hover:border-rose-500/40">
                <Upload size={22} className="text-rose-400" />
                <span className="text-sm text-cream/70">{file ? file.name : "Click to choose a .pdf or .txt file"}</span>
                <input
                  type="file"
                  accept=".pdf,.txt"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </label>
              <button type="submit" disabled={loading || !file} className="btn-primary w-full">
                {loading ? "Extracting skills…" : "Extract skills"} <Sparkles size={15} />
              </button>
            </form>
          )}

          {error && <p className="mt-3 rounded-lg bg-crimson-500/10 px-3 py-2 text-xs text-crimson-300">{error}</p>}
        </div>

        <div className="card card-sheen p-6">
          <div className="mb-4 flex items-center gap-2">
            <FileText size={18} className="text-rose-400" />
            <h2 className="section-title text-lg">Extracted profile</h2>
          </div>

          {!result && (
            <p className="text-sm text-cream/40">Results will appear here once you submit a resume.</p>
          )}

          {result && (
            <div>
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                <CheckCircle2 size={14} />
                {result.ai_generated
                  ? "Extracted with GPT-4o-mini structured extraction."
                  : "Extracted with the deterministic keyword fallback (add a real API key for GPT-level extraction)."}
              </div>
              <div className="flex flex-wrap gap-2">
                {result.skills.map((s) => (
                  <span
                    key={s.name}
                    className="inline-flex items-center gap-1.5 rounded-full border border-void-line bg-void-soft px-3 py-1.5 text-xs font-medium text-cream/80"
                  >
                    {s.name}
                    <span className="text-rose-400">{Math.round(s.proficiency * 100)}%</span>
                  </span>
                ))}
              </div>
              <Link to="/dashboard" className="btn-primary mt-6 inline-flex">
                See my dashboard <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
