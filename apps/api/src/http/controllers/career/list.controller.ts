import { FastifyReply, FastifyRequest } from 'fastify'
import { makeListCareersUseCase } from '../../../utils/factories/make-list-careers-use-case'

export async function list(_: FastifyRequest, reply: FastifyReply) {
  const useCase = makeListCareersUseCase()
  const result = await useCase.execute()
  return reply.status(200).send(result)
}

