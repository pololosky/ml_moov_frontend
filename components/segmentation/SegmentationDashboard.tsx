"use client";

import { useEffect, useState, useCallback } from "react";
import { PieChart, Users, Wifi, Wallet, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import RunButton from "@/components/ui/RunButton";
import PageHeader from "@/components/ui/PageHeader";
import {
  getSegmentationStats, getSegmentationPredictions, runSegmentation,
  type SegmentationStats, type SegmentRow, type PaginatedResult,
} from "@/lib/api";

const REGION_FILTERS = [
  { label: "Toutes", value: undefined },
  { label: "Grand Lomé", value: 0 },
  { label: "Maritime", value: 1 },
  { label: "Plateaux", value: 2 },
  { label: "Centrale", value: 3 },
  { label: "Kara", value: 4 },
  { label: "Savanes", value: 5 },
];

export default function SegmentationDashboard() {
  const [stats, setStats] = useState<SegmentationStats | null>(null);
  const [result, setResult] = useState<PaginatedResult<SegmentRow> | null>(null);
  const [page, setPage] = useState(1);
  const [regionFilter, setRegionFilter] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, r] = await Promise.all([
        getSegmentationStats(),
        getSegmentationPredictions(page, 50, regionFilter),
      ]);
      setStats(s);
      setResult(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, regionFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalPages = result ? Math.ceil(result.total / 50) : 1;

  return (
    <div className="p-8 space-y-6 max-w-7xl">
      <PageHeader
        title="Segmentation Client"
        description="Profils de consommation des clients"
        icon={PieChart}
        accent="blue"
        action={
          <RunButton
            label="Lancer le clustering"
            onRun={async () => { const r = await runSegmentation(); await fetchData(); return { message: r.message, count: r.count }; }}
          />
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Clients segmentés" value={stats?.total ?? 0} icon={Users} accent="blue" />
        {stats?.by_type.map((t) => (
          <StatCard
            key={t.type_client}
            title={t.type_label}
            value={t.nb}
            subtitle={`${Math.round((t.nb / (stats.total || 1)) * 100)}% du total`}
            icon={Users}
            accent={t.type_client === 2 ? "orange" : "blue"}
          />
        ))}
      </div>

      {/* Distribution par région */}
      {stats && stats.by_region.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Distribution par région
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {stats.by_region.map((r) => {
              const pct = Math.round((r.nb / (stats.total || 1)) * 100);
              return (
                <div key={r.region} className="text-center">
                  <div className="text-lg font-bold text-[#004B8D]">{pct}%</div>
                  <div className="text-xs text-gray-400 truncate">{r.region_label}</div>
                  <div className="text-xs text-gray-500 font-medium">{r.nb.toLocaleString("fr-FR")}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filtres régions */}
      <div className="flex flex-wrap gap-2">
        {REGION_FILTERS.map(({ label, value }) => (
          <button
            key={label}
            onClick={() => { setRegionFilter(value); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              regionFilter === value
                ? "text-white border-transparent"
                : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
            style={regionFilter === value ? { backgroundColor: "#004B8D" } : undefined}
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
                  {["Client ID", "Région", "Type client", "ARPU (FCFA)", "Smartphone", "Voix out moy.", "Data moy.", "Flooz moy.", "Solde moy."].map((h) => (
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
                    <td className="px-4 py-3 text-xs text-gray-600">{row.region_label}</td>
                    <td className="px-4 py-3">
                      <Badge
                        label={row.type_client_label}
                        variant={row.type_client === 2 ? "orange" : "blue"}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-700">
                      {Number(row.arpu_moyen_fcfa).toLocaleString("fr-FR")}
                    </td>
                    <td className="px-4 py-3">
                      {row.smartphone_flag === 1 ? (
                        <Badge label="Oui" variant="green" />
                      ) : (
                        <Badge label="Non" variant="gray" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{Number(row.voix_out_moy).toFixed(1)}</td>
                    <td className="px-4 py-3 text-gray-600">{Number(row.data_moy).toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-600">{Number(row.tx_flooz_moy).toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-600">{Number(row.solde_moy).toLocaleString("fr-FR")}</td>
                  </tr>
                ))}
                {!result?.data.length && (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-gray-400 text-sm">
                      Aucune donnée. Importez les données clients.
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
