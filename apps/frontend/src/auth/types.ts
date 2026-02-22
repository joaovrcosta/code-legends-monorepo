export interface TokenWithRefresh {
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
    plan?: "FREE" | "PRO" | "PREMIUM";
    error?: string;
    [key: string]: unknown;
}
