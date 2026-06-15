const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
const REQUEST_TIMEOUT_MS = Number(process.env.EXPO_PUBLIC_API_TIMEOUT_MS ?? 120000);

export type Question = {
  field_key: string;
  label: string;
  input_type: "text" | "select" | "number" | "boolean";
  options?: string[] | null;
};

export type IdentificationResult = {
  scan_id: string;
  category: string;
  brand: string | null;
  model_guess: string | null;
  confidence: number;
  known_fields: Record<string, unknown>;
  missing_fields: string[];
  search_query_draft: string;
  ambiguity_notes: string | null;
  questions: Question[];
};

export type PriceRange = {
  low: number;
  mid: number;
  high: number;
};

export type ValuationResult = {
  scan_id: string;
  item: {
    category: string;
    brand?: string | null;
    model?: string | null;
    fields: Record<string, unknown>;
  };
  valuation: {
    current_value: PriceRange;
    new_price: PriceRange;
    used_price: PriceRange;
    currency: string;
  };
  confidence: {
    overall: number;
    breakdown: {
      ai_identification: number;
      field_completeness: number;
      comp_volume: number;
      comp_similarity: number;
      sold_data_available: boolean;
      historical_data_available: boolean;
    };
  };
  comps: Array<{
    source: string;
    title: string;
    price: number;
    condition: string | null;
    sold_date: string | null;
    url: string | null;
  }>;
  historical: Array<{ date: string; price_mid: number }>;
};

async function readJson<T>(res: Response): Promise<T> {
  const raw = await res.text();
  let body: any = null;

  try {
    body = raw ? JSON.parse(raw) : null;
  } catch {
    throw new Error(raw || `Request failed with status ${res.status}`);
  }

  if (!res.ok) {
    throw new Error(body?.detail?.message ?? body?.detail ?? "Request failed");
  }
  return body as T;
}

async function request(path: string, init?: RequestInit): Promise<Response> {
  const url = `${BASE_URL}${path}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network request failed";
    throw new Error(`Could not reach Loupe backend at ${BASE_URL}. ${message}`);
  } finally {
    clearTimeout(timeout);
  }
}

export async function submitScan(imageUri: string): Promise<IdentificationResult> {
  const formData = new FormData();
  formData.append("file", {
    uri: imageUri,
    name: "scan.jpg",
    type: "image/jpeg",
  } as any);

  const res = await request("/scans", { method: "POST", body: formData });
  return readJson<IdentificationResult>(res);
}

export async function submitAnswers(
  scanId: string,
  answers: Record<string, unknown>,
): Promise<ValuationResult> {
  const res = await request(`/scans/${scanId}/answers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  });
  return readJson<ValuationResult>(res);
}

export async function getScan(scanId: string) {
  const res = await request(`/scans/${scanId}`);
  return readJson(res);
}

export async function getHistory(scanId: string): Promise<Array<{ date: string; price_mid: number }>> {
  const res = await request(`/scans/${scanId}/history`);
  return readJson<Array<{ date: string; price_mid: number }>>(res);
}
