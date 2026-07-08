import { PlanAccessService } from '../../domain/plan-access/plan-access.service'

let planAccessService: PlanAccessService | null = null

export function makePlanAccessService(): PlanAccessService {
  if (!planAccessService) {
    planAccessService = new PlanAccessService()
  }
  return planAccessService
}
