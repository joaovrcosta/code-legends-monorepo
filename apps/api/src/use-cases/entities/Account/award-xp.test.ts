import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Prisma } from '@prisma/client'

type UserRow = {
  id: string
  totalXp: number
  level: number
  xpToNextLevel: number
}

type SkillXpRow = {
  userId: string
  skillId: string
  xp: number
}

type UserXpEventRow = {
  userId: string
  reasonId: string
  source: string
  sourceId: number | null
}

function makeFakePrisma() {
  const state = {
    users: new Map<string, UserRow>(),
    skillXp: new Map<string, SkillXpRow>(), // key: `${userId}:${skillId}`
    events: new Set<string>(), // key: `${userId}:${reasonId}`
  }

  const tx = {
    user: {
      findUniqueOrThrow: vi.fn(async ({ where, select }: any) => {
        const user = state.users.get(where.id)
        if (!user) throw new Error('User not found')
        if (!select) return user
        const out: any = {}
        for (const k of Object.keys(select)) out[k] = (user as any)[k]
        return out
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const user = state.users.get(where.id)
        if (!user) throw new Error('User not found')
        const next = { ...user, ...data }
        state.users.set(where.id, next)
        return next
      }),
    },
    userXpEvent: {
      create: vi.fn(async ({ data }: { data: UserXpEventRow }) => {
        const key = `${data.userId}:${data.reasonId}`
        if (state.events.has(key)) {
          throw new Prisma.PrismaClientKnownRequestError(
            'Unique constraint failed',
            { code: 'P2002', clientVersion: '0.0.0' },
          )
        }
        state.events.add(key)
        return data
      }),
    },
    userSkillXp: {
      upsert: vi.fn(async ({ where, update, create }: any) => {
        const key = `${where.userId_skillId.userId}:${where.userId_skillId.skillId}`
        const existing = state.skillXp.get(key)
        if (existing) {
          const inc = update.xp?.increment ?? 0
          const next = { ...existing, xp: existing.xp + inc }
          state.skillXp.set(key, next)
          return next
        }
        state.skillXp.set(key, create)
        return create
      }),
      aggregate: vi.fn(async ({ where, _sum }: any) => {
        let sum = 0
        for (const row of state.skillXp.values()) {
          if (row.userId === where.userId) sum += row.xp
        }
        return { _sum: { xp: _sum?.xp ? sum : null } }
      }),
    },
    userSkillXpHistory: {
      create: vi.fn(async () => ({})),
    },
    userXpHistory: {
      create: vi.fn(async () => ({})),
    },
  }

  const prisma = {
    user: tx.user,
    userSkillXp: tx.userSkillXp,
    $transaction: vi.fn(async (fn: any) => await fn(tx)),
  }

  return { prisma, tx, state }
}

const fake = vi.hoisted(() => makeFakePrisma())

vi.mock('../../../lib/prisma', () => ({ prisma: fake.prisma }))

import { AwardXpUseCase } from './award-xp'

describe('AwardXpUseCase', () => {
  const useCase = new AwardXpUseCase()

  beforeEach(() => {
    fake.state.users.clear()
    fake.state.skillXp.clear()
    fake.state.events.clear()

    fake.state.users.set('u1', {
      id: 'u1',
      totalXp: 0,
      level: 1,
      xpToNextLevel: 100,
    })
  })

  it('deve somar skills e atualizar cache do usuário', async () => {
    const res = await useCase.execute({
      userId: 'u1',
      reasonId: 'lesson_completed:10',
      source: 'lesson_completed',
      sourceId: 10,
      description: 'ok',
      entries: [
        { skillId: 's1', xpAmount: 100 },
        { skillId: 's2', xpAmount: 150 },
      ],
    })

    expect(res.applied).toBe(true)
    expect(res.xpGained).toBe(250)
    expect(res.totalXp).toBe(250)
    expect(res.level).toBe(2) // totalXp=250 => level 2 na progressão atual

    const user = fake.state.users.get('u1')!
    expect(user.totalXp).toBe(250)
    expect(user.level).toBe(2)
    expect(user.xpToNextLevel).toBe(200) // xpForLevel(3)=450 => 450-250=200
  })

  it('não deve duplicar XP quando reasonId já foi aplicado (idempotência)', async () => {
    const first = await useCase.execute({
      userId: 'u1',
      reasonId: 'lesson_completed:10',
      source: 'lesson_completed',
      sourceId: 10,
      description: 'ok',
      entries: [{ skillId: 's1', xpAmount: 50 }],
    })
    const second = await useCase.execute({
      userId: 'u1',
      reasonId: 'lesson_completed:10',
      source: 'lesson_completed',
      sourceId: 10,
      description: 'ok',
      entries: [{ skillId: 's1', xpAmount: 50 }],
    })

    expect(first.applied).toBe(true)
    expect(second.applied).toBe(false)
    expect(second.xpGained).toBe(0)

    const user = fake.state.users.get('u1')!
    expect(user.totalXp).toBe(50)

    const skillKey = 'u1:s1'
    expect(fake.state.skillXp.get(skillKey)?.xp).toBe(50)
  })
})

