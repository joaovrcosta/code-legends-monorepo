/**
 * Utilitários de autenticação para uso no cliente
 */

/**
 * Verifica se um token JWT está expirado
 */
function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return true;
    }

    // Decodifica o payload (segunda parte)
    const payload = parts[1];
    // Adiciona padding se necessário
    const paddedPayload = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    const decodedPayload = JSON.parse(
      atob(paddedPayload.replace(/-/g, "+").replace(/_/g, "/"))
    );

    // Verifica se o token tem expiração
    if (decodedPayload.exp) {
      // exp está em segundos, Date.now() está em milissegundos
      const expirationTime = decodedPayload.exp * 1000;
      const currentTime = Date.now();

      // Se o token expirou, retorna true
      return currentTime >= expirationTime;
    }

    return false;
  } catch (error) {
    // Se houver erro ao decodificar, considera expirado
    return true;
  }
}

/**
 * Obtém o token de autenticação do localStorage
 * Se o token estiver expirado, remove-o automaticamente
 */
export function getAuthTokenFromClient(): string | null {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token && isTokenExpired(token)) {
      // Token expirado, remove do localStorage e cookie
      removeAuthToken();
      return null;
    }
    return token;
  }
  return null;
}

/**
 * Define o token de autenticação no localStorage e cookie
 */
export function setAuthToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", token);
    // Salva também em cookie para o middleware poder verificar
    document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`; // 7 dias
  }
}

/**
 * Remove o token de autenticação do localStorage e cookie
 */
export function removeAuthToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
    // Remove também o cookie
    document.cookie = "auth_token=; path=/; max-age=0; SameSite=Lax";
  }
}

