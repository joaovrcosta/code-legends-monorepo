/**
 * Utilitários de autenticação para uso no cliente
 * 
 * NOTA DE SEGURANÇA: O access token precisa ser acessível via JavaScript para requisições do cliente.
 * O refreshToken está em cookie httpOnly (configurado pela API) e não é acessível via JavaScript.
 * 
 * Para melhorar a segurança, considere:
 * - Usar API routes do Next.js como proxy para requisições autenticadas
 * - Implementar refresh automático de tokens
 * - Usar SameSite=Strict e Secure em produção
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
 * Obtém o token de autenticação do cookie
 * Se o token estiver expirado, remove-o automaticamente
 * 
 * NOTA: localStorage removido por questões de segurança (vulnerável a XSS)
 */
export function getAuthTokenFromClient(): string | null {
  if (typeof window !== "undefined") {
    // Lê o token do cookie (não httpOnly pois precisa ser acessível via JS para requisições)
    const cookies = document.cookie.split(";");
    const authTokenCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("auth_token=")
    );

    if (!authTokenCookie) {
      return null;
    }

    const token = authTokenCookie.split("=")[1];
    
    if (token && isTokenExpired(token)) {
      // Token expirado, remove o cookie
      removeAuthToken();
      return null;
    }
    
    return token || null;
  }
  return null;
}

/**
 * Define o token de autenticação em cookie
 * 
 * NOTA: localStorage removido por questões de segurança (vulnerável a XSS)
 * O cookie não é httpOnly pois precisa ser acessível via JavaScript para requisições do cliente.
 * Em produção, considere usar API routes como proxy para requisições autenticadas.
 */
export function setAuthToken(token: string): void {
  if (typeof window !== "undefined") {
    // Determina se está em produção para configurar Secure
    const isProduction = window.location.protocol === "https:";
    const secureFlag = isProduction ? "; Secure" : "";
    
    // Salva apenas em cookie (localStorage removido por segurança)
    // SameSite=Lax para permitir requisições cross-site seguras
    // Secure em produção para HTTPS apenas
    document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax${secureFlag}`; // 7 dias
  }
}

/**
 * Remove o token de autenticação do cookie
 */
export function removeAuthToken(): void {
  if (typeof window !== "undefined") {
    // Remove o cookie
    document.cookie = "auth_token=; path=/; max-age=0; SameSite=Lax";
  }
}

