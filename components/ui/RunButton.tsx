"use client";

import { useState } from "react";
import { Play, Loader2, CheckCircle, AlertCircle } from "lucide-react";

const BLUE = "#0693E3";

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
          padding: "8px 16px", borderRadius: 8,
          background: loading ? "#7CC8F4" : BLUE,
          color: "#fff", border: "none",
          fontSize: 13, fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          boxShadow: "0 1px 3px rgba(6,147,227,0.3)",
          transition: "background 0.15s",
          letterSpacing: "0.01em",
        }}
      >
        {loading
          ? <Loader2 size={14} className="animate-spin" />
          : <Play size={14} />}
        {loading ? "En cours…" : label}
      </button>

      {result && (
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#16A34A" }}>
          <CheckCircle size={13} /> {result}
        </span>
      )}
      {error && (
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#DC2626" }}>
          <AlertCircle size={13} /> {error}
        </span>
      )}
    </div>
  );
}
