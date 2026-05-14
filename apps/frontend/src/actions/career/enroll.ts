"use server";

import { getAuthToken } from "../auth/session";
import { revalidatePath } from "next/cache";
import type { EnrollCareerResponse } from "@/types/career";
import {
  CAREER_ENROLL_PREMIUM_REQUIRED,
  type CareerEnrollBlockedPlan,
} from "@/lib/career-enroll-gate";

export async function enrollInCareer(
  careerId: string
): Promise<EnrollCareerResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL não configurado");
  }

  const token = await getAuthToken();
  if (!token) {
    throw new Error("Token de autenticação não encontrado");
  }

  const res = await fetch(`${baseUrl}/careers/${careerId}/enroll`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as {
      message?: string;
      currentPlan?: string;
    };
    if (
      res.status === 403 &&
      (data.currentPlan === "FREE" || data.currentPlan === "PRO")
    ) {
      const plan = data.currentPlan as CareerEnrollBlockedPlan;
      throw Object.assign(
        new Error(
          data.message ||
            "As carreiras exigem o plano Premium para se inscrever.",
        ),
        {
          code: CAREER_ENROLL_PREMIUM_REQUIRED,
          currentPlan: plan,
        },
      );
    }
    throw new Error(data.message || "Erro ao se inscrever na carreira");
  }

  const data = (await res.json()) as EnrollCareerResponse;

  try {
    revalidatePath("/learn/careers");
    revalidatePath(`/learn/careers/${careerId}`);
  } catch {
    // ignore
  }

  return data;
}

