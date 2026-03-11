"use server";

import { buildApiHeaders } from "@/actions/auth";

interface UnenrollCourseParams {
  userId: string;
  courseId: string;
  token?: string;
}

/**
 * Desmatricula um usuário de um curso específico e zera
 * o progresso e XP relacionados àquele curso.
 *
 * Essa action é chamada a partir do Content Hub (admin).
 */
export async function unenrollUserFromCourse({
  userId,
  courseId,
  token,
}: UnenrollCourseParams): Promise<void> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/unenroll`,
    {
      method: "POST",
      headers: await buildApiHeaders(undefined, token),
      cache: "no-store",
      body: JSON.stringify({ userId }),
    }
  );

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as {
      message?: string;
    };
    throw new Error(
      errorData.message || "Erro ao desmatricular aluno do curso"
    );
  }
}

