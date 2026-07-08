import { FastifyReply, FastifyRequest } from 'fastify'
import { ExpireSubscriptionsUseCase } from '../../../use-cases/jobs/expire-subscriptions'

export async function expireSubscriptions(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const useCase = new ExpireSubscriptionsUseCase()
    const result = await useCase.execute()
    return reply.status(200).send(result)
  } catch (error) {
    console.error('expire-subscriptions job failed:', error)
    return reply.status(500).send({ message: 'Internal server error' })
  }
}
