import { describe, expect, it, vi, beforeEach } from 'vitest'
import { FastifyReply, FastifyRequest } from 'fastify'
import { updatePlan } from './update.controller'

vi.mock('../../../lib/prisma', () => ({
  prisma: {
    plan: {
      findUnique: vi.fn(),
      update: vi.fn(),
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

describe('updatePlan', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejeita PATCH de features no plano FREE', async () => {
    vi.mocked(prisma.plan.findUnique).mockResolvedValue({
      id: 'plan-free',
      slug: 'FREE',
    } as never)

    const reply = makeReply()
    await updatePlan(
      {
        params: { id: 'plan-free' },
        body: { features: ['catalog.paid'] },
      } as FastifyRequest<{ Params: { id: string } }>,
      reply,
    )

    expect(reply.statusCode).toBe(400)
    expect(reply.payload).toEqual({
      message:
        'As funcionalidades do plano FREE são fixas no sistema e não podem ser editadas',
    })
    expect(prisma.plan.update).not.toHaveBeenCalled()
  })

  it('permite PATCH de nome no plano FREE', async () => {
    vi.mocked(prisma.plan.findUnique).mockResolvedValue({
      id: 'plan-free',
      slug: 'FREE',
    } as never)
    vi.mocked(prisma.plan.update).mockResolvedValue({
      id: 'plan-free',
      slug: 'FREE',
      name: 'Novo nome',
    } as never)

    const reply = makeReply()
    await updatePlan(
      {
        params: { id: 'plan-free' },
        body: { name: 'Novo nome' },
      } as FastifyRequest<{ Params: { id: string } }>,
      reply,
    )

    expect(reply.statusCode).toBe(200)
    expect(prisma.plan.update).toHaveBeenCalled()
  })
})
