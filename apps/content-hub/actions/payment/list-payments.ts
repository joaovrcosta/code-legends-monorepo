"use server";

import { buildApiHeaders } from "@/actions/auth";

export interface PaymentItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amountCents: number;
  currency: string;
  status: string;
  plan: string;
  gateway: string;
  gatewayPaymentId: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface ListPaymentsResponse {
  payments: PaymentItem[];
}

/**
 * Lista todos os pagamentos da plataforma (admin)
 */
export async function listPayments(token?: string): Promise<ListPaymentsResponse> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments`, {
      method: "GET",
      headers: await buildApiHeaders(undefined, token),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Erro na resposta da API:", response.statusText);
      return { payments: [] };
    }

    const data: ListPaymentsResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao listar pagamentos:", error);
    return { payments: [] };
  }
}

export interface SyncPaymentsResponse {
  ok: boolean;
  message?: string;
  updated?: number;
}

/**
 * Sincroniza status dos pagamentos com a Abacate Pay (admin).
 */
export async function syncPayments(
  token?: string
): Promise<SyncPaymentsResponse> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/payments/sync`,
      {
        method: "POST",
        headers: await buildApiHeaders(undefined, token),
        cache: "no-store",
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        ok: false,
        message: data.message ?? "Erro ao sincronizar",
      };
    }

    return {
      ok: true,
      message: data.message ?? "Sincronização concluída",
      updated: data.updated ?? 0,
    };
  } catch (error) {
    console.error("Erro ao sincronizar pagamentos:", error);
    return { ok: false, message: "Erro ao sincronizar" };
  }
}
