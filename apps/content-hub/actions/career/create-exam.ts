"use server";

import { buildApiHeaders } from "@/actions/auth";
import type { CareerExam } from "./types";

export type CreateCareerExamData = {
  slug: string;
  title: string;
  description?: string;
  passingScore?: number;
  maxAttempts?: number | null;
  content?: unknown;
};

export async function adminCreateCareerExam(
  careerId: string,
  data: CreateCareerExamData,
  token?: string
): Promise<{ exam: CareerExam }> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/careers/${careerId}/exams`,
    {
      method: "POST",
      headers: await buildApiHeaders(undefined, token),
      body: JSON.stringify(data),
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Erro ao criar exame");
  }

  return (await res.json()) as { exam: CareerExam };
}

