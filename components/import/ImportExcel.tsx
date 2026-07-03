"use client";

import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, CheckCircle, AlertTriangle, ChevronDown, Info } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { importExcel, type ImportResult } from "@/lib/api";

const TABLES = [
  { value: "dim_forfait", label: "Dim Forfait", desc: "Catalogue des forfaits" },
  { value: "dim_client", label: "Dim Client", desc: "Données clients" },
  { value: "dim_agent", label: "Dim Agent", desc: "Données agents" },
  { value: "fact_conso_mensuelle", label: "Conso Mensuelle", desc: "Consommation mensuelle" },
  { value: "fact_evenement_service_client", label: "Événements", desc: "Service client" },
  { value: "fact_transaction_agent", label: "Transactions", desc: "Transactions agents" },
];

const COLONNES: Record<string, string[]> = {
  dim_forfait: ["forfait_id", "nom_forfait", "type_forfait", "segment_cible", "prix_mensuel_fcfa", "quota_voix_min", "quota_sms", "quota_data_mo", "is_actif"],
  dim_client: ["client_id", "msisdn_hash", "date_activation", "anciennete_mois", "region", "type_client", "mode_paiement", "forfait_id", "canal_acquisition", "smartphone_flag", "arpu_moyen_fcfa", "statut_ligne", "date_reference"],
  dim_agent: ["agent_id", "type_agent", "region", "zone_logique", "date_recrutement", "plafond_journalier_fcfa", "statut", "anciennete_mois"],
  fact_conso_mensuelle: ["client_id", "mois", "nb_appels_sortants", "duree_voix_out_min", "duree_voix_in_min", "nb_sms_envoyes", "volume_data_mo", "nb_recharges", "montant_recharge_fcfa", "nb_jours_actifs", "solde_moyen_fcfa", "nb_tx_flooz", "roaming_flag"],
  fact_evenement_service_client: ["client_id", "date_evenement", "canal", "type_evenement", "categorie", "statut_resolution", "delai_resolution_h", "satisfaction_score"],
  fact_transaction_agent: ["transaction_id", "agent_id", "date_heure", "type_transaction", "montant_fcfa", "msisdn_benef_hash", "zone_logique", "canal", "solde_avant_fcfa", "solde_apres_fcfa", "nb_tx_24h", "ecart_zone_habituelle", "fraude_flag"],
};

export default function ImportExcel() {
  const [selectedTable, setSelectedTable] = useState("dim_client");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => { setFile(null); setResult(null); setError(null); if (fileInputRef.current) fileInputRef.current.value = ""; };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await importExcel(selectedTable, file);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const currentTable = TABLES.find((t) => t.value === selectedTable);

  return (
    <div className="p-8 space-y-6 max-w-3xl">
      <PageHeader
        title="Import Excel"
        description="Alimentez la base de données avec vos fichiers Excel"
        icon={Upload}
        accent="blue"
      />

      <div className="grid grid-cols-1 gap-5">
        {/* Sélection table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            1. Choisissez la table cible
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TABLES.map(({ value, label, desc }) => (
              <button
                key={value}
                onClick={() => { setSelectedTable(value); reset(); }}
                className={`text-left p-3 rounded-lg border transition-all ${
                  selectedTable === value
                    ? "border-[#004B8D] bg-[#E8F0F9]"
                    : "border-gray-100 bg-gray-50 hover:border-gray-200"
                }`}
              >
                <p className={`text-sm font-semibold ${selectedTable === value ? "text-[#004B8D]" : "text-gray-700"}`}>
                  {label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Upload */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            2. Sélectionnez votre fichier
          </p>

          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              file ? "border-[#004B8D] bg-[#E8F0F9]" : "border-gray-200 hover:border-[#004B8D] hover:bg-[#E8F0F9]/50"
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file ? (
              <div className="space-y-1">
                <FileSpreadsheet size={28} className="mx-auto text-[#004B8D]" />
                <p className="font-semibold text-[#004B8D] text-sm">{file.name}</p>
                <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} Ko</p>
                <button
                  onClick={(e) => { e.stopPropagation(); reset(); }}
                  className="text-xs text-red-400 hover:text-red-600 transition-colors mt-1"
                >
                  Supprimer
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload size={28} className="mx-auto text-gray-300" />
                <p className="text-sm text-gray-500">
                  Glissez un fichier .xlsx ou{" "}
                  <span className="text-[#004B8D] font-medium">cliquez ici</span>
                </p>
                <p className="text-xs text-gray-400">Formats supportés : .xlsx, .xls</p>
              </div>
            )}
          </div>

          <button
            onClick={handleImport}
            disabled={!file || loading}
            className="w-full py-2.5 rounded-lg text-white text-sm font-medium transition-opacity disabled:opacity-40 flex items-center justify-center gap-2 shadow-sm"
            style={{ backgroundColor: "#004B8D" }}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Import en cours…
              </>
            ) : (
              <>
                <Upload size={15} />
                Importer vers {currentTable?.label}
              </>
            )}
          </button>
        </div>

        {/* Résultat */}
        {result && (
          <div className={`rounded-xl border p-5 ${result.errors === 0 ? "bg-green-50 border-green-100" : "bg-orange-50 border-orange-100"}`}>
            <div className="flex items-center gap-2 mb-2">
              {result.errors === 0 ? (
                <CheckCircle size={16} className="text-green-600" />
              ) : (
                <AlertTriangle size={16} className="text-orange-500" />
              )}
              <p className="font-semibold text-sm text-gray-800">{result.message}</p>
            </div>
            <div className="flex gap-4 text-sm">
              <span className="text-green-700">{result.inserted} ligne(s) insérée(s)</span>
              {result.errors > 0 && <span className="text-orange-600">{result.errors} erreur(s)</span>}
            </div>
            {result.error_details.length > 0 && (
              <details className="mt-3">
                <summary className="text-xs text-gray-500 cursor-pointer font-medium">
                  Voir les erreurs ({result.error_details.length})
                </summary>
                <ul className="mt-2 space-y-1 max-h-36 overflow-y-auto">
                  {result.error_details.map((e, i) => (
                    <li key={i} className="text-xs text-red-500">Ligne {e.ligne} : {e.erreur}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-2">
            <AlertTriangle size={15} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Guide colonnes */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <Info size={14} className="text-[#004B8D]" />
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Colonnes attendues — {currentTable?.label}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(COLONNES[selectedTable] ?? []).map((col) => (
              <span key={col} className="px-2 py-1 bg-[#E8F0F9] text-[#004B8D] rounded text-xs font-mono">
                {col}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
