"use client";

import { useState } from "react";
import { Play, Loader2, CheckCircle, AlertCircle } from "lucide-react";

const BLUE = "#0054A6";

export default function RunButton({ label, onRun }: {
  label: string;
  onRun: () => Promise<{ message: string; count: number }>;
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error,  setError]  = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true); setResult(null); setError(null);
    try {
      const r = await onRun();
      setResult(r.message);
      // Effacer le message de succès après 4s
      setTimeout(() => setResult(null), 4000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          padding: "8px 18px", borderRadius: 8,
          background: loading ? "#3A7BC8" : BLUE,
          color: "#fff", border: "none",
          fontSize: 13, fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          boxShadow: loading ? "none" : "0 2px 8px rgba(0,84,166,0.3)",
          letterSpacing: "0.01em",
        }}
      >
        {loading
          ? <Loader2 size={14} className="animate-spin" />
          : <Play size={14} />}
        {loading ? "En cours…" : label}
      </button>

      {result && (
        <span
          className="anim-fade"
          style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#16A34A" }}
        >
          <CheckCircle size={14} /> {result}
        </span>
      )}
      {error && (
        <span
          className="anim-fade"
          style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#DC2626" }}
        >
          <AlertCircle size={14} /> {error}
        </span>
      )}
    </div>
  );
}
