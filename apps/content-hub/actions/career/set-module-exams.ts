"use server";

import { buildApiHeaders } from "@/actions/auth";

export async function adminSetCareerModuleExams(
  moduleId: string,
  exams: Array<{ careerExamId: string; examIndex: 1 | 2 }>,
  token?: string
): Promise<void> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/career-modules/${moduleId}/exams`,
    {
      method: "PUT",
      headers: await buildApiHeaders(undefined, token),
      body: JSON.stringify({ exams }),
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Erro ao vincular exames ao módulo");
  }
}

