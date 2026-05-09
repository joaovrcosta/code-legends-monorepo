"use server";

import { auth } from "@/auth/authSetup";

/**
 * Lê onboardingCompleted do JWT via auth() — mesma base que o middleware.
 */
export async function getAuthOnboardingFromSession(): Promise<{
  onboardingCompleted: boolean;
}> {
  const session = await auth();
  if (!session) {
    return { onboardingCompleted: false };
  }

  const s = session as {
    onboardingCompleted?: boolean;
    user?: { onboardingCompleted?: boolean };
  };

  const onboardingCompleted =
    s.onboardingCompleted ?? s.user?.onboardingCompleted ?? false;

  return { onboardingCompleted: Boolean(onboardingCompleted) };
}
