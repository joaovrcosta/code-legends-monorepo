"use server";

import { getAuthToken } from "../auth/session";
import type { SubmitCareerExamAttemptResponse } from "@/types/career";

export async function submitCareerExamAttempt(args: {
  careerIdentifier: string;
  examId: string;
  score: number;
  answers?: unknown;
}): Promise<SubmitCareerExamAttemptResponse> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!baseUrl) {
      throw new Error("NEXT_PUBLIC_API_URL não configurado");
    }
    if (/^https?:\/\/localhost:3000\b/i.test(baseUrl)) {
      throw new Error(
        `NEXT_PUBLIC_API_URL parece apontar para o FRONT (${baseUrl}). Configure para a API (ex.: http://localhost:3333).`,
      );
    }

    const token = await getAuthToken();
    if (!token) {
      throw new Error("Token de autenticação não encontrado");
    }

    const url = `${baseUrl}/careers/${encodeURIComponent(args.careerIdentifier)}/exams/${args.examId}/attempts`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ score: args.score, answers: args.answers }),
      cache: "no-store",
    });

    const contentType = res.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? await res.json().catch(() => null)
      : await res.text().catch(() => "");

    if (!res.ok) {
      const message =
        (payload && typeof payload === "object" && "message" in payload
          ? String((payload as any).message)
          : "") || "Erro ao enviar tentativa do exame";

      const issues =
        payload && typeof payload === "object" && "issues" in payload
          ? (payload as any).issues
          : null;

      const issuesText = Array.isArray(issues)
        ? `\n${issues.map((i: any) => `- ${i.path?.join(".")}: ${i.message}`).join("\n")}`
        : "";

      throw new Error(`[${res.status}] ${message}${issuesText}`);
    }

    return payload as SubmitCareerExamAttemptResponse;
  } catch (e) {
    const msg =
      e instanceof Error
        ? e.message
        : typeof e === "string"
          ? e
          : "Erro ao enviar tentativa do exame";
    throw new Error(msg);
  }
}

