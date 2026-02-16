"use server";

import { auth } from "@/auth/authSetup";
import { redirect } from "next/navigation";
import type { User } from "@/types/user";
import { Role } from "@code-legends/shared-types";

/**
 * Obtém a sessão atual do usuário usando NextAuth
 */
export async function getCurrentSession(): Promise<User | null> {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  // Cast para acessar propriedades customizadas do token (onboarding, role, etc)
  interface ExtendedUser {
    id?: string;
    name?: string;
    email?: string;
    image?: string | null;
    role?: string;
    onboardingCompleted?: boolean;
    onboardingGoal?: string | null;
    onboardingCareer?: string | null;
  }
  const extendedUser = session.user as ExtendedUser;

  // Validar e converter role para o tipo Role
  const roleValue = extendedUser.role;
  const validRole = roleValue && Object.values(Role).includes(roleValue as Role)
    ? (roleValue as Role)
    : Role.STUDENT;

  return {
    id: extendedUser.id || "",
    name: extendedUser.name || "",
    email: extendedUser.email || "",
    avatar: extendedUser.image || null,

    // Dados Críticos: Lendo do token em vez de hardcoded
    role: validRole,
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
interface SessionWithToken {
  accessToken?: string;
}

export async function getAuthToken(): Promise<string | null> {
  const session = await auth();
  return (session as unknown as SessionWithToken)?.accessToken || null;
}

// Funções deprecadas mantidas para compatibilidade
export async function createSession(token: string) {
  return token;
}

export async function destroySession() {
}