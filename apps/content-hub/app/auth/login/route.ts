import { NextRequest, NextResponse } from "next/server";
import { authenticateUserSessionData } from "@/actions/user/authenticate";

const ACCESS_TOKEN_COOKIE = "auth_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";
const SESSION_MARKER_COOKIE = "auth_session";

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

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    const session = await authenticateUserSessionData(email, password);
    const response = NextResponse.redirect(new URL("/", request.url));

    response.cookies.set(ACCESS_TOKEN_COOKIE, session.token, getCookieOptions(true));
    if (session.refreshToken) {
      response.cookies.set(REFRESH_TOKEN_COOKIE, session.refreshToken, getCookieOptions(true));
    }
    response.cookies.set(SESSION_MARKER_COOKIE, "1", getCookieOptions(false));

    return response;
  } catch (error) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "message",
      error instanceof Error ? error.message : "Erro ao autenticar usuário"
    );
    return NextResponse.redirect(loginUrl);
  }
}
