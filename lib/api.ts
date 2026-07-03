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

// ─── Churn ────────────────────────────────────────────────────────────────────
export const getChurnStats = () =>
  apiFetch<ChurnStats>("/api/churn/stats");

export const getChurnByRegionDetail = () =>
  apiFetch<ChurnByRegion[]>("/api/churn/by-region");

export const getChurnPredictions = (
  page = 1,
  size = 50,
  churn_flag?: number
) => {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (churn_flag !== undefined) params.set("churn_flag", String(churn_flag));
  return apiFetch<PaginatedResult<ChurnRow>>(`/api/churn/predictions?${params}`);
};

// 
export const runChurnPredictions = () =>
  apiFetch<{ message: string; count: number }>("/api/churn/run", { method: "POST" });

// ─── Segmentation ─────────────────────────────────────────────────────────────
export const getSegmentationStats = () =>
  apiFetch<SegmentationStats>("/api/segmentation/stats");

export const getSegmentationPredictions = (
  page = 1,
  size = 50,
  region?: number,
  type_client?: number
) => {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (region !== undefined) params.set("region", String(region));
  if (type_client !== undefined) params.set("type_client", String(type_client));
  return apiFetch<PaginatedResult<SegmentRow>>(`/api/segmentation/predictions?${params}`);
};

export const runSegmentation = () =>
  apiFetch<{ message: string; count: number; segments: SegmentResult[] }>("/api/segmentation/run", { method: "POST" });

// ─── Fraude ───────────────────────────────────────────────────────────────────
export const getFraudeStats = () =>
  apiFetch<FraudeStats>("/api/fraude/stats");

export const getFraudePredictions = (
  page = 1,
  size = 50,
  fraude_flag?: number
) => {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (fraude_flag !== undefined) params.set("fraude_flag", String(fraude_flag));
  return apiFetch<PaginatedResult<FraudeRow>>(`/api/fraude/predictions?${params}`);
};

export const runFraudeDetection = () =>
  apiFetch<{ message: string; count: number }>("/api/fraude/run", { method: "POST" });

// ─── Import Excel ─────────────────────────────────────────────────────────────
export async function importExcel(table_name: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE_URL}/api/import/${table_name}`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(`Import ${table_name} — ${res.status}: ${await res.text()}`);
  return res.json() as Promise<ImportResult>;
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface DashboardOverview {
  nb_clients: number;
  nb_clients_actifs: number;
  nb_agents: number;
  nb_transactions: number;
  nb_churn_total: number;
  nb_churned: number;
  nb_fraude_total: number;
  nb_frauduleuses: number;
  nb_segmentation: number;
  taux_churn_pct: number;
  taux_fraude_pct: number;
}

export interface ChurnByRegion {
  region: number;
  region_label: string;
  total: number;
  churned: number;
  taux_pct: number;
}

export interface FraudeByType {
  type_transaction: number;
  type_label: string;
  total: number;
  frauduleuses: number;
  taux_pct: number;
}

export interface ChurnStats {
  total: number;
  churned: number;
  not_churned: number;
  arpu_moyen: number;
  anciennete_moy: number;
  taux_churn_pct: number;
}

export interface ChurnRow {
  client_id: string;
  churn_flag: number;
  anciennete_mois: number;
  region: number;
  region_label: string;
  type_client: number;
  type_client_label: string;
  arpu_moyen_fcfa: number;
  nb_reclamations: number;
  nb_demandes_resiliation: number;
  satisfaction_moy: number;
  montant_recharge_moy: number;
}

export interface SegmentationStats {
  total: number;
  by_region: { region: number; region_label: string; nb: number }[];
  by_type: { type_client: number; type_label: string; nb: number }[];
}

export interface SegmentRow {
  client_id: string;
  anciennete_mois: number;
  region: number;
  region_label: string;
  type_client: number;
  type_client_label: string;
  arpu_moyen_fcfa: number;
  smartphone_flag: number;
  voix_out_moy: number;
  data_moy: number;
  solde_moy: number;
  tx_flooz_moy: number;
}

export interface SegmentResult {
  client_id: string;
  segment_id: number;
  segment_label: string;
}

export interface FraudeStats {
  total: number;
  frauduleuses: number;
  normales: number;
  montant_moyen: number;
  ratio_plafond_moyen: number;
  taux_fraude_pct: number;
}

export interface FraudeRow {
  transaction_id: number;
  agent_id: string;
  fraude_flag: number;
  type_transaction: number;
  type_label: string;
  montant_fcfa: number;
  region: number;
  region_label: string;
  nb_tx_24h: number;
  ecart_zone_habituelle: number;
  ratio_montant_plafond: number;
  agent_recent: number;
  depassement_plafond: number;
  variation_solde: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
}

export interface ImportResult {
  message: string;
  inserted: number;
  errors: number;
  error_details: { ligne: number; erreur: string }[];
}
