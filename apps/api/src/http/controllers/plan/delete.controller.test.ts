import { describe, expect, it, vi, beforeEach } from 'vitest'
import { FastifyReply, FastifyRequest } from 'fastify'
import { deletePlan } from './delete.controller'

vi.mock('../../../lib/prisma', () => ({
  prisma: {
    plan: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

import { prisma } from '../../../lib/prisma'

function makeReply() {
  const reply = {
    statusCode: 200,
    payload: undefined as unknown,
    status(code: number) {
      this.statusCode = code
      return this
    },
    send(body?: unknown) {
      this.payload = body
      return this
    },
  }
  return reply as unknown as FastifyReply & {
    statusCode: number
    payload: unknown
  }
}

function makeRequest(id: string) {
  return {
    params: { id },
    log: { error: vi.fn() },
  } as unknown as FastifyRequest<{ Params: { id: string } }>
}

describe('deletePlan', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejeita exclusão do plano FREE', async () => {
    vi.mocked(prisma.plan.findUnique).mockResolvedValue({
      id: 'plan-free',
      slug: 'FREE',
      _count: { users: 0, payments: 0, subscriptions: 0 },
    } as never)

    const reply = makeReply()
    await deletePlan(makeRequest('plan-free'), reply)

    expect(reply.statusCode).toBe(400)
    expect(reply.payload).toEqual({
      message: 'O plano gratuito (FREE) não pode ser excluído',
    })
    expect(prisma.plan.delete).not.toHaveBeenCalled()
  })

  it('rejeita exclusão com vínculos', async () => {
    vi.mocked(prisma.plan.findUnique).mockResolvedValue({
      id: 'plan-pro',
      slug: 'PRO',
      _count: { users: 2, payments: 0, subscriptions: 0 },
    } as never)

    const reply = makeReply()
    await deletePlan(makeRequest('plan-pro'), reply)

    expect(reply.statusCode).toBe(400)
    expect(prisma.plan.delete).not.toHaveBeenCalled()
  })

  it('exclui plano sem vínculos', async () => {
    vi.mocked(prisma.plan.findUnique).mockResolvedValue({
      id: 'plan-pro',
      slug: 'PRO',
      _count: { users: 0, payments: 0, subscriptions: 0 },
    } as never)
    vi.mocked(prisma.plan.delete).mockResolvedValue({} as never)

    const reply = makeReply()
    await deletePlan(makeRequest('plan-pro'), reply)

    expect(reply.statusCode).toBe(204)
    expect(prisma.plan.delete).toHaveBeenCalledWith({ where: { id: 'plan-pro' } })
  })
})
