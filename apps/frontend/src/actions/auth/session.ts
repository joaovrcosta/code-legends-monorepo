"use server";

import { auth } from "@/auth/authSetup";
import { redirect } from "next/navigation";
import type { User } from "@/types/user";

/**
 * Obtém a sessão atual do usuário usando NextAuth
 */
export async function getCurrentSession(): Promise<User | null> {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  // Cast para any para acessar propriedades customizadas do token (onboarding, role, etc)
  const extendedUser = session.user as any;

  return {
    id: extendedUser.id || "",
    name: extendedUser.name || "",
    email: extendedUser.email || "",
    avatar: extendedUser.image || null,

    // Dados Críticos: Lendo do token em vez de hardcoded
    role: extendedUser.role || "STUDENT",
    onboardingCompleted: extendedUser.onboardingCompleted ?? false,
    onboardingGoal: extendedUser.onboardingGoal || null,
    onboardingCareer: extendedUser.onboardingCareer || null,

    // Dados de UI (Defaults, já que não vêm no token para economizar tamanho)
    slug: null,
    bio: null,
    expertise: [],
    totalXp: 0,
    level: 1,
    xpToNextLevel: 100,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Versão que força redirect quando não autenticado
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentSession();

  if (!user) {
    console.log("Usuário não autenticado, redirecionando para login...");
    redirect("/login");
  }

  return user;
}

/**
 * Obtém o token de acesso da sessão atual
 */
export async function getAuthToken(): Promise<string | null> {
  const session = await auth();
  return (session as any)?.accessToken || null;
}

// Funções deprecadas mantidas para compatibilidade
export async function createSession(token: string) {
  return token;
}

export async function destroySession() {
}