import type { TokenWithRefresh } from "../types";

export async function sessionCallback({ session, token }: any) {
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
}
