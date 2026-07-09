import { PlanAccessRepository } from '../../domain/plan-access/plan-access.repository'

export interface ExpireSubscriptionsResult {
  expiredCount: number
}

export class ExpireSubscriptionsUseCase {
  constructor(
    private repository: PlanAccessRepository = new PlanAccessRepository(),
  ) {}

  async execute(now = new Date()): Promise<ExpireSubscriptionsResult> {
    const expired = await this.repository.findExpiredActiveSubscriptions(now)
    for (const subscription of expired) {
      await this.repository.expireSubscriptionAndRevertUser(
        subscription.id,
        subscription.userId,
      )
    }

    return { expiredCount: expired.length }
  }
}
