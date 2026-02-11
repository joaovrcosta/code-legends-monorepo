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
    const publicRoutes = ["/login", "/signup"];
    const isPublicRoute = publicRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    );

    // Verificar se há erro de refresh token na sessão
    const sessionError = (session as { error?: string })?.error;
    if (sessionError === "RefreshAccessTokenError") {
      // Se houver erro de refresh token e não estiver em rota pública, redirecionar para login
      // Se já estiver em rota pública, permitir acesso (evita loop de redirecionamento)
      if (!isPublicRoute) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      // Se já está em rota pública, permitir acesso sem redirecionar
      return NextResponse.next();
    }

    const isLoggedIn = !!session?.user;

    // Acessar dados de onboarding do token através da session
    let onboardingCompleted =
      (session as { onboardingCompleted?: boolean })?.onboardingCompleted ??
      false;

    // Rotas de onboarding
    const onboardingRoutes = ["/onboarding", "/learn/onboarding"];
    const isOnboardingRoute = onboardingRoutes.some((route) =>
      pathname.startsWith(route)
    );

    // Se o usuário está tentando acessar /learn e a sessão mostra onboarding incompleto,
    // verificar diretamente na API para garantir dados atualizados
    // Isso resolve o problema de cache quando o onboarding é completado
    if (
      isLoggedIn &&
      pathname === "/learn" &&
      !onboardingCompleted
    ) {
      const accessToken = (session as { accessToken?: string })?.accessToken;
      if (accessToken) {
        try {
          const userResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333"}/me`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
              cache: "no-store", // Sem cache para garantir dados atualizados
            }
          );

          if (userResponse.ok) {
            const userData = await userResponse.json();
            onboardingCompleted = userData.user?.onboardingCompleted ?? false;
          }
        } catch (error) {
          console.error("Erro ao verificar onboarding no middleware:", error);
          // Em caso de erro, usar o valor da sessão
        }
      }
    }

    // Se estiver logado e tentar acessar login/signup
    if (isLoggedIn && (pathname === "/login" || pathname === "/signup")) {
      // Se não completou onboarding, redirecionar para onboarding
      if (!onboardingCompleted) {
        return NextResponse.redirect(new URL("/onboarding", req.url));
      }
      // Se completou, redirecionar para /
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Se não estiver logado e não for rota pública, redirecionar para login
    if (!isLoggedIn && !isPublicRoute) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Se estiver logado, não completou onboarding e não está em rota de onboarding
    if (isLoggedIn && !onboardingCompleted && !isOnboardingRoute) {
      // Redirecionar para onboarding
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    // Se completou onboarding e está tentando acessar rota de onboarding, redirecionar para /
    if (isLoggedIn && onboardingCompleted && isOnboardingRoute) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
