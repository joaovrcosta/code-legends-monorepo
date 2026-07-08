import { describe, expect, it, vi, beforeEach } from 'vitest'
import { FastifyReply, FastifyRequest } from 'fastify'
import { verifyJobsSecret } from '../../middlewares/verify-jobs-secret'
import { expireSubscriptions } from './expire-subscriptions.controller'

vi.mock('../../../use-cases/jobs/expire-subscriptions', () => ({
  ExpireSubscriptionsUseCase: vi.fn().mockImplementation(() => ({
    execute: vi.fn().mockResolvedValue({ expiredCount: 2 }),
  })),
}))

vi.mock('../../../env/index', () => ({
  env: { JOBS_SECRET: 'test-jobs-secret' },
}))

function makeReply() {
  const reply = {
    statusCode: 200,
    payload: undefined as unknown,
    status(code: number) {
      this.statusCode = code
      return this
    },
    send(body: unknown) {
      this.payload = body
      return this
    },
  }
  return reply as unknown as FastifyReply & {
    statusCode: number
    payload: unknown
  }
}

describe('verifyJobsSecret', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 without Authorization header', async () => {
    const reply = makeReply()
    await verifyJobsSecret({ headers: {} } as FastifyRequest, reply)
    expect(reply.statusCode).toBe(401)
  })

  it('returns 401 with invalid Bearer token', async () => {
    const reply = makeReply()
    await verifyJobsSecret(
      { headers: { authorization: 'Bearer wrong' } } as FastifyRequest,
      reply,
    )
    expect(reply.statusCode).toBe(401)
  })

  it('allows valid Bearer token', async () => {
    const reply = makeReply()
    const result = await verifyJobsSecret(
      {
        headers: { authorization: 'Bearer test-jobs-secret' },
      } as FastifyRequest,
      reply,
    )
    expect(result).toBeUndefined()
    expect(reply.statusCode).toBe(200)
  })
})

describe('expireSubscriptions controller', () => {
  it('returns expired count', async () => {
    const reply = makeReply()
    await expireSubscriptions({} as FastifyRequest, reply)
    expect(reply.statusCode).toBe(200)
    expect(reply.payload).toEqual({ expiredCount: 2 })
  })
})
