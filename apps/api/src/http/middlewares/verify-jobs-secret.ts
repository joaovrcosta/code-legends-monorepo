import { timingSafeEqual } from 'crypto'
import { FastifyReply, FastifyRequest } from 'fastify'
import { env } from '../../env/index'

function safeCompareToken(provided: string, expected: string): boolean {
  const providedBuffer = Buffer.from(provided)
  const expectedBuffer = Buffer.from(expected)
  if (providedBuffer.length !== expectedBuffer.length) {
    return false
  }
  return timingSafeEqual(providedBuffer, expectedBuffer)
}

export async function verifyJobsSecret(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const authorization = request.headers.authorization
  if (!authorization?.startsWith('Bearer ')) {
    return reply.status(401).send({ message: 'Unauthorized' })
  }

  const token = authorization.slice('Bearer '.length).trim()
  if (!env.JOBS_SECRET || !safeCompareToken(token, env.JOBS_SECRET)) {
    return reply.status(401).send({ message: 'Unauthorized' })
  }
}
