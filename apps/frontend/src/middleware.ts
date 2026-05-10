import { auth } from "./auth/authSetup";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { CL_ONBOARDING_HOME_COOKIE } from "./lib/onboarding-home-cookie";

type AuthShape = {
  user?: { id?: string; onboardingCompleted?: boolean } | null;
  error?: string;
  onboardingCompleted?: boolean;
} | null;

function readOnboardingFromAuth(session: AuthShape): boolean {
  if (!session) return false;
  return (
    session.onboardingCompleted ??
    session.user?.onboardingCompleted ??
    false
  );
}

export default auth(
  async (req: NextRequest & { auth: AuthShape }) => {
    const { pathname } = req.nextUrl;
    const session = req.auth;

    const publicRoutes = ["/login", "/signup", "/certificates"];
    const isPublicRoute = publicRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    );

    const sessionError = session?.error;
    if (sessionError === "RefreshAccessTokenError") {
      if (!isPublicRoute) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      return NextResponse.next();
    }

    const isLoggedIn = !!session?.user;

    const jwtOnboardingDone = readOnboardingFromAuth(session);
    const obHomeOk =
      req.cookies.get(CL_ONBOARDING_HOME_COOKIE)?.value === "1";
    const onboardingCompleted =
      jwtOnboardingDone || (isLoggedIn && obHomeOk);

    const onboardingRoutes = ["/onboarding", "/learn/onboarding"];
    const isOnboardingRoute = onboardingRoutes.some((route) =>
      pathname.startsWith(route)
    );

    if (isLoggedIn && (pathname === "/login" || pathname === "/signup")) {
      if (!onboardingCompleted) {
        return NextResponse.redirect(new URL("/onboarding", req.url));
      }
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (!isLoggedIn && !isPublicRoute) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (isLoggedIn && !onboardingCompleted && !isOnboardingRoute) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    if (isLoggedIn && onboardingCompleted && isOnboardingRoute) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  }
);

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
