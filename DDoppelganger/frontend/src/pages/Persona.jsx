import { useEffect, useState } from "react";
import client from "../api/client.js";
import Layout from "../components/Layout.jsx";
import PersonaCard from "../components/PersonaCard.jsx";

export default function Persona() {
  const [persona, setPersona] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    client
      .get("/persona")
      .then(({ data }) => setPersona(data))
      .catch(() => setError("Could not compute a persona yet — add a few skills first."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="mb-8">
        <span className="eyebrow">The strange insight</span>
        <h1 className="mt-1 font-display text-3xl font-bold text-cream">Your emerging skill persona</h1>
        <p className="mt-1 max-w-xl text-sm text-cream/50">
          Unsupervised clustering over everyone's skill patterns — not a rule anyone wrote by hand.
        </p>
      </div>

      {loading ? (
        <div className="card h-72 animate-pulse" />
      ) : error ? (
        <div className="card card-sheen p-10 text-center text-sm text-cream/50">{error}</div>
      ) : (
        <PersonaCard persona={persona} />
      )}
    </Layout>
  );
}
