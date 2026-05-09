"use server";

import { getAuthToken } from "../auth/session";

export interface CompleteOnboardingResult {
  success: true;
  onboardingCompleted: boolean;
  onboardingGoal: string | null;
  onboardingCareer: string | null;
}

export async function completeOnboarding(): Promise<CompleteOnboardingResult> {
  try {
    const token = await getAuthToken();

    if (!token) {
      throw new Error("Token de autenticação não encontrado");
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/onboarding/complete`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 404) {
        throw new Error("Usuário não encontrado");
      }

      throw new Error(errorData.message || "Erro ao completar onboarding");
    }

    const data = (await response.json().catch(() => null)) as {
      user?: {
        onboardingCompleted?: boolean;
        onboardingGoal?: string | null;
        onboardingCareer?: string | null;
      };
    } | null;

    const user = data?.user;
    return {
      success: true,
      onboardingCompleted: user?.onboardingCompleted ?? true,
      onboardingGoal: user?.onboardingGoal ?? null,
      onboardingCareer: user?.onboardingCareer ?? null,
    };
  } catch (error) {
    console.error("Erro ao completar onboarding:", error);
    throw error instanceof Error
      ? error
      : new Error("Erro ao completar onboarding");
  }
}
