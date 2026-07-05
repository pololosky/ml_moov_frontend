"use client";

import { useEffect, useState } from "react";
import {
  Users, UserCheck, Building2, CreditCard,
  TrendingDown, ShieldAlert, PieChart, Loader2,
  LayoutDashboard, Clock, AlertCircle, RefreshCw,
} from "lucide-react";
import StatCard   from "@/components/ui/StatCard";
import PageHeader from "@/components/ui/PageHeader";
import DataTable  from "@/components/ui/DataTable";
import {
  getDashboardOverview, getChurnByRegion, getFraudeByType, getRecentRuns,
  type DashboardOverview, type ChurnByRegion, type FraudeByType, type ModelRun,
} from "@/lib/api";

const BLUE   = "#0693E3";
const ORANGE = "#E96805";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: 12, fontWeight: 700, color: "#8A97A8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" }}>
      {children}
    </h2>
  );
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 5, background: "#F1F5F9", borderRadius: 3, overflow: "hidden", maxWidth: 80 }}>
        <div style={{ height: "100%", width: `${Math.min(value, 100)}%`, background: color, borderRadius: 3, transition: "width 0.3s" }} />
      </div>
      <span style={{ fontSize: 11, color: "#8A97A8", minWidth: 32, textAlign: "right" }}>{value}%</span>
    </div>
  );
}

function PendingAlert({ count, label }: { count: number; label: string }) {
  if (!count) return null;
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "5px 12px", borderRadius: 20,
      background: "#FEF3E8", border: "1px solid #FDDCC0",
      fontSize: 11, fontWeight: 600, color: "#C85A04",
    }}>
      <AlertCircle size={12} />
      {count.toLocaleString("fr-FR")} {label}
    </div>
  );
}

export default function DashboardOverview() {
  const [overview,      setOverview]      = useState<DashboardOverview | null>(null);
  const [churnByRegion, setChurnByRegion] = useState<ChurnByRegion[]>([]);
  const [fraudeByType,  setFraudeByType]  = useState<FraudeByType[]>([]);
  const [recentRuns,    setRecentRuns]    = useState<ModelRun[]>([]);
  const [loading,       setLoading]       = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([
      getDashboardOverview(),
      getChurnByRegion(),
      getFraudeByType(),
      getRecentRuns(5),
    ])
      .then(([o, c, f, r]) => { setOverview(o); setChurnByRegion(c); setFraudeByType(f); setRecentRuns(r); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading && !overview) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
        <Loader2 size={28} className="animate-spin" style={{ color: BLUE }} />
      </div>
    );
  }

  const CAS_STYLE: Record<string, { bg: string; color: string }> = {
    churn:        { bg: "#FEF3E8", color: ORANGE },
    fraude:       { bg: "#FEF2F2", color: "#DC2626" },
    segmentation: { bg: "#E8F5FD", color: BLUE },
  };

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1200 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <PageHeader
          title="Dashboard"
          description="Vue globale de la plateforme ML Analytics — Moov Africa Togo"
          icon={LayoutDashboard}
          accent="blue"
        />
        <button
          onClick={load}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "7px 14px", borderRadius: 8,
            background: "#fff", border: "1px solid #E8ECF0",
            color: "#4A5568", fontSize: 12, fontWeight: 500,
            cursor: "pointer",
          }}
        >
          <RefreshCw size={13} /> Actualiser
        </button>
      </div>

      {/* Alertes pending */}
      {overview && (overview.churn_pending > 0 || overview.seg_pending > 0 || overview.fraude_pending > 0) && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
          <PendingAlert count={overview.churn_pending}  label="clients churn à recalculer" />
          <PendingAlert count={overview.seg_pending}    label="clients seg. à recalculer" />
          <PendingAlert count={overview.fraude_pending} label="transactions non scorées" />
        </div>
      )}

      {/* KPIs sources */}
      <div style={{ marginBottom: 32 }}>
        <SectionTitle>Données sources</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          <StatCard title="Clients total"   value={overview?.nb_clients ?? 0}        icon={Users}     accent="blue" />
          <StatCard title="Clients actifs"  value={overview?.nb_clients_actifs ?? 0}  icon={UserCheck} accent="green" />
          <StatCard title="Agents"          value={overview?.nb_agents ?? 0}           icon={Building2} accent="blue" />
          <StatCard title="Transactions"    value={overview?.nb_transactions ?? 0}     icon={CreditCard} accent="orange" />
        </div>
      </div>

      {/* KPIs ML */}
      <div style={{ marginBottom: 32 }}>
        <SectionTitle>Prédictions actives (is_latest)</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          <StatCard
            title="Churn — analysés"
            value={overview?.nb_churn_analyses ?? 0}
            subtitle={`Taux churn : ${overview?.taux_churn_pct ?? 0}%`}
            icon={TrendingDown}
            accent="orange"
          />
          <StatCard
            title="Fraude — analysées"
            value={overview?.nb_fraude_analyses ?? 0}
            subtitle={`Frauduleuses : ${overview?.taux_fraude_pct ?? 0}%`}
            icon={ShieldAlert}
            accent="red"
          />
          <StatCard
            title="Segmentation"
            value={overview?.nb_segmentes ?? 0}
            subtitle="Clients segmentés"
            icon={PieChart}
            accent="blue"
          />
        </div>
      </div>

      {/* Tableaux analytics */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
        {churnByRegion.length > 0 && (
          <div>
            <SectionTitle>Churn par région</SectionTitle>
            <DataTable
              rowKey={(r) => r.region}
              rows={churnByRegion}
              columns={[
                { key: "region_label", header: "Région",
                  render: (r) => <span style={{ fontWeight: 500, color: "#0F1923" }}>{r.region_label}</span> },
                { key: "total", header: "Clients",
                  render: (r) => <span style={{ color: "#4A5568" }}>{r.total.toLocaleString("fr-FR")}</span>,
                  align: "right" },
                { key: "taux_pct", header: "Taux",
                  render: (r) => <ProgressBar value={r.taux_pct} color={r.taux_pct > 30 ? ORANGE : BLUE} /> },
              ]}
            />
          </div>
        )}

        {fraudeByType.length > 0 && (
          <div>
            <SectionTitle>Fraude par type de transaction</SectionTitle>
            <DataTable
              rowKey={(r) => r.type_transaction}
              rows={fraudeByType}
              columns={[
                { key: "type_label", header: "Type",
                  render: (r) => <span style={{ fontWeight: 500, color: "#0F1923", fontSize: 12 }}>{r.type_label}</span> },
                { key: "frauduleuses", header: "Fraudes",
                  render: (r) => <span style={{ color: r.frauduleuses > 0 ? "#DC2626" : "#8A97A8", fontWeight: 600 }}>{r.frauduleuses.toLocaleString("fr-FR")}</span>,
                  align: "right" },
                { key: "taux_pct", header: "Taux",
                  render: (r) => <ProgressBar value={r.taux_pct} color={ORANGE} /> },
              ]}
            />
          </div>
        )}
      </div>

      {/* Derniers runs */}
      {recentRuns.length > 0 && (
        <div>
          <SectionTitle>Derniers runs ML</SectionTitle>
          <DataTable
            rowKey={(r) => r.id}
            rows={recentRuns}
            columns={[
              { key: "id", header: "#",
                render: (r) => <span style={{ fontFamily: "monospace", color: "#8A97A8", fontSize: 12 }}>#{r.id}</span> },
              { key: "cas_usage", header: "Modèle",
                render: (r) => {
                  const s = CAS_STYLE[r.cas_usage] ?? { bg: "#F1F5F9", color: "#64748B" };
                  return (
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "2px 9px", borderRadius: 20,
                      fontSize: 11, fontWeight: 600,
                      background: s.bg, color: s.color,
                    }}>
                      <Clock size={10} /> {r.cas_usage}
                    </span>
                  );
                },
              },
              { key: "modele_version", header: "Version",
                render: (r) => <span style={{ fontFamily: "monospace", fontSize: 12, color: "#4A5568" }}>{r.modele_version}</span> },
              { key: "nb_predictions", header: "Prédictions",
                render: (r) => <span style={{ color: BLUE, fontWeight: 600 }}>{r.nb_predictions.toLocaleString("fr-FR")}</span>,
                align: "right" },
              { key: "run_at", header: "Date",
                render: (r) => <span style={{ color: "#8A97A8", fontSize: 12 }}>
                  {new Date(r.run_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                </span> },
            ]}
          />
        </div>
      )}
    </div>
  );
}
