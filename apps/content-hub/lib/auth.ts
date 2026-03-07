/**
 * Utilitários de autenticação para uso no cliente
 */

const SESSION_MARKER_COOKIE = "auth_session=1";

/**
 * Mantido por compatibilidade com telas cliente antigas.
 * Não retorna mais o bearer token real; apenas indica que existe uma sessão.
 */
export function getAuthTokenFromClient(): string | null {
  if (typeof window !== "undefined") {
    return document.cookie.includes(SESSION_MARKER_COOKIE) ? "session" : null;
  }
  return null;
}

/**
 * Sessão agora é controlada por cookies HttpOnly no servidor.
 * Mantido apenas para compatibilidade transitória.
 */
export function setAuthToken(): void {}

/**
 * Remove apenas o marcador acessível ao cliente.
 * A limpeza completa da sessão deve acontecer via server action.
 */
export function removeAuthToken(): void {
  if (typeof window !== "undefined") {
    document.cookie = "auth_session=; path=/; max-age=0; SameSite=Lax";
  }
}

