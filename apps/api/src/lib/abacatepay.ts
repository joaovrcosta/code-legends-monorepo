/** Base da API Abacate Pay. Criar cobrança: POST /v1/billing/create (ver guia de integração). */
const ABACATE_API_BASE = "https://api.abacatepay.com/v1";

export interface AbacateCreateBillingProduct {
  externalId: string;
  name: string;
  description?: string;
  quantity: number;
  price: number; // centavos, mínimo 100
}

export interface AbacateCreateBillingCustomer {
  name?: string;
  email: string;
  cellphone?: string;
  taxId?: string;
}

export interface AbacateCreateBillingParams {
  frequency: "ONE_TIME";
  methods: ("PIX" | "CARD")[];
  products: AbacateCreateBillingProduct[];
  returnUrl: string;
  completionUrl: string;
  customer: AbacateCreateBillingCustomer;
}

export interface AbacateBillingResponse {
  id: string;
  url: string;
  amount: number;
  status: string;
  methods?: string[];
}

interface AbacateApiResponse<T> {
  data: T | null;
  error: string | null;
}

export async function createBilling(
  apiKey: string,
  params: AbacateCreateBillingParams
): Promise<AbacateBillingResponse> {
  const res = await fetch(`${ABACATE_API_BASE}/billing/create`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(params),
  });

  const raw = (await res.json()) as AbacateApiResponse<AbacateBillingResponse>;

  if (!res.ok) {
    const msg =
      raw?.error ??
      (typeof raw === "object" ? JSON.stringify(raw) : String(raw));
    throw new Error(`Abacate Pay API error ${res.status}: ${msg}`);
  }

  if (raw?.error) {
    throw new Error(`Abacate Pay: ${raw.error}`);
  }

  const data = raw?.data;
  if (!data || typeof data !== "object") {
    throw new Error(
      `Abacate Pay: resposta sem data. Resposta: ${JSON.stringify(raw)}`
    );
  }

  if (!data.url || typeof data.url !== "string") {
    throw new Error(
      `Abacate Pay: data sem url de checkout. Resposta: ${JSON.stringify(raw)}`
    );
  }

  return {
    id: data.id,
    url: data.url,
    amount: data.amount ?? 0,
    status: data.status ?? "PENDING",
    methods: data.methods,
  };
}

/** Item da lista de cobranças (GET /billing/list). Status: PENDING | PAID | EXPIRED | CANCELLED | REFUNDED */
export interface AbacateBillingListItem {
  id: string;
  status: string;
  url?: string;
  amount?: number;
  methods?: string[];
}

/**
 * Lista todas as cobranças na Abacate Pay (GET /billing/list).
 * Retorna array vazio em caso de erro.
 */
export async function listBillings(
  apiKey: string
): Promise<AbacateBillingListItem[]> {
  const res = await fetch(`${ABACATE_API_BASE}/billing/list`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
  });

  const raw = (await res.json()) as AbacateApiResponse<AbacateBillingListItem[]>;

  if (!res.ok || raw?.error) {
    return [];
  }

  const data = raw?.data;
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .filter((b) => b && typeof b.id === "string" && typeof b.status === "string")
    .map((b) => ({
      id: b.id,
      status: b.status,
      url: b.url,
      amount: b.amount,
      methods: b.methods,
    }));
}
