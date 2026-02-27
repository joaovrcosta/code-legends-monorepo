declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      image?: string
      plan?: 'FREE' | 'PRO' | 'PREMIUM'
      onboardingCompleted?: boolean
      onboardingGoal?: string | null
      onboardingCareer?: string | null
      role?: string
    }
    accessToken?: string
    error?: string
  }

  interface User {
    id: string
    name: string
    email: string
    image?: string
    accessToken?: string
    refreshToken?: string
    accessTokenExpires?: number
    /** Plano do usuário (preenchido no login/refresh). */
    plan?: 'FREE' | 'PRO' | 'PREMIUM'
    onboardingCompleted?: boolean
    onboardingGoal?: string | null
    onboardingCareer?: string | null
    role?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    name: string
    email: string
    picture?: string
    accessToken?: string
    refreshToken?: string
    accessTokenExpires?: number
    error?: string
    /** Plano do usuário (sincronizado com a API no login e no refresh). */
    plan?: 'FREE' | 'PRO' | 'PREMIUM'
    onboardingCompleted?: boolean
    onboardingGoal?: string | null
    onboardingCareer?: string | null
    role?: string
  }
}
