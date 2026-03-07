"use server";

import { createSession } from "@/actions/auth";
import { redirect } from "next/navigation";

export interface AuthenticateResponse {
  token: string;
  onboardingCompleted?: boolean;
  onboardingGoal?: string | null;
  onboardingCareer?: string | null;
}

export interface AuthenticateSessionResult {
  onboardingCompleted: boolean;
  onboardingGoal: string | null;
  onboardingCareer: string | null;
}

export interface AuthenticateSessionData extends AuthenticateSessionResult {
  token: string;
  refreshToken: string | null;
  role: string | null;
}

function extractRefreshTokenFromHeaders(headers: Headers) {
  const getSetCookie = (headers as Headers & {
    getSetCookie?: () => string[];
  }).getSetCookie;

  const setCookieValues = typeof getSetCookie === "function"
    ? getSetCookie.call(headers)
    : [headers.get("set-cookie")].filter((value): value is string => Boolean(value));

  if (setCookieValues.length === 0) {
    return null;
  }

  for (const setCookieHeader of setCookieValues) {
    const match = setCookieHeader.match(/refreshToken=([^;]+)/);
    if (match) {
      return decodeURIComponent(match[1]);
    }
  }

  return null;
}

function decodeJwtPayload(token: string): { role?: string } | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) {
      return null;
    }

    const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    return JSON.parse(Buffer.from(padded.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8"));
  } catch {
    return null;
  }
}

/**
 * Autentica um usuário
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<AuthenticateSessionResult> {
  const session = await authenticateUserSessionData(email, password);
  await createSession(session.token, session.refreshToken);

  return {
    onboardingCompleted: session.onboardingCompleted,
    onboardingGoal: session.onboardingGoal,
    onboardingCareer: session.onboardingCareer,
  };
}

export async function authenticateUserSessionData(
  email: string,
  password: string
): Promise<AuthenticateSessionData> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/auth`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erro ao autenticar");
    }

    const data: AuthenticateResponse = await response.json();
    const refreshToken = extractRefreshTokenFromHeaders(response.headers);
    const payload = data.token ? decodeJwtPayload(data.token) : null;

    if (!data.token) {
      throw new Error("Não foi possível criar a sessão autenticada");
    }

    if (payload?.role === "STUDENT") {
      throw new Error(
        "Acesso negado. Apenas administradores e instrutores podem acessar o Content Hub."
      );
    }

    return {
      token: data.token,
      refreshToken,
      role: payload?.role ?? null,
      onboardingCompleted: data.onboardingCompleted ?? false,
      onboardingGoal: data.onboardingGoal ?? null,
      onboardingCareer: data.onboardingCareer ?? null,
    };
  } catch (error) {
    console.error("Erro ao autenticar usuário:", error);
    throw error instanceof Error
      ? error
      : new Error("Erro ao autenticar usuário");
  }
}

export async function authenticateUserFromForm(
  _previousState: string | null,
  formData: FormData
): Promise<string | null> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    await authenticateUser(email, password);
  } catch (error) {
    return error instanceof Error ? error.message : "Erro ao autenticar usuário";
  }

  redirect("/");
}

