import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

interface TokenWithRefresh {
  id: string;
  name?: string;
  email?: string;
  picture?: string;
  accessToken: string;
  refreshToken?: string;
  accessTokenExpires: number;
  onboardingCompleted: boolean;
  onboardingGoal?: string | null;
  onboardingCareer?: string | null;
  lastOnboardingCheck?: number;
  error?: string;
  [key: string]: unknown;
}

async function refreshAccessToken(token: TokenWithRefresh): Promise<TokenWithRefresh> {
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
      if (response.status === 429) {
        return token;
      }
      throw new Error("RefreshAccessTokenError");
    }

    const data = await response.json();
    const newAccessToken = data.token;

    if (!newAccessToken) {
      throw new Error("Token not found");
    }

    let onboardingData = {
      onboardingCompleted: token.onboardingCompleted,
      onboardingGoal: token.onboardingGoal,
      onboardingCareer: token.onboardingCareer
    };

    try {
      const userResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/me`,
        {
          headers: {
            Authorization: `Bearer ${newAccessToken}`,
          },
          next: { revalidate: 30 },
        }
      );

      if (userResponse.ok) {
        const userData = await userResponse.json();
        onboardingData = {
          onboardingCompleted: userData.user.onboardingCompleted ?? false,
          onboardingGoal: userData.user.onboardingGoal ?? null,
          onboardingCareer: userData.user.onboardingCareer ?? null
        };
      } else if (userResponse.status === 401 || userResponse.status === 404) {
        throw new Error("UserNotFound");
      }
    } catch (error) {
      if ((error as Error).message === "UserNotFound") {
        throw error;
      }
    }

    return {
      ...token,
      accessToken: newAccessToken,
      refreshToken: data.refreshToken ?? token.refreshToken,
      accessTokenExpires: Date.now() + 10 * 60 * 1000,
      ...onboardingData,
      error: undefined,
    };
  } catch (error) {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

// A CORREÇÃO ESTÁ AQUI ABAIXO: (NextAuth as any)
export const { handlers, signIn, signOut, auth } = (NextAuth as any)({
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
            }
          );

          if (!response.ok) {
            return null;
          }

          const data = await response.json();
          const token = data.token;
          const refreshToken = data.refreshToken;

          if (!token) {
            return null;
          }

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

          return {
            id: userData.user.id,
            name: userData.user.name,
            email: userData.user.email,
            image: userData.user.avatar,
            accessToken: token,
            refreshToken: refreshToken,
            accessTokenExpires: Date.now() + 10 * 60 * 1000,
            onboardingCompleted: data.onboardingCompleted ?? false,
            onboardingGoal: data.onboardingGoal ?? null,
            onboardingCareer: data.onboardingCareer ?? null,
          };
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }: any) {
      if (user) {
        return {
          ...token,
          id: user.id,
          name: user.name,
          email: user.email,
          picture: user.image,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: user.accessTokenExpires,
          onboardingCompleted: user.onboardingCompleted,
          onboardingGoal: user.onboardingGoal,
          onboardingCareer: user.onboardingCareer,
          lastOnboardingCheck: Date.now(),
        };
      }

      const tokenWithRefresh = token as TokenWithRefresh;

      if (trigger === "update" && session) {
        const updatedToken = {
          ...tokenWithRefresh,
          ...session.user,
        };

        try {
          const userResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333"}/me`,
            {
              headers: {
                Authorization: `Bearer ${updatedToken.accessToken}`,
              },
              cache: "no-store",
            }
          );

          if (userResponse.ok) {
            const userData = await userResponse.json();
            updatedToken.onboardingCompleted = userData.user.onboardingCompleted ?? false;
            updatedToken.onboardingGoal = userData.user.onboardingGoal ?? null;
            updatedToken.onboardingCareer = userData.user.onboardingCareer ?? null;
            updatedToken.lastOnboardingCheck = 0;
          } else if (userResponse.status === 401 || userResponse.status === 404) {
            return { ...tokenWithRefresh, error: "RefreshAccessTokenError" };
          }
        } catch (error) {
          // Ignora erro no update manual
        }
        return updatedToken;
      }

      if (tokenWithRefresh.accessTokenExpires && Date.now() < tokenWithRefresh.accessTokenExpires - 60 * 1000) {
        const isOnboardingCompleted = tokenWithRefresh.onboardingCompleted ?? false;
        const checkInterval = isOnboardingCompleted ? 60000 : 10000;
        const shouldUpdateOnboarding = !tokenWithRefresh.lastOnboardingCheck || Date.now() - tokenWithRefresh.lastOnboardingCheck > checkInterval;

        if (shouldUpdateOnboarding) {
          try {
            const userResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333"}/me`,
              {
                headers: {
                  Authorization: `Bearer ${tokenWithRefresh.accessToken}`,
                },
                next: { revalidate: 30 },
              }
            );

            if (userResponse.ok) {
              const userData = await userResponse.json();
              return {
                ...tokenWithRefresh,
                onboardingCompleted: userData.user.onboardingCompleted ?? false,
                onboardingGoal: userData.user.onboardingGoal ?? null,
                onboardingCareer: userData.user.onboardingCareer ?? null,
                lastOnboardingCheck: Date.now(),
              };
            } else if (userResponse.status === 401 || userResponse.status === 404) {
              return { ...tokenWithRefresh, error: "RefreshAccessTokenError" };
            }
          } catch (error) {
            // Ignora erro no check periódico
          }
        }
        return tokenWithRefresh;
      }

      const refreshed = await refreshAccessToken(tokenWithRefresh);
      return refreshed;
    },

    async session({ session, token }: any) {
      const t = token as TokenWithRefresh;

      if (t.error === "RefreshAccessTokenError") {
        return {
          ...session,
          error: "RefreshAccessTokenError",
          accessToken: undefined,
          user: {
            id: undefined,
          }
        };
      }

      if (session.user) {
        session.user.id = t.id;
        session.user.name = t.name;
        session.user.email = t.email;
        session.user.image = t.picture;
        (session.user as any).onboardingCompleted = t.onboardingCompleted;
        (session.user as any).onboardingGoal = t.onboardingGoal;
        (session.user as any).onboardingCareer = t.onboardingCareer;
      }
      (session as any).accessToken = t.accessToken;
      (session as any).onboardingCompleted = t.onboardingCompleted ?? false;
      (session as any).onboardingGoal = t.onboardingGoal;
      (session as any).onboardingCareer = t.onboardingCareer;

      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
});