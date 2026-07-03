"use client";

import { useState } from "react";
import { Play, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface RunButtonProps {
  label: string;
  onRun: () => Promise<{ message: string; count: number }>;
}

export default function RunButton({ label, onRun }: RunButtonProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await onRun();
      setResult(res.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: "#004B8D", boxShadow: "0 1px 3px rgba(0,75,141,0.3)" }}
      >
        {loading ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
        {loading ? "En cours…" : label}
      </button>
      {result && (
        <span className="flex items-center gap-1.5 text-sm" style={{ color: "#047857" }}>
          <CheckCircle size={14} />
          {result}
        </span>
      )}
      {error && (
        <span className="flex items-center gap-1.5 text-sm" style={{ color: "#DC2626" }}>
          <AlertCircle size={14} />
          {error}
        </span>
      )}
    </div>
  );
}
