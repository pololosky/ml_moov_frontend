"use client";

import { useEffect, useState, useCallback } from "react";
import { TrendingDown, Users, Star, Clock, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import RunButton from "@/components/ui/RunButton";
import PageHeader from "@/components/ui/PageHeader";
import {
  getChurnStats, getChurnPredictions, runChurnPredictions,
  type ChurnStats, type ChurnRow, type PaginatedResult,
} from "@/lib/api";

const FILTERS = [
  { label: "Tous", value: undefined },
  { label: "Churné", value: 1 },
  { label: "Actif", value: 0 },
];

export default function ChurnDashboard() {
  const [stats, setStats] = useState<ChurnStats | null>(null);
  const [result, setResult] = useState<PaginatedResult<ChurnRow> | null>(null);
  const [page, setPage] = useState(1);
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
    <div className="p-8 space-y-6 max-w-7xl">
      <PageHeader
        title="Prédiction du Churn"
        description="Identifiez les clients susceptibles de résilier"
        icon={TrendingDown}
        accent="orange"
        action={
          <RunButton
            label="Lancer la prédiction"
            onRun={async () => { const r = await runChurnPredictions(); await fetchData(); return r; }}
          />
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Clients analysés" value={stats?.total ?? 0} icon={Users} accent="blue" />
        <StatCard
          title="Clients churné"
          value={stats?.churned ?? 0}
          subtitle={`${stats?.taux_churn_pct ?? 0}% de taux`}
          icon={TrendingDown}
          accent="orange"
        />
        <StatCard
          title="ARPU moyen"
          value={stats ? `${Math.round(Number(stats.arpu_moyen)).toLocaleString("fr-FR")} FCFA` : "—"}
          icon={Star}
          accent="blue"
        />
        <StatCard
          title="Ancienneté moy."
          value={stats ? `${stats.anciennete_moy} mois` : "—"}
          icon={Clock}
          accent="green"
        />
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-2">
        {FILTERS.map(({ label, value }) => (
          <button
            key={label}
            onClick={() => { setFilter(value); setPage(1); }}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all border ${
              filter === value
                ? "text-white border-transparent shadow-sm"
                : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
            style={filter === value ? { backgroundColor: "#004B8D", borderColor: "#004B8D" } : undefined}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 size={24} className="animate-spin text-[#004B8D]" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50">
                  {["Client ID", "Statut", "Région", "Type client", "ARPU (FCFA)", "Réclamations", "Dem. résiliation", "Satisfaction"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {result?.data.map((row) => (
                  <tr key={row.client_id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{row.client_id}</td>
                    <td className="px-4 py-3">
                      {row.churn_flag === 1 ? (
                        <Badge label="Churné" variant="orange" />
                      ) : (
                        <Badge label="Actif" variant="green" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{row.region_label}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{row.type_client_label}</td>
                    <td className="px-4 py-3 text-gray-700 font-medium">
                      {Number(row.arpu_moyen_fcfa).toLocaleString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{row.nb_reclamations}</td>
                    <td className="px-4 py-3">
                      <span className={row.nb_demandes_resiliation > 0 ? "font-semibold text-[#F15A24]" : "text-gray-600"}>
                        {row.nb_demandes_resiliation}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {row.satisfaction_moy ? Number(row.satisfaction_moy).toFixed(2) : "—"}
                    </td>
                  </tr>
                ))}
                {!result?.data.length && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-sm">
                      Aucune donnée. Importez les données puis lancez la prédiction.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {result?.total.toLocaleString("fr-FR")} résultats · Page {page}/{totalPages}
          </p>
          <div className="flex gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
