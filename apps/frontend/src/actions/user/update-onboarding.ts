"use server";

import { getAuthToken } from "../auth/session";

export interface UpdateOnboardingData {
  goal?: string;
  career?: string;
}

export async function updateOnboarding(
  data: UpdateOnboardingData
): Promise<{ success: boolean }> {
  try {
    const token = await getAuthToken();

    if (!token) {
      throw new Error("Token de autenticação não encontrado");
    }

    // Mapear os campos para o formato esperado pela API
    const payload: {
      onboardingGoal?: string;
      onboardingCareer?: string;
    } = {};

    if (data.goal) {
      payload.onboardingGoal = data.goal;
    }

    if (data.career) {
      payload.onboardingCareer = data.career;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/onboarding`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 404) {
        throw new Error("Usuário não encontrado");
      }

      // Tratar erros de validação (400) que retornam array de mensagens
      if (response.status === 400 && Array.isArray(errorData.message)) {
        const validationErrors = errorData.message
          .map((err: { message?: string; path?: string[] }) => {
            const field = err.path?.[0] || "campo";
            return `${field}: ${err.message || "valor inválido"}`;
          })
          .join(", ");
        throw new Error(`Erro de validação: ${validationErrors}`);
      }

      throw new Error(
        errorData.message || "Erro ao atualizar progresso do onboarding"
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar onboarding:", error);
    throw error instanceof Error
      ? error
      : new Error("Erro ao atualizar onboarding");
  }
}
