/** Etapas do fluxo: boas-vindas → meta → área → curso */
export const ONBOARDING_TOTAL_STEPS = 4

export const ONBOARDING_STEP = {
  welcome: 1,
  goal: 2,
  career: 3,
  course: 4,
} as const

/** Largura da barra (%) por etapa; alinhado a `duration-500` no top bar. */
export function onboardingProgressPercent(
  step: number,
  totalSteps: number = ONBOARDING_TOTAL_STEPS
): number {
  return Math.min(100, Math.round((step / totalSteps) * 100))
}

/** Espera após animar a barra antes do push (ms); ≥ duração Tailwind `duration-500`. */
export const ONBOARDING_BAR_TRANSITION_MS = 550
