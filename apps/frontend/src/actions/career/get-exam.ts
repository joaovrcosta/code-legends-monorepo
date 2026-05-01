"use server";

import { getAuthToken } from "../auth/session";

export type GetCareerExamResponse = {
  exam: {
    id: string;
    careerId: string;
    slug: string;
    title: string;
    description: string | null;
    content: unknown;
    passingScore: number;
    maxAttempts: number | null;
  };
  career: { title: string; slug: string } | null;
  module: { title: string } | null;
};

export async function getCareerExam(args: {
  careerIdentifier: string;
  examId: string;
}): Promise<GetCareerExamResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL não configurado");
  }

  const token = await getAuthToken();
  if (!token) {
    throw new Error("Token de autenticação não encontrado");
  }

  const res = await fetch(
    `${baseUrl}/careers/${encodeURIComponent(args.careerIdentifier)}/exams/${args.examId}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Erro ao buscar exame");
  }

  return (await res.json()) as GetCareerExamResponse;
}

