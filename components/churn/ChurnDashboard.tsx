"use client";

import { useEffect, useState, useCallback } from "react";
import { TrendingDown, Users, Banknote, Calendar, Loader2 } from "lucide-react";
import StatCard    from "@/components/ui/StatCard";
import Badge       from "@/components/ui/Badge";
import RunButton   from "@/components/ui/RunButton";
import PageHeader  from "@/components/ui/PageHeader";
import DataTable   from "@/components/ui/DataTable";
import Pagination  from "@/components/ui/Pagination";
import {
  getChurnStats, getChurnPredictions, runChurnPredictions,
  type ChurnStats, type ChurnPrediction, type PaginatedResult,
} from "@/lib/api";

const BLUE   = "#0054A6";
const ORANGE = "#E96805";

const FILTERS = [
  { label: "Tous",   value: undefined },
  { label: "Churné", value: 1 },
  { label: "Actif",  value: 0 },
];

function ScoreBar({ score }: { score: number }) {
  const pct   = Math.round(score * 100);
  const color = score >= 0.7 ? ORANGE : score >= 0.4 ? "#D97706" : "#16A34A";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 5, background: "#F1F5F9", borderRadius: 3, maxWidth: 64 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3 }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color, minWidth: 38 }}>{score.toFixed(3)}</span>
    </div>
  );
}

export default function ChurnDashboard() {
  const [stats,  setStats]  = useState<ChurnStats | null>(null);
  const [result, setResult] = useState<PaginatedResult<ChurnPrediction> | null>(null);
  const [page,   setPage]   = useState(1);
  const [filter, setFilter] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, r] = await Promise.all([
        getChurnStats(),
        getChurnPredictions(page, 50, filter),
      ]);
      setStats(s);
      setResult(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalPages = result ? Math.ceil(result.total / 50) : 1;

  return (
    <div className="anim-fade-up" style={{ padding: "32px 36px", maxWidth: 1200 }}>
      <PageHeader
        title="Prédiction du Churn"
        description="Identifiez les clients susceptibles de résilier leur abonnement"
        icon={TrendingDown}
        accent="orange"
        action={
          <RunButton
            label="Lancer la prédiction"
            onRun={async () => { const r = await runChurnPredictions(); await fetchData(); return r; }}
          />
        }
      />

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        <StatCard title="Clients analysés" value={stats?.total ?? 0} icon={Users} accent="blue" />
        <StatCard
          title="Clients à risque"
          value={stats?.churned ?? 0}
          subtitle={`Taux : ${stats?.taux_churn_pct ?? 0}%`}
          icon={TrendingDown}
          accent="orange"
        />
        <StatCard
          title="ARPU moyen"
          value={stats?.arpu_moyen != null
            ? `${Math.round(Number(stats.arpu_moyen)).toLocaleString("fr-FR")} F`
            : "—"}
          icon={Banknote}
          accent="blue"
        />
        <StatCard
          title="Ancienneté moy."
          value={stats?.anciennete_moy != null ? `${stats.anciennete_moy} mois` : "—"}
          icon={Calendar}
          accent="green"
        />
      </div>

      {/* Filtres */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {FILTERS.map(({ label, value }) => {
          const active = filter === value;
          return (
            <button
              key={label}
              onClick={() => { setFilter(value); setPage(1); }}
              style={{
                padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                border: active ? "none" : "1px solid #E8ECF0",
                background: active ? BLUE : "#FFF",
                color: active ? "#FFF" : "#4A5568",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {label}
            </button>
          );
        })}
        {stats?.pending_retraining ? (
          <span style={{
            marginLeft: "auto", display: "flex", alignItems: "center", gap: 5,
            fontSize: 11, color: "#C85A04",
            background: "#FEF3E8", border: "1px solid #FDDCC0",
            padding: "4px 10px", borderRadius: 20,
          }}>
            {stats.pending_retraining} clients en attente de recalcul
          </span>
        ) : null}
      </div>

      {/* Tableau */}
      <DataTable
        loading={loading}
        rowKey={(r) => r.id}
        rows={result?.data ?? []}
        emptyMessage="Aucune prédiction. Importez les données puis lancez la prédiction."
        columns={[
          { key: "client_id", header: "Client ID",
            render: (r) => <span style={{ fontFamily: "monospace", fontSize: 11, color: "#8A97A8" }}>{r.client_id}</span> },
          { key: "churn_flag", header: "Statut",
            render: (r) => r.churn_flag === 1
              ? <Badge label="Risque churn" variant="orange" />
              : <Badge label="Actif" variant="green" /> },
          { key: "score_churn", header: "Score",
            render: (r) => <ScoreBar score={Number(r.score_churn)} /> },
          { key: "region_label", header: "Région",
            render: (r) => <span style={{ color: "#4A5568", fontSize: 12 }}>{r.region_label ?? "—"}</span> },
          { key: "type_client_label", header: "Type client",
            render: (r) => <span style={{ color: "#4A5568", fontSize: 12 }}>{r.type_client_label ?? "—"}</span> },
          { key: "arpu_moyen_fcfa", header: "ARPU (FCFA)", align: "right",
            render: (r) => <span style={{ fontWeight: 600, color: BLUE }}>
              {r.arpu_moyen_fcfa != null ? Number(r.arpu_moyen_fcfa).toLocaleString("fr-FR") : "—"}
            </span> },
          { key: "nb_reclamations", header: "Réclamations", align: "right",
            render: (r) => <span style={{ color: "#4A5568" }}>{r.nb_reclamations ?? 0}</span> },
          { key: "nb_demandes_resiliation", header: "Dem. rés.", align: "right",
            render: (r) => (
              <span style={{ fontWeight: r.nb_demandes_resiliation ? 700 : 400, color: r.nb_demandes_resiliation ? ORANGE : "#8A97A8" }}>
                {r.nb_demandes_resiliation ?? 0}
              </span>
            ) },
          { key: "satisfaction_moy", header: "Satisfaction", align: "right",
            render: (r) => <span style={{ color: "#4A5568", fontSize: 12 }}>
              {r.satisfaction_moy != null ? Number(r.satisfaction_moy).toFixed(2) : "—"}
            </span> },
        ]}
      />

      <Pagination
        page={page} totalPages={totalPages}
        total={result?.total ?? 0}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
      />
    </div>
  );
}
