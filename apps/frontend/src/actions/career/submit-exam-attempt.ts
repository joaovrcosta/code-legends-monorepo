"use server";

import { getAuthToken } from "../auth/session";
import type { SubmitCareerExamAttemptResponse } from "@/types/career";

export async function submitCareerExamAttempt(args: {
  careerIdentifier: string;
  examId: string;
  score: number;
  answers?: unknown;
}): Promise<SubmitCareerExamAttemptResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL não configurado");
  }

  const token = await getAuthToken();
  if (!token) {
    throw new Error("Token de autenticação não encontrado");
  }

  const res = await fetch(
    `${baseUrl}/careers/${encodeURIComponent(args.careerIdentifier)}/exams/${args.examId}/attempts`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ score: args.score, answers: args.answers }),
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Erro ao enviar tentativa do exame");
  }

  return (await res.json()) as SubmitCareerExamAttemptResponse;
}

