"use server";

import { buildApiHeaders } from "@/actions/auth";

export async function adminDeleteCareerExam(
  careerId: string,
  examId: string,
  token?: string
): Promise<void> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/careers/${careerId}/exams/${examId}`,
    {
      method: "DELETE",
      headers: await buildApiHeaders(undefined, token),
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Erro ao excluir exame");
  }
}

