import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeUpdatePaymentProviderUseCase } from '../../../utils/factories/make-payment-provider-use-cases'
import { PaymentProviderNotFoundError } from '../../../use-cases/errors/payment-provider-not-found'

export async function updatePaymentProvider(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({ id: z.string().cuid() })
  const bodySchema = z.object({
    name: z.string().min(2).max(80).optional(),
    helpText: z.string().max(1000).nullable().optional(),
    sortOrder: z.number().int().min(0).max(9999).optional(),
  })

  try {
    const { id } = paramsSchema.parse(request.params)
    const body = bodySchema.parse(request.body)
    const useCase = makeUpdatePaymentProviderUseCase()
    const { provider } = await useCase.execute({
      id,
      ...body,
      actorId: request.user.id,
    })
    return reply.send({ provider })
  } catch (e) {
    if (e instanceof PaymentProviderNotFoundError) {
      return reply.status(404).send({ message: e.message })
    }
    if (e instanceof Error) {
      return reply.status(400).send({ message: e.message })
    }
    throw e
  }
}
