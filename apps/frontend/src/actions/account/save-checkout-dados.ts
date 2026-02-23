"use server";

import { getAuthToken } from "../auth/session";

/** Timeout para cold start da API (ex.: Render ~50s). */
const API_TIMEOUT_MS = 90_000;

export interface SaveCheckoutDadosInput {
  email?: string;
  fullname?: string;
  document?: string;
  phone?: string;
  livingAbroad?: boolean;
  address?: {
    cep?: string;
    street?: string;
    number?: string;
    complement?: string;
    noNumber?: boolean;
    neighborhood?: string;
    city?: string;
    state?: string;
  };
}

export type SaveCheckoutDadosResult =
  | { success: true }
  | { success: false; message: string };

export async function saveCheckoutDados(
  input: SaveCheckoutDadosInput
): Promise<SaveCheckoutDadosResult> {
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
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(input),
        cache: "no-store",
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        message: data.message ?? "Não foi possível salvar seus dados",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("saveCheckoutDados error:", error);
    const isAbort = error instanceof Error && error.name === "AbortError";
    return {
      success: false,
      message: isAbort
        ? "A requisição demorou muito. Tente novamente em alguns segundos."
        : error instanceof Error
          ? error.message
          : "Erro ao salvar dados",
    };
  }
}
