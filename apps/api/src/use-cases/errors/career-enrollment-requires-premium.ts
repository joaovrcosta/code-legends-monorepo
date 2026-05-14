export type CareerEnrollmentBlockedPlan = 'FREE' | 'PRO'

export class CareerEnrollmentRequiresPremiumError extends Error {
  readonly currentPlan: CareerEnrollmentBlockedPlan

  constructor(currentPlan: CareerEnrollmentBlockedPlan) {
    const msg =
      currentPlan === 'PRO'
        ? 'As carreiras estão disponíveis no plano Premium. Faça upgrade para se inscrever.'
        : 'As carreiras estão disponíveis no plano Premium. Assine para se inscrever.'
    super(msg)
    this.name = 'CareerEnrollmentRequiresPremiumError'
    this.currentPlan = currentPlan
  }
}
