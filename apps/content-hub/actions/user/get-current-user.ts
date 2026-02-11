"use server";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  user: User;
}

/**
 * Obtém o usuário atual
 */
export async function getCurrentUser(token: string): Promise<User | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 401) {
        return null;
      }
      throw new Error("Erro ao buscar usuário");
    }

    const data: UserResponse = await response.json();
    return data.user;
  } catch (error) {
    console.error("Erro ao buscar usuário atual:", error);
    return null;
  }
}

