"use client";

import { useEffect, useState, useCallback } from "react";
import { ShieldAlert, AlertTriangle, CheckCircle, BarChart3 } from "lucide-react";
import StatCard   from "@/components/ui/StatCard";
import Badge      from "@/components/ui/Badge";
import RunButton  from "@/components/ui/RunButton";
import PageHeader from "@/components/ui/PageHeader";
import DataTable  from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import {
  getFraudeStats, getFraudePredictions, runFraudeDetection,
  type FraudeStats, type FraudePrediction, type PaginatedResult,
} from "@/lib/api";

const BLUE   = "#0054A6";
const ORANGE = "#E96805";

const FLAG_FILTERS = [
  { label: "Toutes",       value: undefined },
  { label: "Frauduleuses", value: 1 },
  { label: "Normales",     value: 0 },
];

const TYPE_TX: Record<number, string> = {
  0: "Recharge crédit",
  1: "Transfert P2P",
  2: "Cash-out Flooz",
  3: "Cash-in Flooz",
  4: "Achat forfait",
};

export default function FraudeDashboard() {
  const [stats,   setStats]   = useState<FraudeStats | null>(null);
  const [result,  setResult]  = useState<PaginatedResult<FraudePrediction> | null>(null);
  const [page,    setPage]    = useState(1);
  const [flagF,   setFlagF]   = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, r] = await Promise.all([
        getFraudeStats(),
        getFraudePredictions(page, 50, flagF),
      ]);
      setStats(s);
      setResult(r);
    } catch (e) { console.error(e); }
    finally     { setLoading(false); }
  }, [page, flagF]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalPages = result ? Math.ceil(result.total / 50) : 1;

  return (
    <div className="anim-fade-up" style={{ padding: "32px 36px", maxWidth: 1200 }}>
      <PageHeader
        title="Détection de Fraude"
        description="Analyse des transactions suspectes des agents de distribution"
        icon={ShieldAlert}
        accent="orange"
        action={
          <RunButton
            label="Lancer la détection"
            onRun={async () => { const r = await runFraudeDetection(); await fetchData(); return r; }}
          />
        }
      />

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        <StatCard
          title="Transactions analysées"
          value={stats?.total ?? 0}
          icon={ShieldAlert}
          accent="blue"
        />
        <StatCard
          title="Frauduleuses"
          value={stats?.frauduleuses ?? 0}
          subtitle={`Taux : ${stats?.taux_fraude_pct ?? 0}%`}
          icon={AlertTriangle}
          accent="red"
        />
        <StatCard
          title="Normales"
          value={stats?.normales ?? 0}
          icon={CheckCircle}
          accent="green"
        />
        <StatCard
          title="Non scorées"
          value={stats?.pending_predictions ?? 0}
          subtitle="Transactions en attente"
          icon={BarChart3}
          accent="orange"
        />
      </div>

      {/* Filtres */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {FLAG_FILTERS.map(({ label, value }) => {
          const active = flagF === value;
          return (
            <button
              key={label}
              onClick={() => { setFlagF(value); setPage(1); }}
              style={{
                padding: "6px 14px", borderRadius: 8,
                fontSize: 12, fontWeight: 600,
                border: active ? "none" : "1px solid #E8ECF0",
                background: active ? ORANGE : "#FFF",
                color: active ? "#FFF" : "#4A5568",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Tableau */}
      <DataTable
        loading={loading}
        rowKey={(r) => r.id}
        rows={result?.data ?? []}
        emptyMessage="Aucune prédiction. Importez les transactions puis lancez la détection."
        columns={[
          {
            key: "transaction_id",
            header: "Tx ID",
            render: (r) => (
              <span style={{ fontFamily: "monospace", fontSize: 11, color: "#8A97A8" }}>
                {r.transaction_id}
              </span>
            ),
          },
          {
            key: "fraude_flag",
            header: "Résultat ML",
            render: (r) =>
              r.fraude_flag === 1
                ? <Badge label="Frauduleuse" variant="red" />
                : <Badge label="Normale" variant="green" />,
          },
          {
            key: "score_fraude",
            header: "Score",
            align: "right",
            render: (r) => {
              const s = Number(r.score_fraude);
              const c = s >= 0.7 ? "#DC2626" : s >= 0.5 ? ORANGE : "#16A34A";
              return (
                <span style={{ fontWeight: 700, color: c, fontSize: 13 }}>
                  {s.toFixed(4)}
                </span>
              );
            },
          },
          {
            key: "agent_id",
            header: "Agent",
            render: (r) => (
              <span style={{ fontFamily: "monospace", fontSize: 11, color: "#4A5568" }}>
                {r.agent_id ?? "—"}
              </span>
            ),
          },
          {
            key: "type_transaction",
            header: "Type",
            render: (r) => (
              <span style={{ fontSize: 12, color: "#4A5568" }}>
                {TYPE_TX[r.type_transaction ?? -1] ?? "—"}
              </span>
            ),
          },
          {
            key: "montant_fcfa",
            header: "Montant (FCFA)",
            align: "right",
            render: (r) => (
              <span style={{ fontWeight: 600, color: BLUE }}>
                {r.montant_fcfa != null
                  ? Number(r.montant_fcfa).toLocaleString("fr-FR")
                  : "—"}
              </span>
            ),
          },
          {
            key: "nb_tx_24h",
            header: "Vélocité 24h",
            align: "right",
            render: (r) => (
              <span
                style={{
                  color: (r.nb_tx_24h ?? 0) > 10 ? ORANGE : "#4A5568",
                  fontWeight: (r.nb_tx_24h ?? 0) > 10 ? 700 : 400,
                }}
              >
                {r.nb_tx_24h ?? 0}
              </span>
            ),
          },
          {
            key: "ratio_montant_plafond",
            header: "Ratio plafond",
            align: "right",
            render: (r) => {
              const v = Number(r.ratio_montant_plafond ?? 0);
              return (
                <span style={{ color: v > 1 ? "#DC2626" : "#4A5568", fontWeight: v > 1 ? 700 : 400 }}>
                  {v.toFixed(3)}
                </span>
              );
            },
          },
          {
            key: "region_label",
            header: "Région",
            render: (r) => (
              <span style={{ fontSize: 12, color: "#4A5568" }}>
                {r.region_label ?? "—"}
              </span>
            ),
          },
          {
            key: "predicted_at",
            header: "Date",
            render: (r) => (
              <span style={{ fontSize: 11, color: "#8A97A8" }}>
                {r.predicted_at
                  ? new Date(r.predicted_at).toLocaleDateString("fr-FR")
                  : "—"}
              </span>
            ),
          },
        ]}
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        total={result?.total ?? 0}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
      />
    </div>
  );
}
