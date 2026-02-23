"use server";

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
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments`, {
      method: "GET",
      headers,
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
