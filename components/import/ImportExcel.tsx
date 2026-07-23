"use client";

import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, CheckCircle, AlertTriangle, Info, Database } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { importExcelUpload, importExcelByTable, type ImportResult } from "@/lib/api";

const BLUE   = "#0054A6";
const ORANGE = "#E96805";

const TABLES = [
  { value: "dim_forfait",                   label: "Dim Forfait",      desc: "pour les forfaits",           pattern: "dim_forfait" },
  { value: "dim_client",                    label: "Dim Client",       desc: "pour les clients",          pattern: "dim_client" },
  { value: "dim_agent",                     label: "Dim Agent",        desc: "300 agents",             pattern: "dim_agent" },
  { value: "fact_conso_mensuelle",          label: "Conso Mensuelle",  desc: "48 000 lignes",          pattern: "conso_mensuel" },
  { value: "fact_evenement_service_client", label: "Événements SAV",   desc: "10 980 événements",      pattern: "evenement" },
  { value: "fact_transaction_agent",        label: "Transactions",     desc: "11 794 transactions",    pattern: "transaction" },
];

const COLONNES: Record<string, string[]> = {
  dim_forfait:                   ["forfait_id","nom_forfait","type_forfait","segment_cible","prix_mensuel_fcfa","quota_voix_min","quota_sms","quota_data_mo","is_actif"],
  dim_client:                    ["client_id","msisdn_hash","date_activation","anciennete_mois","region","type_client","mode_paiement","forfait_id","canal_acquisition","smartphone_flag","arpu_moyen_fcfa","statut_ligne","date_reference"],
  dim_agent:                     ["agent_id","type_agent","region","zone_logique","date_recrutement","plafond_journalier_fcfa","statut","anciennete_mois"],
  fact_conso_mensuelle:          ["conso_id","client_id","mois","nb_appels_sortants","duree_voix_out_min","duree_voix_in_min","nb_sms_envoyes","volume_data_mo","nb_recharges","montant_recharge_fcfa","nb_jours_actifs","solde_moyen_fcfa","nb_tx_flooz","roaming_flag"],
  fact_evenement_service_client: ["evenement_id","client_id","date_evenement","canal","type_evenement","categorie","statut_resolution","delai_resolution_h","satisfaction_score"],
  fact_transaction_agent:        ["transaction_id","agent_id","date_heure","type_transaction","montant_fcfa","msisdn_benef_hash","zone_logique","canal","solde_avant_fcfa","solde_apres_fcfa","nb_tx_24h","ecart_zone_habituelle"],
};

const TRIGGERS: Record<string, string> = {
  dim_client:                    "→ Déclenche needs_retraining sur features_churn et features_segmentation",
  fact_conso_mensuelle:          "→ Déclenche needs_retraining sur features_churn et features_segmentation",
  fact_evenement_service_client: "→ Déclenche needs_retraining sur features_churn",
  fact_transaction_agent:        "→ Calcul immédiat de features_fraude via trigger PostgreSQL",
};

export default function ImportExcel() {
  const [selectedTable, setSelectedTable] = useState("dim_client");
  const [autoDetect,    setAutoDetect]    = useState(true);
  const [file,          setFile]          = useState<File | null>(null);
  const [loading,       setLoading]       = useState(false);
  const [result,        setResult]        = useState<ImportResult | null>(null);
  const [error,         setError]         = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFile(null); setResult(null); setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true); setResult(null); setError(null);
    try {
      const res = autoDetect
        ? await importExcelUpload(file)
        : await importExcelByTable(selectedTable, file);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const currentTable = TABLES.find((t) => t.value === selectedTable);

  return (
    <div className="anim-fade-up" style={{ padding: "32px 36px", maxWidth: 800 }}>
      <PageHeader
        title="Import Excel"
        description="Alimentez la base de données — les triggers PostgreSQL se déclenchent automatiquement"
        icon={Upload}
        accent="blue"
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {/* Info auto-detect */}
        <div style={{
          display: "flex", gap: 10, alignItems: "flex-start",
          padding: "12px 16px", borderRadius: 10,
          background: "#E8F5FD", border: "1px solid #D0EAFB",
        }}>
          <Info size={15} style={{ color: BLUE, marginTop: 1, flexShrink: 0 }} />
          <p style={{ fontSize: 12, color: "#0578C0", margin: 0, lineHeight: 1.5 }}>
            <strong>Détection automatique :</strong> nommez votre fichier{" "}
            <code style={{ background: "rgba(6,147,227,0.1)", padding: "1px 5px", borderRadius: 4 }}>dim_client.xlsx</code>,{" "}
            <code style={{ background: "rgba(6,147,227,0.1)", padding: "1px 5px", borderRadius: 4 }}>conso_mensuel_jan.xlsx</code>,{" "}
            <code style={{ background: "rgba(6,147,227,0.1)", padding: "1px 5px", borderRadius: 4 }}>transaction_mars.xlsx</code>…
            Le backend détecte la table cible automatiquement.
          </p>
        </div>

        {/* Mode */}
        <div style={{ background: "#FFF", border: "1px solid #E8ECF0", borderRadius: 12, padding: "18px 20px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#8A97A8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>
            Mode d&apos;import
          </div>
          <div style={{ display: "flex", gap: 20, marginBottom: autoDetect ? 0 : 16 }}>
            {[
              { v: true,  l: "Détection automatique" },
              { v: false, l: "Table manuelle" },
            ].map(({ v, l }) => (
              <label key={String(v)} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#0F1923" }}>
                <input type="radio" checked={autoDetect === v} onChange={() => setAutoDetect(v)}
                  style={{ accentColor: BLUE, width: 15, height: 15 }} />
                {l}
              </label>
            ))}
          </div>

          {!autoDetect && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 14 }}>
              {TABLES.map(({ value, label, desc }) => (
                <button
                  key={value}
                  onClick={() => { setSelectedTable(value); reset(); }}
                  style={{
                    padding: "10px 12px", borderRadius: 9, textAlign: "left",
                    border: `1.5px solid ${selectedTable === value ? BLUE : "#E8ECF0"}`,
                    background: selectedTable === value ? "#E8F5FD" : "#F7F9FC",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: selectedTable === value ? BLUE : "#0F1923" }}>{label}</div>
                  <div style={{ fontSize: 11, color: "#8A97A8", marginTop: 2 }}>{desc}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Drop zone */}
        <div style={{ background: "#FFF", border: "1px solid #E8ECF0", borderRadius: 12, padding: "18px 20px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#8A97A8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>
            Fichier Excel
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
            style={{
              border: `2px dashed ${file ? BLUE : "#E8ECF0"}`,
              borderRadius: 10, padding: "32px 20px", textAlign: "center",
              cursor: "pointer", transition: "all 0.15s",
              background: file ? "#E8F5FD" : "#F7F9FC",
            }}
          >
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls" style={{ display: "none" }}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            {file ? (
              <div>
                <FileSpreadsheet size={28} style={{ color: BLUE, margin: "0 auto 8px" }} />
                <div style={{ fontWeight: 700, color: BLUE, fontSize: 13 }}>{file.name}</div>
                <div style={{ fontSize: 11, color: "#8A97A8", marginTop: 4 }}>{(file.size / 1024).toFixed(1)} Ko</div>
                <button onClick={(e) => { e.stopPropagation(); reset(); }}
                  style={{ marginTop: 8, fontSize: 11, color: ORANGE, background: "none", border: "none", cursor: "pointer" }}>
                  Supprimer
                </button>
              </div>
            ) : (
              <div>
                <Upload size={26} style={{ color: "#C8D5E0", margin: "0 auto 10px" }} />
                <div style={{ fontSize: 13, color: "#4A5568" }}>
                  Glissez un fichier ici ou{" "}
                  <span style={{ color: BLUE, fontWeight: 600 }}>cliquez pour parcourir</span>
                </div>
                <div style={{ fontSize: 11, color: "#8A97A8", marginTop: 6 }}>Formats : .xlsx, .xls</div>
              </div>
            )}
          </div>

          <button
            onClick={handleImport}
            disabled={!file || loading}
            style={{
              width: "100%", marginTop: 14,
              padding: "10px 0", borderRadius: 9,
              background: (!file || loading) ? "#A8D8F5" : BLUE,
              color: "#FFF", border: "none",
              fontSize: 13, fontWeight: 700,
              cursor: (!file || loading) ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              letterSpacing: "0.02em",
            }}
          >
            {loading
              ? <><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.5)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} /> Import en cours…</>
              : <><Upload size={14} /> {autoDetect ? "Importer (auto)" : `Importer vers ${currentTable?.label}`}</>}
          </button>
        </div>

        {/* Résultat */}
        {result && (
          <div style={{
            padding: "16px 18px", borderRadius: 12,
            background: result.errors === 0 ? "#F0FDF4" : "#FFFBEB",
            border: `1px solid ${result.errors === 0 ? "#BBF7D0" : "#FCD34D"}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              {result.errors === 0
                ? <CheckCircle size={16} style={{ color: "#16A34A" }} />
                : <AlertTriangle size={16} style={{ color: "#D97706" }} />}
              <span style={{ fontWeight: 700, fontSize: 13, color: "#0F1923" }}>{result.message}</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 12 }}>
              <span style={{ color: "#16A34A", fontWeight: 600 }}>✓ {result.inserted} insérées</span>
              {result.errors > 0 && <span style={{ color: "#D97706", fontWeight: 600 }}>⚠ {result.errors} erreurs</span>}
              <span style={{ color: "#8A97A8" }}>Table : {result.table}</span>
              {result.log_id && <span style={{ color: "#8A97A8" }}>Log #{result.log_id}</span>}
            </div>
            {TRIGGERS[result.table] && (
              <div style={{ marginTop: 8, fontSize: 11, color: BLUE, display: "flex", alignItems: "center", gap: 5 }}>
                <Database size={11} /> {TRIGGERS[result.table]}
              </div>
            )}
            {result.error_details.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  marginBottom: 8, paddingBottom: 8,
                  borderBottom: "1px solid #FCD34D",
                }}>
                  <AlertTriangle size={13} style={{ color: "#D97706", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#92400E" }}>
                    {result.error_details.length} erreur{result.error_details.length > 1 ? "s" : ""} d&apos;insertion
                  </span>
                </div>
                <div style={{
                  maxHeight: 320,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}>
                  {result.error_details.map((e, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 7,
                        background: "#FEF2F2",
                        border: "1px solid #FECACA",
                        fontSize: 12,
                        color: "#991B1B",
                        lineHeight: 1.5,
                        fontFamily: "monospace",
                        wordBreak: "break-word",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {e}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div style={{ padding: "14px 16px", borderRadius: 10, background: "#FEF2F2", border: "1px solid #FECACA", display: "flex", gap: 8, alignItems: "flex-start" }}>
            <AlertTriangle size={14} style={{ color: "#DC2626", marginTop: 1, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "#DC2626" }}>{error}</span>
          </div>
        )}

        {/* Colonnes attendues */}
        {!autoDetect && (
          <div style={{ background: "#FFF", border: "1px solid #E8ECF0", borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
              <Info size={13} style={{ color: BLUE }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#8A97A8", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                Colonnes — {currentTable?.label}
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {(COLONNES[selectedTable] ?? []).map((col) => (
                <code key={col} style={{
                  padding: "3px 9px", borderRadius: 6,
                  background: "#E8F5FD", color: "#0578C0",
                  fontSize: 11, fontWeight: 500,
                }}>
                  {col}
                </code>
              ))}
            </div>
            {TRIGGERS[selectedTable] && (
              <div style={{ marginTop: 12, fontSize: 11, color: BLUE, display: "flex", alignItems: "center", gap: 5 }}>
                <Database size={11} /> {TRIGGERS[selectedTable]}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
