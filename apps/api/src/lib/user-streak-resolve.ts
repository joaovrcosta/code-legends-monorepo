import { prisma } from './prisma'
import { effectiveCurrentStreak } from '../utils/streak-calendar'

export type ResolvedUserStreak = {
  current: number
  best: number
  totalActiveDays: number
  lastActiveDate: string | null
}

/**
 * Aplica a regra de calendário (SP): se não houve atividade hoje nem ontem,
 * o streak atual é 0 e persistimos no banco para alinhar leituras e admin.
 */
export async function resolveUserStreakForApi(
  userId: string,
  now: Date = new Date()
): Promise<ResolvedUserStreak> {
  const row = await prisma.userStreak.findUnique({
    where: { userId },
    select: {
      currentStreak: true,
      bestStreak: true,
      totalActiveDays: true,
      lastActiveDate: true,
    },
  })

  if (!row) {
    return {
      current: 0,
      best: 0,
      totalActiveDays: 0,
      lastActiveDate: null,
    }
  }

  const effective = effectiveCurrentStreak(
    row.currentStreak,
    row.lastActiveDate,
    now
  )

  if (effective === 0 && row.currentStreak !== 0) {
    await prisma.userStreak.update({
      where: { userId },
      data: { currentStreak: 0 },
    })
  }

  return {
    current: effective,
    best: row.bestStreak,
    totalActiveDays: row.totalActiveDays,
    lastActiveDate: row.lastActiveDate,
  }
}
