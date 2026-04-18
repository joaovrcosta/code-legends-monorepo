import { auth } from "./auth/authSetup";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth(
  async (
    req: NextRequest & {
      auth: {
        user?: {
          id?: string;
        };
      } | null;
    }
  ) => {
    const { pathname } = req.nextUrl;
    const session = await auth();

    // Rotas públicas
    const publicRoutes = ["/login", "/signup", "/certificates"];
    const isPublicRoute = publicRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    );

    const sessionError = (session as { error?: string })?.error;
    if (sessionError === "RefreshAccessTokenError") {
      if (!isPublicRoute) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      return NextResponse.next();
    }

    const isLoggedIn = !!session?.user;

    const onboardingCompleted =
      (session as { onboardingCompleted?: boolean })?.onboardingCompleted ??
      false;

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
