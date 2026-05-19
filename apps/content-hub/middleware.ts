import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { getApiBaseUrl } from "@/lib/api-base-url";

const ACCESS_TOKEN_COOKIE = "auth_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";
const SESSION_MARKER_COOKIE = "auth_session";

type SessionPayload = {
  role?: string;
  exp?: number;
};

function getJwtSecret() {
  const secret = process.env.CONTENT_HUB_JWT_SECRET ?? process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT secret não configurado para o Content Hub");
  }

  return new TextEncoder().encode(secret);
}

function getCookieOptions(httpOnly: boolean) {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

function extractRefreshTokenFromHeaders(headers: Headers) {
  const getSetCookie = (headers as Headers & {
    getSetCookie?: () => string[];
  }).getSetCookie;

  const setCookieValues = typeof getSetCookie === "function"
    ? getSetCookie.call(headers)
    : [headers.get("set-cookie")].filter((value): value is string => Boolean(value));

  if (setCookieValues.length === 0) {
    return null;
  }

  for (const setCookieHeader of setCookieValues) {
    const match = setCookieHeader.match(/refreshToken=([^;]+)/);
    if (match) {
      return decodeURIComponent(match[1]);
    }
  }

  return null;
}

function decodeJwtPayload(token: string): SessionPayload | null {
  try {
    const [, payloadPart] = token.split(".");
    if (!payloadPart) return null;
    const padded =
      payloadPart + "=".repeat((4 - (payloadPart.length % 4)) % 4);
    return JSON.parse(
      atob(padded.replace(/-/g, "+").replace(/_/g, "/")),
    ) as SessionPayload;
  } catch {
    return null;
  }
}

async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as SessionPayload;
  } catch {
    return decodeJwtPayload(token);
  }
}

async function refreshSession(refreshToken: string) {
  try {
    const response = await fetch(`${getApiBaseUrl()}/token/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `refreshToken=${encodeURIComponent(refreshToken)}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { token?: string };
    if (!data.token) {
      return null;
    }

    const payload = await verifyToken(data.token);
    if (!payload) {
      return null;
    }

    return {
      accessToken: data.token,
      refreshToken:
        extractRefreshTokenFromHeaders(response.headers) ?? refreshToken,
      payload,
    };
  } catch {
    // API offline, URL inválida ou rede indisponível — não derruba o middleware
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  const hasSessionMarker = request.cookies.get(SESSION_MARKER_COOKIE)?.value === "1";
  const { pathname } = request.nextUrl;

  const publicRoutes = ["/login", "/auth/login"];
  const isPublicRoute = publicRoutes.includes(pathname);

  let payload: SessionPayload | null = null;
  if (token) {
    payload = await verifyToken(token);
  }

  let refreshedSession:
    | { accessToken: string; refreshToken: string; payload: SessionPayload }
    | null = null;

  if (!payload && refreshToken) {
    refreshedSession = await refreshSession(refreshToken);
    payload = refreshedSession?.payload ?? null;
  }

  const clearSessionAndRedirect = () => {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(ACCESS_TOKEN_COOKIE);
    response.cookies.delete(REFRESH_TOKEN_COOKIE);
    response.cookies.delete(SESSION_MARKER_COOKIE);
    return response;
  };

  if (!isPublicRoute) {
    if (!token && !refreshToken && !hasSessionMarker) {
      return clearSessionAndRedirect();
    }

    const role =
      payload?.role ?? (token ? decodeJwtPayload(token)?.role : undefined);

    if (role === "STUDENT") {
      const response = NextResponse.redirect(new URL("/login?error=access_denied", request.url));
      response.cookies.delete(ACCESS_TOKEN_COOKIE);
      response.cookies.delete(REFRESH_TOKEN_COOKIE);
      response.cookies.delete(SESSION_MARKER_COOKIE);
      return response;
    }
  }

  const sessionRole =
    payload?.role ?? (token ? decodeJwtPayload(token)?.role : undefined);

  if (
    pathname === "/login" &&
    ((sessionRole && sessionRole !== "STUDENT") || hasSessionMarker)
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const response = NextResponse.next();

  if (refreshedSession) {
    response.cookies.set(
      ACCESS_TOKEN_COOKIE,
      refreshedSession.accessToken,
      getCookieOptions(true)
    );
    response.cookies.set(
      REFRESH_TOKEN_COOKIE,
      refreshedSession.refreshToken,
      getCookieOptions(true)
    );
    response.cookies.set(SESSION_MARKER_COOKIE, "1", getCookieOptions(false));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

