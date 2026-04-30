"use server";

import { buildApiHeaders } from "@/actions/auth";
import type { CareerExam } from "./types";

export type UpdateCareerExamData = Partial<{
  slug: string;
  title: string;
  description: string | null;
  passingScore: number;
  maxAttempts: number | null;
  content: unknown;
}>;

export async function adminUpdateCareerExam(
  careerId: string,
  examId: string,
  data: UpdateCareerExamData,
  token?: string
): Promise<{ exam: CareerExam }> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/careers/${careerId}/exams/${examId}`,
    {
      method: "PUT",
      headers: await buildApiHeaders(undefined, token),
      body: JSON.stringify(data),
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Erro ao atualizar exame");
  }

  return (await res.json()) as { exam: CareerExam };
}

