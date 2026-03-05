"use server";

import { getAuthToken } from "../auth/session";
import type { User, UserMeResponse } from "@/types/user";

/**
 * Busca os dados completos do usuário autenticado diretamente da API através da rota /me
 * Esta função será útil quando a rota /users/me estiver implementada na API
 *
 * Use esta função quando precisar de dados atualizados do servidor,
 * ao invés de usar apenas os dados decodificados do JWT.
 */
export async function getUserFromAPI(): Promise<User | null> {
  const token = await getAuthToken();

  if (!token) {
    return null;
  }

  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/me`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store", // Sempre buscar dados atualizados
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error("❌ Token inválido ou expirado");
      } else {
        console.error("❌ Erro ao buscar usuário:", response.status);
      }
      return null;
    }

    const data: UserMeResponse = await response.json();
    return data.user;
  } catch (error) {
    console.error("❌ Erro ao buscar dados do usuário da API:", error);
    return null;
  }
}
