import type { TokenWithRefresh } from "../types";
import { getApiBaseUrl } from "@/lib/api-base-url";

function extractRefreshTokenFromSetCookie(setCookieHeader: string | null) {
    if (!setCookieHeader) {
        return null;
    }

    const match = setCookieHeader.match(/refreshToken=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
}

async function refreshAccessToken(token: TokenWithRefresh): Promise<TokenWithRefresh> {
    try {
        if (!token.refreshToken) {
            throw new Error("MissingRefreshToken");
        }

        const response = await fetch(
            `${getApiBaseUrl()}/token/refresh`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Cookie": `refreshToken=${encodeURIComponent(token.refreshToken)}`,
                },
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
        let plan: "FREE" | "PRO" | "PREMIUM" = token.plan ?? "FREE";

        try {
            const userResponse = await fetch(
                `${getApiBaseUrl()}/me`,
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
                plan = userData.user.plan ?? "FREE";
            } else if (userResponse.status === 401 || userResponse.status === 404) {
                throw new Error("UserNotFound");
            }
        } catch (err) {
            if ((err as Error).message === "UserNotFound") {
                throw err;
            }
        }

        return {
            ...token,
            accessToken: newAccessToken,
            refreshToken: extractRefreshTokenFromSetCookie(response.headers.get("set-cookie")) ?? token.refreshToken,
            accessTokenExpires: Date.now() + 10 * 60 * 1000,
            ...onboardingData,
            plan,
            error: undefined,
        };
    } catch {
        return {
            ...token,
            error: "RefreshAccessTokenError",
        };
    }
}

interface JwtCallbackParams {
  token: TokenWithRefresh;
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    onboardingCompleted?: boolean;
    onboardingGoal?: string | null;
    onboardingCareer?: string | null;
    plan?: "FREE" | "PRO" | "PREMIUM";
  };
  account?: {
    provider?: string;
    providerAccountId?: string;
  } | null;
  trigger?: "update" | "signIn" | "signUp";
  session?: {
    user?: {
      id?: string;
      name?: string;
      email?: string;
      image?: string;
    };
  };
}

export async function jwtCallback({ token, user, account, trigger, session }: JwtCallbackParams) {
    // Se for login inicial
    if (user) {
        // Se for login Google
        if (account?.provider === "google") {
            try {
                const apiBase = getApiBaseUrl();
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/61681d87-9b85-44a2-a3f8-024fd9404ca8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'7492d7'},body:JSON.stringify({sessionId:'7492d7',location:'jwt.ts:google:start',message:'Google OAuth jwt callback start',data:{apiBase,hasEmail:!!user.email,hasGoogleId:!!account.providerAccountId},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
                // #endregion
                // Autenticar/criar usuário na sua API
                const response = await fetch(
                    `${apiBase}/users/auth/google`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            email: user.email!,
                            name: user.name!,
                            picture: user.image,
                            googleId: account.providerAccountId,
                        }),
                    }
                );

                const setCookieRaw = response.headers.get("set-cookie");
                const setCookieList = typeof (response.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie === "function"
                    ? (response.headers as Headers & { getSetCookie: () => string[] }).getSetCookie()
                    : setCookieRaw ? [setCookieRaw] : [];
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/61681d87-9b85-44a2-a3f8-024fd9404ca8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'7492d7'},body:JSON.stringify({sessionId:'7492d7',location:'jwt.ts:google:api-response',message:'Google API auth response',data:{status:response.status,ok:response.ok,setCookieCount:setCookieList.length,hasSetCookieRaw:!!setCookieRaw},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
                // #endregion
                if (!response.ok) {
                    // Se for erro 403 (usuário não encontrado e criação bloqueada)
                    if (response.status === 403) {
                        // Consome a resposta para evitar warning
                        await response.json().catch(() => ({}));
                        // Lança erro que o NextAuth reconhece
                        const authError = new Error("OAuthAccountNotLinked") as Error & { type?: string };
                        authError.type = "OAuthAccountNotLinked";
                        throw authError;
                    }
                    return null;
                }

                const data = await response.json();
                const apiToken = data.token;
                const refreshToken = extractRefreshTokenFromSetCookie(response.headers.get("set-cookie"));
                const refreshFromList = setCookieList.map((h) => extractRefreshTokenFromSetCookie(h)).find(Boolean) ?? null;
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/61681d87-9b85-44a2-a3f8-024fd9404ca8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'7492d7'},body:JSON.stringify({sessionId:'7492d7',location:'jwt.ts:google:tokens',message:'Google token extraction',data:{hasApiToken:!!apiToken,hasRefreshToken:!!refreshToken,hasRefreshFromList:!!refreshFromList},timestamp:Date.now(),hypothesisId:'C'})}).catch(()=>{});
                // #endregion
                if (!apiToken || !refreshToken) {
                    return null;
                }

                // Buscar dados completos do usuário
                const userResponse = await fetch(
                    `${apiBase}/me`,
                    {
                        headers: {
                            Authorization: `Bearer ${apiToken}`,
                        },
                    }
                );

                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/61681d87-9b85-44a2-a3f8-024fd9404ca8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'7492d7'},body:JSON.stringify({sessionId:'7492d7',location:'jwt.ts:google:me',message:'Google /me response',data:{meStatus:userResponse.status,meOk:userResponse.ok},timestamp:Date.now(),hypothesisId:'D'})}).catch(()=>{});
                // #endregion
                if (!userResponse.ok) {
                    return null;
                }

                const userData = await userResponse.json();

                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/61681d87-9b85-44a2-a3f8-024fd9404ca8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'7492d7'},body:JSON.stringify({sessionId:'7492d7',location:'jwt.ts:google:success',message:'Google jwt success',data:{hasUserId:!!userData?.user?.id},timestamp:Date.now(),hypothesisId:'E'})}).catch(()=>{});
                // #endregion
                return {
                    ...token,
                    id: userData.user.id,
                    name: userData.user.name,
                    email: userData.user.email,
                    picture: userData.user.avatar,
                    accessToken: apiToken,
                    refreshToken: refreshToken,
                    accessTokenExpires: Date.now() + 10 * 60 * 1000,
                    onboardingCompleted: data.onboardingCompleted ?? false,
                    onboardingGoal: data.onboardingGoal ?? null,
                    onboardingCareer: data.onboardingCareer ?? null,
                    plan: userData.user.plan ?? "FREE",
                    lastOnboardingCheck: Date.now(),
                };
            } catch (error) {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/61681d87-9b85-44a2-a3f8-024fd9404ca8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'7492d7'},body:JSON.stringify({sessionId:'7492d7',location:'jwt.ts:google:catch',message:'Google jwt exception',data:{errorName:error instanceof Error?error.name:'unknown',errorMessage:error instanceof Error?error.message.slice(0,120):'unknown'},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
                // #endregion
                console.error("Erro ao autenticar com Google:", error);
                // Se for erro de usuário não encontrado, lança erro que o NextAuth pode capturar
                if (error instanceof Error && error.message.includes("não encontrada")) {
                    // Lança um erro que o NextAuth reconhece como OAuthAccountNotLinked
                    const authError = new Error("OAuthAccountNotLinked") as Error & { type?: string };
                    authError.type = "OAuthAccountNotLinked";
                    throw authError;
                }
                return null;
            }
        }

        // Se for login com Credentials
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
            plan: user.plan ?? "FREE",
            lastOnboardingCheck: Date.now(),
        };
    }

    const tokenWithRefresh = token as TokenWithRefresh;

    if (trigger === "update") {
        const updatedToken = {
            ...tokenWithRefresh,
            ...(session?.user ?? {}),
        };

        try {
            const userResponse = await fetch(
                `${getApiBaseUrl()}/me`,
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
                updatedToken.plan = userData.user.plan ?? "FREE";
                updatedToken.lastOnboardingCheck = 0;
            } else if (userResponse.status === 401 || userResponse.status === 404) {
                return { ...tokenWithRefresh, error: "RefreshAccessTokenError" };
            }
        } catch {
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
                    `${getApiBaseUrl()}/me`,
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
                        plan: userData.user.plan ?? "FREE",
                        lastOnboardingCheck: Date.now(),
                    };
                } else if (userResponse.status === 401 || userResponse.status === 404) {
                    return { ...tokenWithRefresh, error: "RefreshAccessTokenError" };
                }
            } catch {
                // Ignora erro no check periódico
            }
        }
        return tokenWithRefresh;
    }

    const refreshed = await refreshAccessToken(tokenWithRefresh);
    return refreshed;
}
