"use server";

import { getAuthToken } from "../auth/session";

export type CareerExamAttemptDto = {
  id: string;
  careerExamId: string;
  examTitle: string;
  examSlug: string;
  passingScore: number;
  score: number;
  passed: boolean;
  createdAt: string;
};

export async function listCareerExamAttempts(
  careerSlug: string,
  examId?: string
): Promise<{ attempts: CareerExamAttemptDto[] }> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) throw new Error("NEXT_PUBLIC_API_URL não configurado");

  const token = await getAuthToken();
  if (!token) throw new Error("Token de autenticação não encontrado");

  const q = examId ? `?examId=${encodeURIComponent(examId)}` : "";
  const res = await fetch(
    `${baseUrl}/careers/${encodeURIComponent(careerSlug)}/me/exam-attempts${q}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message ?? "Erro ao carregar histórico");
  }

  return (await res.json()) as { attempts: CareerExamAttemptDto[] };
}
