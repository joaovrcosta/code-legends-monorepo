"use server";

import { buildApiHeaders } from "@/actions/auth";

export async function adminSetCareerModuleCourses(
  moduleId: string,
  courses: Array<{ courseId: string; orderIndex?: number }>,
  token?: string
): Promise<void> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/career-modules/${moduleId}/courses`,
    {
      method: "PUT",
      headers: await buildApiHeaders(undefined, token),
      body: JSON.stringify({ courses }),
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Erro ao vincular cursos ao módulo");
  }
}

