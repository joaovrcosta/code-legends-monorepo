import { prisma } from '../../../lib/prisma'

export type GetStreakResponse = {
  current: number
  best: number
  totalActiveDays: number
  lastActiveDate: string | null
}

export class GetStreakUseCase {
  async execute(userId: string): Promise<GetStreakResponse> {
    const row = await prisma.userStreak.findUnique({
      where: { userId },
      select: {
        currentStreak: true,
        bestStreak: true,
        totalActiveDays: true,
        lastActiveDate: true,
      },
    })

    return {
      current: row?.currentStreak ?? 0,
      best: row?.bestStreak ?? 0,
      totalActiveDays: row?.totalActiveDays ?? 0,
      lastActiveDate: row?.lastActiveDate ?? null,
    }
  }
}

