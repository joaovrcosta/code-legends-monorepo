"use server";

import type { UserOverview } from "./get-user-overview";

export interface UpdateUserOverviewData {
  name?: string;
  bio?: string | null;
  expertise?: string[];
  onboardingCompleted?: boolean;
  onboardingGoal?: string | null;
  onboardingCareer?: string | null;
  totalXp?: number;
  level?: number;
  xpToNextLevel?: number;
  birth_date?: string | null;
  born_in?: string | null;
  document?: string | null;
  foreign_phone?: string | null;
  fullname?: string | null;
  gender?: string | null;
  marital_status?: string | null;
  occupation?: string | null;
  phone?: string | null;
  rg?: string | null;
  address?: string | null;
}

export interface UpdateUserOverviewResponse {
  user: UserOverview["user"];
  activeCourse: UserOverview["activeCourse"];
  enrolledCourses: UserOverview["enrolledCourses"];
  completedLessons: UserOverview["completedLessons"];
  statistics: UserOverview["statistics"];
}

/**
 * Atualiza o overview de um usuário
 * Apenas ADMIN pode atualizar
 */
export async function updateUserOverview(
  userId: string,
  userData: UpdateUserOverviewData,
  token: string
): Promise<UpdateUserOverviewResponse> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/overview`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erro ao atualizar overview do usuário");
    }

    const data: UpdateUserOverviewResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao atualizar overview do usuário:", error);
    throw error instanceof Error
      ? error
      : new Error("Erro ao atualizar overview do usuário");
  }
}
