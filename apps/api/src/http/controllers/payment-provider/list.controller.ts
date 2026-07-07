import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeListPaymentProvidersUseCase } from '../../../utils/factories/make-payment-provider-use-cases'

export async function listPaymentProviders(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const querySchema = z.object({
    includeDeprecated: z
      .enum(['true', 'false'])
      .optional()
      .transform((v) => v === 'true'),
  })
  const { includeDeprecated } = querySchema.parse(request.query)
  const useCase = makeListPaymentProvidersUseCase()
  const providers = await useCase.execute({
    includeDeprecated: includeDeprecated ?? true,
  })
  return reply.send({ providers })
}
