"use server";

import { getAuthToken } from "../auth/session";

export interface VerifyPasswordResponse {
  success: boolean;
  message: string;
}

/**
 * Valida a senha do usuário atual usando a rota de autenticação
 * A senha é verificada mas nunca armazenada ou enviada em solicitações
 */
export async function verifyPassword(
  password: string
): Promise<VerifyPasswordResponse> {
  const token = await getAuthToken();

  if (!token) {
    return {
      success: false,
      message: "Usuário não autenticado",
    };
  }

  try {
    // Buscar email do usuário atual
    const userResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!userResponse.ok) {
      return {
        success: false,
        message: "Erro ao buscar dados do usuário",
      };
    }

    const userData = await userResponse.json();
    const email = userData.user.email;

    // Validar senha usando a rota de autenticação
    const authResponse = await fetch(
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

    if (!authResponse.ok) {
      const errorData = await authResponse.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || "Senha incorreta",
      };
    }

    // Senha válida - não armazenamos o token retornado
    return {
      success: true,
      message: "Senha válida",
    };
  } catch (error) {
    console.error("Erro ao verificar senha:", error);
    return {
      success: false,
      message: "Erro ao verificar senha. Tente novamente.",
    };
  }
}
