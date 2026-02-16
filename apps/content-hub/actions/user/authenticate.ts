"use server";

export interface AuthenticateResponse {
  token: string;
}

/**
 * Autentica um usuário
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<string> {
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
    return data.token;
  } catch (error) {
    console.error("Erro ao autenticar usuário:", error);
    throw error instanceof Error
      ? error
      : new Error("Erro ao autenticar usuário");
  }
}

