"use server";

export interface User {
  id: string;
  name: string;
  avatar?: string | null;
  slug?: string | null;
  bio?: string | null;
  expertise?: string[];
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
  createdAt: string;
  updatedAt: string;
  email: string;
  onboardingCompleted: boolean;
  onboardingGoal?: string | null;
  onboardingCareer?: string | null;
  totalXp: number;
  level: number;
  xpToNextLevel: number;
  birth_date?: string | null;
  born_in?: string | null;
  document?: string | null;
  foreign_phone?: string | null;
  fullname?: string | null;
  gender?: string | null;
  marital_status?: string | null;
  occupation?: string | null;
  phone?: string | null;
  rg?: string | null;
  address?: string | null;
}

export interface UsersListResponse {
  users: User[];
}

/**
 * Lista todos os usuários da plataforma
 */
export async function listUsers(token?: string): Promise<UsersListResponse> {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Erro na resposta da API:", response.statusText);
      return { users: [] };
    }

    const data: UsersListResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    return { users: [] };
  }
}



