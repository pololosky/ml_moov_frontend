"use client";

import { useEffect, useState } from "react";
import {
  Users, UserCheck, Building2, CreditCard,
  TrendingDown, ShieldAlert, PieChart, Loader2, LayoutDashboard,
} from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import PageHeader from "@/components/ui/PageHeader";
import {
  getDashboardOverview, getChurnByRegion, getFraudeByType,
  type DashboardOverview, type ChurnByRegion, type FraudeByType,
} from "@/lib/api";

// ─── composants locaux inline-styled ─────────────────────────────────────────

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: "#ffffff", border: "1px solid #EAECF0", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#9CA3AF" }}>
      {children}
    </p>
  );
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 rounded-full h-1.5" style={{ backgroundColor: "#F3F4F6" }}>
        <div className="h-1.5 rounded-full transition-all" style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs w-10" style={{ color: "#6B7280" }}>{value}%</span>
    </div>
  );
}

// ─── composant principal ──────────────────────────────────────────────────────

export default function DashboardOverview() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [churnByRegion, setChurnByRegion] = useState<ChurnByRegion[]>([]);
  const [fraudeByType, setFraudeByType] = useState<FraudeByType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboardOverview(), getChurnByRegion(), getFraudeByType()])
      .then(([o, c, f]) => { setOverview(o); setChurnByRegion(c); setFraudeByType(f); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin" style={{ color: "#004B8D" }} />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl">
      <PageHeader
        title="Dashboard"
        description="Vue globale de la plateforme ML Moov Africa Togo"
        icon={LayoutDashboard}
        accent="blue"
      />

      {/* KPIs données */}
      <section>
        <SectionLabel>Données</SectionLabel>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Clients" value={overview?.nb_clients ?? 0} icon={Users} accent="blue" />
          <StatCard title="Clients actifs" value={overview?.nb_clients_actifs ?? 0} icon={UserCheck} accent="green" />
          <StatCard title="Agents" value={overview?.nb_agents ?? 0} icon={Building2} accent="blue" />
          <StatCard title="Transactions" value={overview?.nb_transactions ?? 0} icon={CreditCard} accent="orange" />
        </div>
      </section>

      {/* KPIs ML */}
      <section>
        <SectionLabel>Prédictions ML</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Clients analysés — Churn"
            value={overview?.nb_churn_total ?? 0}
            subtitle={`${overview?.taux_churn_pct ?? 0}% taux de churn`}
            icon={TrendingDown}
            accent="orange"
          />
          <StatCard
            title="Transactions analysées — Fraude"
            value={overview?.nb_fraude_total ?? 0}
            subtitle={`${overview?.taux_fraude_pct ?? 0}% frauduleuses`}
            icon={ShieldAlert}
            accent="red"
          />
          <StatCard
            title="Clients segmentés"
            value={overview?.nb_segmentation ?? 0}
            icon={PieChart}
            accent="blue"
          />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Churn par région */}
        {churnByRegion.length > 0 && (
          <section>
            <SectionLabel>Churn par région</SectionLabel>
            <Card>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
                    {["Région", "Clients", "Taux churn"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "#9CA3AF" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {churnByRegion.map((r, i) => (
                    <tr
                      key={r.region}
                      style={{ borderBottom: i < churnByRegion.length - 1 ? "1px solid #F9FAFB" : "none" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#FAFAFA")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td className="px-4 py-3 font-medium text-sm" style={{ color: "#1C1C2E" }}>{r.region_label}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: "#6B7280" }}>{r.total.toLocaleString("fr-FR")}</td>
                      <td className="px-4 py-3">
                        <ProgressBar value={r.taux_pct} color={r.taux_pct > 30 ? "#F15A24" : "#004B8D"} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </section>
        )}

        {/* Fraude par type */}
        {fraudeByType.length > 0 && (
          <section>
            <SectionLabel>Fraude par type de transaction</SectionLabel>
            <Card>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
                    {["Type", "Total", "Taux fraude"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "#9CA3AF" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fraudeByType.map((r, i) => (
                    <tr
                      key={r.type_transaction}
                      style={{ borderBottom: i < fraudeByType.length - 1 ? "1px solid #F9FAFB" : "none" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#FAFAFA")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td className="px-4 py-3 font-medium text-xs" style={{ color: "#1C1C2E" }}>{r.type_label}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: "#6B7280" }}>{r.total.toLocaleString("fr-FR")}</td>
                      <td className="px-4 py-3">
                        <ProgressBar value={r.taux_pct} color="#F15A24" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </section>
        )}
      </div>
    </div>
  );
}
