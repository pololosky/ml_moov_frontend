const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`API ${path} — ${res.status}: ${error}`);
  }
  return res.json() as Promise<T>;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const getDashboardOverview = () =>
  apiFetch<DashboardOverview>("/api/dashboard/overview");

export const getChurnByRegion = () =>
  apiFetch<ChurnByRegion[]>("/api/dashboard/churn-by-region");

export const getFraudeByType = () =>
  apiFetch<FraudeByType[]>("/api/dashboard/fraude-by-type");

export const getRecentRuns = (limit = 10) =>
  apiFetch<ModelRun[]>(`/api/dashboard/recent-runs?limit=${limit}`);

export const getImportHistory = (limit = 20) =>
  apiFetch<ImportLog[]>(`/api/dashboard/import-history?limit=${limit}`);

// ─── Churn ────────────────────────────────────────────────────────────────────
export const getChurnStats = () =>
  apiFetch<ChurnStats>("/api/churn/stats");

export const getChurnPendingCount = () =>
  apiFetch<{ pending: number }>("/api/churn/pending-count");

export const getChurnPredictions = (
  page = 1, size = 50, churn_flag?: number
) => {
  const p = new URLSearchParams({ page: String(page), size: String(size) });
  if (churn_flag !== undefined) p.set("churn_flag", String(churn_flag));
  return apiFetch<PaginatedResult<ChurnPrediction>>(`/api/churn/predictions?${p}`);
};

export const getChurnHistory = (client_id: string) =>
  apiFetch<ChurnPrediction[]>(`/api/churn/history/${client_id}`);

export const runChurnPredictions = (
  horizon_jours = 30, only_pending = false
) =>
  apiFetch<RunResult>(`/api/churn/run?horizon_jours=${horizon_jours}&only_pending=${only_pending}`, {
    method: "POST",
  });

// ─── Segmentation ─────────────────────────────────────────────────────────────
export const getSegmentationStats = () =>
  apiFetch<SegmentationStats>("/api/segmentation/stats");

export const getSegmentDefinitions = () =>
  apiFetch<SegmentDefinition[]>("/api/segmentation/segments");

export const upsertSegmentDefinition = (
  segment_id: number,
  body: { label: string; description?: string; couleur_hex?: string }
) =>
  apiFetch<{ message: string }>(`/api/segmentation/segments/${segment_id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

export const getSegmentationPredictions = (
  page = 1, size = 50,
  segment_id?: number, region?: number
) => {
  const p = new URLSearchParams({ page: String(page), size: String(size) });
  if (segment_id !== undefined) p.set("segment_id", String(segment_id));
  if (region !== undefined) p.set("region", String(region));
  return apiFetch<PaginatedResult<SegmentPrediction>>(`/api/segmentation/predictions?${p}`);
};

export const getSegmentHistory = (client_id: string) =>
  apiFetch<SegmentPrediction[]>(`/api/segmentation/history/${client_id}`);

export const runSegmentation = (only_pending = false) =>
  apiFetch<RunResult>(`/api/segmentation/run?only_pending=${only_pending}`, {
    method: "POST",
  });

// ─── Fraude ───────────────────────────────────────────────────────────────────
export const getFraudeStats = () =>
  apiFetch<FraudeStats>("/api/fraude/stats");

export const getFraudePendingCount = () =>
  apiFetch<{ pending: number }>("/api/fraude/pending-count");

export const getFraudePredictions = (
  page = 1, size = 50,
  fraude_flag?: number
) => {
  const p = new URLSearchParams({ page: String(page), size: String(size) });
  if (fraude_flag !== undefined) p.set("fraude_flag", String(fraude_flag));
  return apiFetch<PaginatedResult<FraudePrediction>>(`/api/fraude/predictions?${p}`);
};

export const getFraudeHistory = (transaction_id: number) =>
  apiFetch<FraudePrediction[]>(`/api/fraude/history/${transaction_id}`);

export const runFraudeDetection = () =>
  apiFetch<RunResult>("/api/fraude/run", { method: "POST" });

// ─── Import Excel ─────────────────────────────────────────────────────────────
/** Upload via /api/import/upload — détection automatique depuis le nom du fichier */
export async function importExcelUpload(file: File): Promise<ImportResult> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE_URL}/api/import/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(`Import — ${res.status}: ${await res.text()}`);
  return res.json();
}

/** Upload avec table forcée via /api/import/{table_name} */
export async function importExcelByTable(
  table_name: string, file: File
): Promise<ImportResult> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE_URL}/api/import/${table_name}`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(`Import ${table_name} — ${res.status}: ${await res.text()}`);
  return res.json();
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DashboardOverview {
  nb_clients: number;
  nb_clients_actifs: number;
  nb_agents: number;
  nb_transactions: number;
  nb_churn_analyses: number;
  nb_churned: number;
  nb_fraude_analyses: number;
  nb_frauduleuses: number;
  nb_segmentes: number;
  taux_churn_pct: number;
  taux_fraude_pct: number;
  churn_pending: number;
  seg_pending: number;
  fraude_pending: number;
}

export interface ChurnByRegion {
  region: number;
  region_label: string;
  total: number;
  churned: number;
  score_moyen: number;
  taux_pct: number;
}

export interface FraudeByType {
  type_transaction: number;
  type_label: string;
  total: number;
  frauduleuses: number;
  score_moyen: number;
  taux_pct: number;
}

export interface ModelRun {
  id: number;
  cas_usage: "churn" | "fraude" | "segmentation";
  modele_version: string;
  nb_predictions: number;
  run_at: string;
  run_by: string | null;
  metriques: Record<string, number> | null;
}

export interface ImportLog {
  id: number;
  fichier_source: string;
  table_cible: string;
  nb_lignes_in: number;
  nb_lignes_ok: number;
  nb_lignes_err: number;
  statut: string;
  imported_at: string;
  imported_by: string | null;
}

export interface ChurnStats {
  total: number;
  churned: number;
  not_churned: number;
  score_moyen: number;
  taux_churn_pct: number;
  arpu_moyen: number;
  anciennete_moy: number;
  pending_retraining: number;
}

export interface ChurnPrediction {
  id: number;
  client_id: string;
  score_churn: number;
  churn_flag: number;
  horizon_jours: number;
  predicted_at: string;
  is_latest: boolean;
  model_run_id: number | null;
  region?: number;
  region_label?: string;
  type_client?: number;
  type_client_label?: string;
  anciennete_mois?: number;
  arpu_moyen_fcfa?: number;
  nb_reclamations?: number;
  nb_demandes_resiliation?: number;
  satisfaction_moy?: number;
}

export interface SegmentationStats {
  total: number;
  segments: {
    segment_id: number;
    label: string;
    couleur_hex: string;
    nb_clients: number;
  }[];
  pending_retraining: number;
}

export interface SegmentDefinition {
  segment_id: number;
  label: string;
  description: string | null;
  couleur_hex: string | null;
  model_run_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface SegmentPrediction {
  id: number;
  client_id: string;
  segment_id: number;
  segment_label: string;
  couleur_hex: string;
  predicted_at: string;
  is_latest: boolean;
  model_run_id: number | null;
  region?: number;
  region_label?: string;
  type_client?: number;
  type_client_label?: string;
  anciennete_mois?: number;
  arpu_moyen_fcfa?: number;
  smartphone_flag?: number;
  voix_out_moy?: number;
  data_moy?: number;
  solde_moy?: number;
  tx_flooz_moy?: number;
}

export interface FraudeStats {
  total: number;
  frauduleuses: number;
  normales: number;
  score_moyen: number;
  taux_fraude_pct: number;
  pending_predictions: number;
}

export interface FraudePrediction {
  id: number;
  transaction_id: number;
  score_fraude: number;
  fraude_flag: number;
  predicted_at: string;
  is_latest: boolean;
  model_run_id: number | null;
  agent_id?: string;
  type_transaction?: number;
  type_label?: string;
  montant_fcfa?: number;
  region?: number;
  region_label?: string;
  nb_tx_24h?: number;
  ecart_zone_habituelle?: number;
  ratio_montant_plafond?: number;
  agent_recent?: number;
  depassement_plafond?: number;
  variation_solde?: number;
}

export interface RunResult {
  message: string;
  count: number;
  run_id?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
}

export interface ImportResult {
  message: string;
  table: string;
  inserted: number;
  errors: number;
  total_in_file: number;
  log_id: number;
  error_details: string[];
}
