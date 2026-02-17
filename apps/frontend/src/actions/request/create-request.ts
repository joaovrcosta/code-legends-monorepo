"use server";

import { getAuthToken } from "../auth/session";

export interface CreateRequestData {
  type: string;
  title?: string;
  description?: string;
  data?: string;
}

export interface CreateRequestResponse {
  success: boolean;
  message: string;
  request?: any;
}

export async function createRequest(
  data: CreateRequestData
): Promise<CreateRequestResponse> {
  const token = await getAuthToken();

  if (!token) {
    return {
      success: false,
      message: "Usuário não autenticado",
    };
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/requests`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || "Erro ao criar solicitação",
      };
    }

    const result = await response.json();

    return {
      success: true,
      message: "Solicitação criada com sucesso",
      request: result.request,
    };
  } catch (error) {
    console.error("Erro ao criar solicitação:", error);
    return {
      success: false,
      message: "Erro ao criar solicitação. Tente novamente.",
    };
  }
}
