import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeGetUpgradeQuoteUseCase } from '../../../utils/factories/make-payment-provider-use-cases'
import { checkoutRejectionMessage } from '../../../use-cases/entities/Payment/checkout-rejection-messages'

const querySchema = z.object({
  plan: z.string().min(1),
})

export async function getUpgradeQuote(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parsed = querySchema.safeParse(request.query)
  if (!parsed.success) {
    return reply.status(400).send({ message: 'Invalid query', issues: parsed.error.format() })
  }

  const userId = (request.user as { id: string })?.id
  if (!userId) {
    return reply.status(401).send({ message: 'Unauthorized' })
  }

  const useCase = makeGetUpgradeQuoteUseCase()
  const result = await useCase.execute({
    userId,
    planSlug: parsed.data.plan.toUpperCase(),
  })

  if (!result.ok) {
    return reply.status(400).send({
      message: checkoutRejectionMessage(result.reason),
      reason: result.reason,
    })
  }

  return reply.status(200).send(result)
}
