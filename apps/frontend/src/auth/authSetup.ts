import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

interface TokenWithRefresh {
  id?: string;
  name?: string;
  email?: string;
  picture?: string;
  refreshToken?: string;
  accessToken?: string;
  accessTokenExpires?: number;
  onboardingCompleted?: boolean;
  onboardingGoal?: string | null;
  onboardingCareer?: string | null;
  lastOnboardingCheck?: number;
  error?: string;
  [key: string]: unknown;
}

async function refreshAccessToken(token: TokenWithRefresh) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/token/refresh`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken: token.refreshToken,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("❌ Erro da API:", errorData);
      throw new Error(`Refresh token inválido: ${response.status}`);
    }

    const refreshedTokens = await response.json();
    const newAccessToken = refreshedTokens.token;

    // Buscar dados atualizados do usuário com o novo token
    try {
      const userResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/me`,
        {
          headers: {
            Authorization: `Bearer ${newAccessToken}`,
          },
          next: { revalidate: 30 }, // Cache de 10 segundos para reduzir requisições
        }
      );

      // Se a API retornar 401 ou 404, o usuário foi excluído
      if (userResponse.status === 401 || userResponse.status === 404) {
        console.error(
          "❌ Usuário não encontrado após refresh - forçando logout"
        );
        throw new Error(`Usuário não encontrado: ${userResponse.status}`);
      }

      if (userResponse.ok) {
        const userData = await userResponse.json();
        return {
          ...token,
          accessToken: newAccessToken,
          accessTokenExpires: Date.now() + 10 * 60 * 1000, // 10 minutos
          onboardingCompleted: userData.user.onboardingCompleted ?? false,
          onboardingGoal: userData.user.onboardingGoal ?? null,
          onboardingCareer: userData.user.onboardingCareer ?? null,
          error: undefined,
        };
      }
    } catch (error) {
      console.error("Erro ao buscar dados atualizados do usuário:", error);
      // Se o erro for de usuário não encontrado, propagar o erro para invalidar o token
      if (error instanceof Error && error.message.includes("não encontrado")) {
        throw error;
      }
    }

    // Se não conseguir buscar dados atualizados, retornar token renovado sem atualizar onboarding
    return {
      ...token,
      accessToken: newAccessToken,
      accessTokenExpires: Date.now() + 10 * 60 * 1000, // 10 minutos
      error: undefined,
    };
  } catch (error) {
    console.error("❌ Erro ao renovar token:", (error as Error).message);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

// @ts-expect-error - NextAuth v5 beta tem incompatibilidades de tipos
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Autenticar na API externa
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/users/auth`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
              credentials: "include",
            }
          );

          if (!response.ok) {
            return null;
          }

          const data = await response.json();
          const token = data.token;

          // Extrair refreshToken do cookie da resposta
          const cookies = response.headers.get("set-cookie");
          let refreshToken = null;
          if (cookies) {
            const match = cookies.match(/refreshToken=([^;]+)/);
            if (match) {
              refreshToken = match[1];
            }
          }

          if (!token) {
            return null;
          }

          // Buscar dados do usuário usando o token
          const userResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333"}/me`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!userResponse.ok) {
            return null;
          }

          const userData = await userResponse.json();

          // Retornar usuário com tokens, tempo de expiração e dados de onboarding
          // O backend retorna onboardingCompleted, onboardingGoal e onboardingCareer na resposta do login
          return {
            id: userData.user.id,
            name: userData.user.name,
            email: userData.user.email,
            image: userData.user.avatar,
            accessToken: token,
            refreshToken: refreshToken,
            accessTokenExpires: Date.now() + 10 * 60 * 1000, // 10 minutos
            onboardingCompleted: data.onboardingCompleted ?? false,
            onboardingGoal: data.onboardingGoal ?? null,
            onboardingCareer: data.onboardingCareer ?? null,
          };
        } catch (error) {
          console.error("Erro ao autenticar:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({
      token,
      user,
      trigger,
    }: {
      token: TokenWithRefresh;
      user?: unknown;
      trigger?: string;
    }) {
      // Login inicial - armazenar todos os dados
      if (user) {
        const userData = user as {
          id: string;
          name: string;
          email: string;
          image?: string;
          accessToken: string;
          refreshToken?: string;
          accessTokenExpires: number;
          onboardingCompleted?: boolean;
          onboardingGoal?: string | null;
          onboardingCareer?: string | null;
        };
        return {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          picture: userData.image,
          accessToken: userData.accessToken,
          refreshToken: userData.refreshToken,
          accessTokenExpires: userData.accessTokenExpires,
          onboardingCompleted: userData.onboardingCompleted ?? false,
          onboardingGoal: userData.onboardingGoal ?? null,
          onboardingCareer: userData.onboardingCareer ?? null,
        };
      }

      // Se o trigger for "update", buscar dados atualizados do usuário
      // Usar cache: "no-store" para garantir dados sempre atualizados quando há atualização manual
      if (trigger === "update" && token.accessToken) {
        try {
          const userResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333"}/me`,
            {
              headers: {
                Authorization: `Bearer ${token.accessToken}`,
              },
              cache: "no-store", // Sem cache quando há atualização manual (ex: completar onboarding)
            }
          );

          // Se a API retornar 401 ou 404, o usuário foi excluído ou o token é inválido
          if (userResponse.status === 401 || userResponse.status === 404) {
            console.error(
              "❌ Usuário não encontrado ou token inválido - forçando logout"
            );
            return {
              ...token,
              error: "RefreshAccessTokenError",
            };
          }

          if (userResponse.ok) {
            const userData = await userResponse.json();
            return {
              ...token,
              onboardingCompleted: userData.user.onboardingCompleted ?? false,
              onboardingGoal: userData.user.onboardingGoal ?? null,
              onboardingCareer: userData.user.onboardingCareer ?? null,
              lastOnboardingCheck: 0, // Resetar para forçar verificação imediata na próxima requisição
            };
          }
        } catch (error) {
          console.error("Erro ao buscar dados atualizados do usuário:", error);
        }
      }

      // Token ainda válido - verificar dados de onboarding com intervalos otimizados
      // Para reduzir carga na API, verificamos com intervalos diferentes:
      // - Onboarding incompleto: a cada 10 segundos (para detectar mudanças rapidamente)
      // - Onboarding completo: a cada 60 segundos (para reduzir requisições)
      if (
        token.accessTokenExpires &&
        Date.now() < token.accessTokenExpires &&
        token.accessToken
      ) {
        const isOnboardingCompleted = token.onboardingCompleted ?? false;

        // Definir intervalos de verificação baseados no status de onboarding
        const checkInterval = isOnboardingCompleted ? 60000 : 10000; // 60s completo, 10s incompleto

        // Verificar apenas se passou o intervalo desde a última verificação
        const shouldUpdateOnboarding =
          !token.lastOnboardingCheck ||
          Date.now() - token.lastOnboardingCheck > checkInterval;

        if (shouldUpdateOnboarding) {
          try {
            const userResponse = await fetch(
              `${
                process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333"
              }/me`,
              {
                headers: {
                  Authorization: `Bearer ${token.accessToken}`,
                },
                next: { revalidate: 30 }, // Cache de 10 segundos para reduzir requisições
              }
            );

            // Se a API retornar 401 ou 404, o usuário foi excluído ou o token é inválido
            if (userResponse.status === 401 || userResponse.status === 404) {
              console.error(
                "❌ Usuário não encontrado ou token inválido - forçando logout"
              );
              return {
                ...token,
                error: "RefreshAccessTokenError",
              };
            }

            if (userResponse.ok) {
              const userData = await userResponse.json();
              return {
                ...token,
                onboardingCompleted: userData.user.onboardingCompleted ?? false,
                onboardingGoal: userData.user.onboardingGoal ?? null,
                onboardingCareer: userData.user.onboardingCareer ?? null,
                lastOnboardingCheck: Date.now(),
              };
            }
          } catch (error) {
            console.error("Erro ao verificar dados de onboarding:", error);
          }
        }
      }

      // Token ainda válido - retornar sem alterações
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Token expirado - tentar renovar
      console.log("⏰ Access token expirado, tentando renovar...");
      const refreshedToken = await refreshAccessToken(token);

      if (refreshedToken.error) {
        console.error("💥 Falha ao renovar token - usuário será deslogado");
      }

      return refreshedToken;
    },
    async session({
      session,
      token,
    }: {
      session: {
        user: { id?: string; name?: string; email?: string; image?: string };
        accessToken?: string;
        error?: string;
        onboardingCompleted?: boolean;
        onboardingGoal?: string | null;
        onboardingCareer?: string | null;
      };
      token: TokenWithRefresh;
    }) {
      // Se houver erro de refresh token, retornar sessão vazia mas com estrutura consistente
      // Isso evita problemas de hidratação
      if (token?.error === "RefreshAccessTokenError") {
        return {
          ...session,
          user: {
            id: undefined,
            name: undefined,
            email: undefined,
            image: undefined,
          },
          accessToken: undefined,
          error: "RefreshAccessTokenError",
        };
      }

      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string | undefined;
        session.accessToken = token.accessToken;
        session.error = token.error as string | undefined;
        session.onboardingCompleted = token.onboardingCompleted ?? false;
        session.onboardingGoal = token.onboardingGoal ?? null;
        session.onboardingCareer = token.onboardingCareer ?? null;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 dias
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
});
