import Credentials from "next-auth/providers/credentials";

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
});
