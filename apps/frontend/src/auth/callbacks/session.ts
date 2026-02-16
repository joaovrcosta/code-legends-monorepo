import type { TokenWithRefresh } from "../types";
import type { Session } from "next-auth";

interface ExtendedUser {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    onboardingCompleted?: boolean;
    onboardingGoal?: string | null;
    onboardingCareer?: string | null;
}

interface ExtendedSession extends Omit<Session, "user"> {
    accessToken?: string;
    onboardingCompleted?: boolean;
    onboardingGoal?: string | null;
    onboardingCareer?: string | null;
    user?: ExtendedUser;
    error?: string;
}

interface SessionCallbackParams {
    session: Session;
    token: TokenWithRefresh;
}

export async function sessionCallback({ session, token }: SessionCallbackParams): Promise<ExtendedSession> {
    const t = token as TokenWithRefresh;

    if (t.error === "RefreshAccessTokenError") {
        return {
            ...session,
            error: "RefreshAccessTokenError",
            accessToken: undefined,
            user: {
                id: undefined,
                name: undefined,
                email: undefined,
                image: undefined,
            }
        } as ExtendedSession;
    }

    const extendedSession: ExtendedSession = {
        ...session,
        accessToken: t.accessToken,
        onboardingCompleted: t.onboardingCompleted ?? false,
        onboardingGoal: t.onboardingGoal,
        onboardingCareer: t.onboardingCareer,
    };

    if (session.user) {
        extendedSession.user = {
            ...session.user,
            id: t.id,
            name: t.name,
            email: t.email,
            image: t.picture,
            onboardingCompleted: t.onboardingCompleted,
            onboardingGoal: t.onboardingGoal,
            onboardingCareer: t.onboardingCareer,
        };
    }

    return extendedSession;
}
