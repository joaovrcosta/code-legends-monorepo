import Credentials from "next-auth/providers/credentials";
import { getApiBaseUrl } from "@/lib/api-base-url";

function extractRefreshTokenFromSetCookie(setCookieHeader: string | null) {
    if (!setCookieHeader) {
        return null;
    }

    const match = setCookieHeader.match(/refreshToken=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
}

export const credentialsProvider = Credentials({
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
                `${getApiBaseUrl()}/users/auth`,
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
            const refreshToken = extractRefreshTokenFromSetCookie(response.headers.get("set-cookie"));

            if (!token || !refreshToken) {
                return null;
            }

            const userResponse = await fetch(
                `${getApiBaseUrl()}/me`,
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
                plan: userData.user.plan ?? "FREE",
            };
        } catch {
            return null;
        }
    },
});
