import { FastifyReply, FastifyRequest } from 'fastify'
import { PlanFeatures } from '@code-legends/plans'
import { makePlanAccessService } from '../../../utils/factories/make-plan-access-service'

/**
 * UX only — o frontend usa capabilities para CTAs/badges/paywalls visuais.
 * Rotas sensíveis devem re-validar via PlanAccessPort no backend.
 */
export async function getCapabilities(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const planAccess = makePlanAccessService()
    const [capabilities, activePlan] = await Promise.all([
      planAccess.getCapabilities(request.user.id),
      planAccess.getActivePlan(request.user.id),
    ])

    const hasPaidPlan =
      capabilities[PlanFeatures.CATALOG_PAID] ||
      (activePlan?.amountCents ?? 0) > 0

    return reply.status(200).send({
      capabilities,
      activePlan: activePlan
        ? {
            id: activePlan.id,
            slug: activePlan.slug,
            name: activePlan.name,
            imageUrl: activePlan.imageUrl,
            colorHex: activePlan.colorHex,
            amountCents: activePlan.amountCents,
          }
        : null,
      hasPaidPlan,
    })
  } catch (error) {
    console.error('getCapabilities failed:', error)
    return reply.status(500).send({ message: 'Internal server error' })
  }
}
