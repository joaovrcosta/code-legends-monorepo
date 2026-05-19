"use server";

import { cookies } from "next/headers";
import { jwtVerify, type JWTPayload } from "jose";
import { getApiBaseUrl } from "@/lib/api-base-url";

const ACCESS_TOKEN_COOKIE = "auth_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";
const SESSION_MARKER_COOKIE = "auth_session";

type SessionPayload = JWTPayload & {
  id?: string;
  role?: string;
  email?: string;
  name?: string;
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

async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function createSession(accessToken: string, refreshToken?: string | null) {
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, getCookieOptions(true));
  if (refreshToken) {
    cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, getCookieOptions(true));
  }
  cookieStore.set(SESSION_MARKER_COOKIE, "1", getCookieOptions(false));
}

export async function clearSession() {
  const cookieStore = await cookies();

  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
  cookieStore.delete(SESSION_MARKER_COOKIE);
}

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  let response: Response;
  try {
    response = await fetch(`${getApiBaseUrl()}/token/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `refreshToken=${encodeURIComponent(refreshToken)}`,
      },
      cache: "no-store",
    });
  } catch {
    return null;
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      await clearSession();
    }
    return null;
  }

  const data = (await response.json()) as { token?: string };
  const nextAccessToken = data.token;
  const nextRefreshToken =
    extractRefreshTokenFromHeaders(response.headers) ?? refreshToken;

  if (!nextAccessToken) {
    await clearSession();
    return null;
  }

  await createSession(nextAccessToken, nextRefreshToken);
  return nextAccessToken;
}

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (accessToken) {
    const payload = await verifySessionToken(accessToken);
    if (payload) {
      return accessToken;
    }
  }

  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  if (refreshToken) {
    const refreshedToken = await refreshAccessToken(refreshToken);
    if (refreshedToken) {
      return refreshedToken;
    }
  }

  // Fallback pragmático: se o token existe mas não pôde ser verificado localmente,
  // ainda o usamos para a API validar a assinatura no backend.
  return accessToken ?? null;
}

export async function getSessionPayload(): Promise<SessionPayload | null> {
  const token = await getAuthToken();
  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}
