"use server";

import { getAuthToken } from "../auth/session";

export interface OnboardingStatus {
  isCompleted: boolean;
  goal?: string | null;
  career?: string | null;
}

export async function getOnboardingStatus(): Promise<OnboardingStatus> {
  try {
    const token = await getAuthToken();

    if (!token) {
      return { isCompleted: false };
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/onboarding/status`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return { isCompleted: false };
      }
      console.error("Erro na resposta da API:", response.statusText);
      return { isCompleted: false };
    }

    const data = await response.json();
    return {
      isCompleted: data.onboardingCompleted || false,
      goal: data.onboardingGoal || null,
      career: data.onboardingCareer || null,
    };
  } catch (error) {
    console.error("Erro ao buscar status do onboarding:", error);
    return { isCompleted: false };
  }
}
