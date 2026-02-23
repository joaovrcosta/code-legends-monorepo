"use server";

import { getAuthToken } from "../auth/session";

/** Timeout para cold start da API (ex.: Render ~50s). */
const API_TIMEOUT_MS = 90_000;

export interface CheckoutDadosResponse {
  email: string;
  fullname: string;
  document: string;
  phone: string;
  livingAbroad: boolean;
  address: {
    cep: string;
    street: string;
    number: string;
    complement: string;
    noNumber: boolean;
    neighborhood: string;
    city: string;
    state: string;
  };
}

export type GetCheckoutDadosResult =
  | { success: true; data: CheckoutDadosResponse }
  | { success: false; message: string };

export async function getCheckoutDados(): Promise<GetCheckoutDadosResult> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, message: "Faça login para continuar" };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/me/checkout-dados`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        message: data.message ?? "Não foi possível carregar seus dados",
      };
    }

    return {
      success: true,
      data: {
        email: data.email ?? "",
        fullname: data.fullname ?? "",
        document: data.document ?? "",
        phone: data.phone ?? "",
        livingAbroad: Boolean(data.livingAbroad),
        address: {
          cep: data.address?.cep ?? "",
          street: data.address?.street ?? "",
          number: data.address?.number ?? "",
          complement: data.address?.complement ?? "",
          noNumber: Boolean(data.address?.noNumber),
          neighborhood: data.address?.neighborhood ?? "",
          city: data.address?.city ?? "",
          state: data.address?.state ?? "",
        },
      },
    };
  } catch (error) {
    console.error("getCheckoutDados error:", error);
    const isAbort = error instanceof Error && error.name === "AbortError";
    return {
      success: false,
      message: isAbort
        ? "A requisição demorou muito. Tente novamente em alguns segundos."
        : error instanceof Error
          ? error.message
          : "Erro ao carregar dados",
    };
  }
}
