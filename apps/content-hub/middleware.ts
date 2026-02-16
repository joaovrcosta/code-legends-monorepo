import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Decodifica base64url (compatível com Edge Runtime)
 */
function base64UrlDecode(str: string): string {
  // Converte base64url para base64
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");

  // Adiciona padding se necessário
  while (base64.length % 4) {
    base64 += "=";
  }

  // Decodifica usando atob (disponível no Edge Runtime)
  try {
    return atob(base64);
  } catch {
    return "";
  }
}

/**
 * Decodifica e valida um token JWT
 * Retorna true se o token é válido e não está expirado, false caso contrário
 */
function isTokenValid(token: string): boolean {
  try {
    // JWT tem formato: header.payload.signature
    const parts = token.split(".");
    if (parts.length !== 3) {
      return false;
    }

    // Decodifica o payload (segunda parte)
    const payload = parts[1];
    const decodedPayloadStr = base64UrlDecode(payload);

    if (!decodedPayloadStr) {
      return false;
    }

    const decodedPayload = JSON.parse(decodedPayloadStr);

    // Verifica se o token tem expiração
    if (decodedPayload.exp) {
      // exp está em segundos, Date.now() está em milissegundos
      const expirationTime = decodedPayload.exp * 1000;
      const currentTime = Date.now();

      // Se o token expirou, retorna false
      if (currentTime >= expirationTime) {
        return false;
      }
    }

    return true;
  } catch (error) {
    // Se houver erro ao decodificar, considera inválido
    return false;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  const publicRoutes = ["/login"];
  const isPublicRoute = publicRoutes.includes(pathname);

  let isValidToken = false;
  if (token) {
    isValidToken = isTokenValid(token);

    if (!isValidToken) {
      const response = NextResponse.next();
      response.cookies.delete("auth_token");

      if (!isPublicRoute) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      return response;
    }
  }

  if (pathname === "/login" && isValidToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!isPublicRoute && !isValidToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

