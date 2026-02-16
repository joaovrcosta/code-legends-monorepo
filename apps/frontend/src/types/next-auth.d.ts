declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
    };
    accessToken?: string;
    error?: string;
    onboardingCompleted?: boolean;
    onboardingGoal?: string | null;
    onboardingCareer?: string | null;
  }

  interface User {
    id: string;
    name: string;
    email: string;
    image?: string;
    accessToken?: string;
    // refreshToken removido - está apenas no cookie httpOnly (não acessível via JavaScript)
    accessTokenExpires?: number;
    onboardingCompleted?: boolean;
    onboardingGoal?: string | null;
    onboardingCareer?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string;
    email: string;
    picture?: string;
    accessToken?: string;
    // refreshToken removido - está apenas no cookie httpOnly (não acessível via JavaScript)
    accessTokenExpires?: number;
    error?: string;
    onboardingCompleted?: boolean;
    onboardingGoal?: string | null;
    onboardingCareer?: string | null;
    lastOnboardingCheck?: number;
  }
}
