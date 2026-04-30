"use server";

import { buildApiHeaders } from "@/actions/auth";
import type { Career, CareerExam, CareerModule } from "./types";

export type AdminCareersListResponse = {
  careers: Array<
    Career & {
      modules: CareerModule[];
      exams: CareerExam[];
    }
  >;
};

export async function adminListCareers(
  token?: string
): Promise<AdminCareersListResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/careers`, {
    method: "GET",
    headers: await buildApiHeaders(undefined, token),
    cache: "no-store",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Erro ao listar carreiras");
  }

  return (await res.json()) as AdminCareersListResponse;
}

