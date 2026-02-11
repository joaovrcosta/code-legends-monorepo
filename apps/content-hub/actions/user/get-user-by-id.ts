"use server";

import type { UserFull } from "./list-users";

export interface UserResponse {
  user: UserFull;
}

/**
 * Busca um usuário pelo ID
 */
export async function getUserById(
  id: string,
  token: string
): Promise<UserFull | null> {
  if (!id) return null;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error("Erro ao buscar usuário");
    }

    const data: UserResponse = await response.json();
    return data.user;
  } catch (error) {
    console.error("Erro ao buscar usuário por ID:", error);
    return null;
  }
}



