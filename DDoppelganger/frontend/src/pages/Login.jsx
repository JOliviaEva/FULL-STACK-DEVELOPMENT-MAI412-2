import { ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not log in. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-void px-6">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-crimson-400 to-burgundy-800 shadow-glow-soft">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="font-display text-lg font-semibold text-cream">Doppelgänger</span>
        </Link>

        <div className="card card-sheen p-7">
          <h1 className="font-display text-xl font-semibold text-cream">Welcome back</h1>
          <p className="mt-1 text-sm text-cream/50">Log in to see what's changed in your market.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-cream/60">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-cream/60">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="rounded-lg bg-crimson-500/10 px-3 py-2 text-xs text-crimson-300">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Signing in…" : "Sign in"} <ArrowRight size={16} />
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-cream/50">
          New here?{" "}
          <Link to="/signup" className="font-medium text-rose-400 hover:text-rose-300">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
