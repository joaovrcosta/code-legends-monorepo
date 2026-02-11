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

  return {
    id: session.user.id || "",
    name: session.user.name || "",
    email: session.user.email || "",
    avatar: session.user.image || undefined,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Versão que força redirect quando não autenticado
 */
export async function requireAuth(): Promise<User> {
  const session = await auth();

  if (!session?.user) {
    console.log("Usuário não autenticado, redirecionando para login...");
    redirect("/login");
  }

  return {
    id: session.user.id || "",
    name: session.user.name || "",
    email: session.user.email || "",
    avatar: session.user.image || undefined,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Obtém o token de acesso da sessão atual
 */
export async function getAuthToken(): Promise<string | null> {
  const session = await auth();
  return (session as { accessToken?: string })?.accessToken || null;
}

// Funções deprecadas mantidas para compatibilidade
export async function createSession(token: string) {
  // Deprecated: NextAuth gerencia as sessões automaticamente
  return token;
}

export async function destroySession() {
  // Deprecated: Use signOut() do next-auth/react no client
}
