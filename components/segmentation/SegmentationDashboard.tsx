"use client";

import { useEffect, useState, useCallback } from "react";
import { PieChart, Users, Wifi, Wallet } from "lucide-react";
import StatCard   from "@/components/ui/StatCard";
import Badge      from "@/components/ui/Badge";
import RunButton  from "@/components/ui/RunButton";
import PageHeader from "@/components/ui/PageHeader";
import DataTable  from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import {
  getSegmentationStats, getSegmentationPredictions, runSegmentation,
  type SegmentationStats, type SegmentPrediction, type PaginatedResult,
} from "@/lib/api";

const BLUE   = "#0054A6";
const ORANGE = "#E96805";

const REGION_FILTERS = [
  { label: "Toutes",     value: undefined },
  { label: "Grand Lomé", value: 0 },
  { label: "Maritime",   value: 1 },
  { label: "Plateaux",   value: 2 },
  { label: "Centrale",   value: 3 },
  { label: "Kara",       value: 4 },
  { label: "Savanes",    value: 5 },
];

export default function SegmentationDashboard() {
  const [stats,        setStats]        = useState<SegmentationStats | null>(null);
  const [result,       setResult]       = useState<PaginatedResult<SegmentPrediction> | null>(null);
  const [page,         setPage]         = useState(1);
  const [regionFilter, setRegionFilter] = useState<number | undefined>(undefined);
  const [segFilter,    setSegFilter]    = useState<number | undefined>(undefined);
  const [loading,      setLoading]      = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, r] = await Promise.all([
        getSegmentationStats(),
        getSegmentationPredictions(page, 50, segFilter, regionFilter),
      ]);
      setStats(s);
      setResult(r);
    } catch (e) { console.error(e); }
    finally     { setLoading(false); }
  }, [page, regionFilter, segFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalPages = result ? Math.ceil(result.total / 50) : 1;
  const segments   = stats?.segments ?? [];

  return (
    <div className="anim-fade-up" style={{ padding: "32px 36px", maxWidth: 1200 }}>
      <PageHeader
        title="Segmentation Client"
        description="Clustering K-Means des profils de consommation"
        icon={PieChart}
        accent="blue"
        action={
          <RunButton
            label="Lancer le clustering"
            onRun={async () => { const r = await runSegmentation(); await fetchData(); return { message: r.message, count: r.count }; }}
          />
        }
      />

      {/* KPI total */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        <StatCard
          title="Clients segmentés"
          value={stats?.total ?? 0}
          subtitle={stats?.pending_retraining ? `${stats.pending_retraining} à recalculer` : undefined}
          icon={Users}
          accent="blue"
        />
        {/* 3 premiers segments */}
        {segments.slice(0, 3).map((seg) => (
          <StatCard
            key={seg.segment_id}
            title={seg.label}
            value={seg.nb_clients}
            subtitle={`${Math.round((seg.nb_clients / (stats?.total || 1)) * 100)}% du total`}
            icon={PieChart}
            accent={seg.segment_id % 2 === 0 ? "blue" : "orange"}
          />
        ))}
      </div>

      {/* Tous les segments (chips cliquables) */}
      {segments.length > 0 && (
        <div style={{
          background: "#FFF", border: "1px solid #E8ECF0", borderRadius: 12,
          padding: "16px 20px", marginBottom: 20,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#8A97A8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>
            Segments identifiés
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {segments.map((seg) => {
              const pct    = Math.round((seg.nb_clients / (stats?.total || 1)) * 100);
              const active = segFilter === seg.segment_id;
              return (
                <button
                  key={seg.segment_id}
                  className="chip-hover"
                  onClick={() => { setSegFilter(active ? undefined : seg.segment_id); setPage(1); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 7,
                    padding: "6px 14px", borderRadius: 24,
                    border: `1.5px solid ${active ? seg.couleur_hex : "#E8ECF0"}`,
                    background: active ? seg.couleur_hex : "#FFF",
                    color: active ? "#FFF" : "#0F1923",
                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <span style={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: active ? "rgba(255,255,255,0.8)" : seg.couleur_hex,
                    flexShrink: 0,
                  }} />
                  {seg.label}
                  <span style={{ opacity: 0.7, fontWeight: 400 }}>
                    {seg.nb_clients.toLocaleString("fr-FR")} ({pct}%)
                  </span>
                </button>
              );
            })}
            {segFilter !== undefined && (
              <button
                onClick={() => { setSegFilter(undefined); setPage(1); }}
                style={{
                  padding: "6px 12px", borderRadius: 24, fontSize: 12,
                  border: "1px dashed #E8ECF0", background: "transparent",
                  color: "#8A97A8", cursor: "pointer",
                }}
              >
                Tout afficher ×
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filtres région */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {REGION_FILTERS.map(({ label, value }) => {
          const active = regionFilter === value;
          return (
            <button key={label} onClick={() => { setRegionFilter(value); setPage(1); }} style={{
              padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
              border: active ? "none" : "1px solid #E8ECF0",
              background: active ? BLUE : "#FFF",
              color: active ? "#FFF" : "#4A5568",
              cursor: "pointer",
            }}>
              {label}
            </button>
          );
        })}
      </div>

      {/* Tableau */}
      <DataTable
        loading={loading}
        rowKey={(r) => r.client_id}
        rows={result?.data ?? []}
        emptyMessage="Aucun client segmenté. Lancez le clustering pour voir les résultats."
        columns={[
          { key: "client_id", header: "Client ID",
            render: (r) => <span style={{ fontFamily: "monospace", fontSize: 11, color: "#8A97A8" }}>{r.client_id}</span> },
          { key: "segment_label", header: "Segment",
            render: (r) => (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                background: r.couleur_hex + "22", color: r.couleur_hex,
              }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: r.couleur_hex }} />
                {r.segment_label}
              </span>
            ) },
          { key: "region_label", header: "Région",
            render: (r) => <span style={{ color: "#4A5568", fontSize: 12 }}>{r.region_label ?? "—"}</span> },
          { key: "type_client_label", header: "Type",
            render: (r) => <Badge label={r.type_client_label ?? "—"} variant={(r.type_client ?? 0) === 2 ? "orange" : "blue"} /> },
          { key: "arpu_moyen_fcfa", header: "ARPU (FCFA)", align: "right",
            render: (r) => <span style={{ fontWeight: 600, color: BLUE }}>
              {r.arpu_moyen_fcfa != null ? Number(r.arpu_moyen_fcfa).toLocaleString("fr-FR") : "—"}
            </span> },
          { key: "smartphone_flag", header: "Smartphone",
            render: (r) => <Badge label={r.smartphone_flag === 1 ? "Oui" : "Non"} variant={r.smartphone_flag === 1 ? "green" : "gray"} /> },
          { key: "data_moy", header: "Data moy. (Mo)", align: "right",
            render: (r) => <span style={{ color: "#4A5568" }}>{r.data_moy != null ? Number(r.data_moy).toFixed(1) : "—"}</span> },
          { key: "tx_flooz_moy", header: "Flooz moy.", align: "right",
            render: (r) => <span style={{ color: "#4A5568" }}>{r.tx_flooz_moy != null ? Number(r.tx_flooz_moy).toFixed(1) : "—"}</span> },
          { key: "solde_moy", header: "Solde moy. (F)", align: "right",
            render: (r) => <span style={{ fontWeight: 500, color: "#0F1923" }}>
              {r.solde_moy != null ? Number(r.solde_moy).toLocaleString("fr-FR") : "—"}
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
