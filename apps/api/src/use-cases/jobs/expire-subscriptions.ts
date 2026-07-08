import { PlanAccessRepository } from '../../domain/plan-access/plan-access.repository'

export interface ExpireSubscriptionsResult {
  expiredCount: number
}

export class ExpireSubscriptionsUseCase {
  constructor(
    private repository: PlanAccessRepository = new PlanAccessRepository(),
  ) {}

  async execute(now = new Date()): Promise<ExpireSubscriptionsResult> {
    const freePlan = await this.repository.findFreePlan()
    if (!freePlan) {
      throw new Error('FREE plan not found')
    }

    const expired = await this.repository.findExpiredActiveSubscriptions(now)
    for (const subscription of expired) {
      await this.repository.expireSubscriptionAndRevertUser(
        subscription.id,
        subscription.userId,
        freePlan.id,
      )
    }

    return { expiredCount: expired.length }
  }
}
