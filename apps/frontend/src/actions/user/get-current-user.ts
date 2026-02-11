"use server";

import { getCurrentSession } from "../auth/session";
import type { User } from "@/types/user";

export async function getCurrentUser(): Promise<User | null> {
  try {
    const user = await getCurrentSession();
    return user;
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return null;
  }
}
