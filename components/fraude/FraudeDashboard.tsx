"use client";

import { useEffect, useState, useCallback } from "react";
import { ShieldAlert, AlertTriangle, CheckCircle, TrendingUp, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import RunButton from "@/components/ui/RunButton";
import PageHeader from "@/components/ui/PageHeader";
import {
  getFraudeStats, getFraudePredictions, runFraudeDetection,
  type FraudeStats, type FraudeRow, type PaginatedResult,
} from "@/lib/api";

const FILTERS = [
  { label: "Toutes", value: undefined },
  { label: "Frauduleuses", value: 1 },
  { label: "Normales", value: 0 },
];

export default function FraudeDashboard() {
  const [stats, setStats] = useState<FraudeStats | null>(null);
  const [result, setResult] = useState<PaginatedResult<FraudeRow> | null>(null);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, r] = await Promise.all([
        getFraudeStats(),
        getFraudePredictions(page, 50, filter),
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
        title="Détection de Fraude"
        description="Analyse des transactions suspectes des agents"
        icon={ShieldAlert}
        accent="orange"
        action={
          <RunButton
            label="Lancer la détection"
            onRun={async () => { const r = await runFraudeDetection(); await fetchData(); return r; }}
          />
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Transactions analysées" value={stats?.total ?? 0} icon={ShieldAlert} accent="blue" />
        <StatCard
          title="Frauduleuses"
          value={stats?.frauduleuses ?? 0}
          subtitle={`${stats?.taux_fraude_pct ?? 0}% du total`}
          icon={AlertTriangle}
          accent="red"
        />
        <StatCard title="Normales" value={stats?.normales ?? 0} icon={CheckCircle} accent="green" />
        <StatCard
          title="Montant moyen"
          value={stats?.montant_moyen ? `${Math.round(Number(stats.montant_moyen)).toLocaleString("fr-FR")} FCFA` : "—"}
          icon={TrendingUp}
          accent="orange"
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
            style={filter === value ? { backgroundColor: "#004B8D" } : undefined}
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
                  {["Transaction", "Agent", "Statut", "Type", "Montant (FCFA)", "Région", "Vélocité 24h", "Écart zone", "Ratio plafond", "Dépassement"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {result?.data.map((row) => (
                  <tr
                    key={row.transaction_id}
                    className={`transition-colors ${
                      row.fraude_flag === 1
                        ? "bg-red-50/30 hover:bg-red-50/50"
                        : "hover:bg-gray-50/50"
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{row.transaction_id}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{row.agent_id}</td>
                    <td className="px-4 py-3">
                      {row.fraude_flag === 1 ? (
                        <Badge label="Frauduleuse" variant="red" />
                      ) : (
                        <Badge label="Normale" variant="green" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{row.type_label}</td>
                    <td className="px-4 py-3 font-medium text-gray-700">
                      {Number(row.montant_fcfa).toLocaleString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{row.region_label}</td>
                    <td className="px-4 py-3">
                      <span className={row.nb_tx_24h > 10 ? "font-semibold text-[#F15A24]" : "text-gray-600"}>
                        {row.nb_tx_24h}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {row.ecart_zone_habituelle === 1 ? (
                        <Badge label="Oui" variant="orange" />
                      ) : (
                        <Badge label="Non" variant="gray" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <span className={Number(row.ratio_montant_plafond) > 1 ? "font-semibold text-red-500" : ""}>
                        {Number(row.ratio_montant_plafond).toFixed(3)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {Number(row.depassement_plafond) > 0 ? (
                        <span className="text-red-500 font-medium">
                          +{Number(row.depassement_plafond).toLocaleString("fr-FR")}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {!result?.data.length && (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-gray-400 text-sm">
                      Aucune donnée. Importez les transactions puis lancez la détection.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {result?.total.toLocaleString("fr-FR")} résultats · Page {page}/{totalPages}
          </p>
          <div className="flex gap-1.5">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
