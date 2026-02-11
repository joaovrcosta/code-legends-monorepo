"use server";

/**
 * Obtém o token de autenticação do localStorage (client-side)
 * Para uso em server actions, precisamos passar o token como parâmetro
 */
export async function getAuthToken(): Promise<string | null> {
  // Em server actions, não temos acesso ao localStorage
  // O token deve ser passado como parâmetro ou obtido via cookies
  return null;
}
