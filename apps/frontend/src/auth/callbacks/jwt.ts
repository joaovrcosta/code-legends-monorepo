import type { TokenWithRefresh } from "../types";

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

export async function jwtCallback({ token, user, account, trigger, session }: any) {
    // Se for login inicial
    if (user) {
        // Se for login Google
        if (account?.provider === "google") {
            try {
                // Autenticar/criar usuário na sua API
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/users/auth/google`,
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

                if (!response.ok) {
                    return null;
                }

                const data = await response.json();
                const apiToken = data.token;
                const refreshToken = data.refreshToken;

                if (!apiToken) {
                    return null;
                }

                // Buscar dados completos do usuário
                const userResponse = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333"}/me`,
                    {
                        headers: {
                            Authorization: `Bearer ${apiToken}`,
                        },
                    }
                );

                if (!userResponse.ok) {
                    return null;
                }

                const userData = await userResponse.json();

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
                    lastOnboardingCheck: Date.now(),
                };
            } catch (error) {
                console.error("Erro ao autenticar com Google:", error);
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
}
