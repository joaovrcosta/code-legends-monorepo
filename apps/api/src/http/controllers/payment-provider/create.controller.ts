import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeCreatePaymentProviderUseCase } from '../../../utils/factories/make-payment-provider-use-cases'

export async function createPaymentProvider(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const bodySchema = z.object({
    name: z.string().min(2).max(80),
    supportedMethods: z
      .array(z.enum(['CARD', 'PIX', 'BOLETO']))
      .min(1)
      .optional(),
    helpText: z.string().max(1000).nullable().optional(),
  })

  try {
    const body = bodySchema.parse(request.body)
    const useCase = makeCreatePaymentProviderUseCase()
    const { provider } = await useCase.execute({
      ...body,
      actorId: request.user.id,
    })
    return reply.status(201).send({ provider })
  } catch (e) {
    if (e instanceof Error) {
      return reply.status(400).send({ message: e.message })
    }
    throw e
  }
}
