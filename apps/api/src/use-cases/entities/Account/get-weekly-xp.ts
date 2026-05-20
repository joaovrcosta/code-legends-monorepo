import type { IUserXpHistoryRepository } from '../../../repositories/user-xp-history-repository'
import { getRollingWeekBounds } from '../../../utils/rolling-week-bounds'

function startOfDayUTC(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

function addDaysUTC(d: Date, days: number) {
  const next = new Date(d.getTime())
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

export type GetWeeklyXpResponse = {
  from: string
  toExclusive: string
  days: { date: string; xp: number }[]
  totalXp: number
}

export class GetWeeklyXpUseCase {
  constructor(private userXpHistoryRepository: IUserXpHistoryRepository) {}

  async execute(userId: string): Promise<GetWeeklyXpResponse> {
    const { from, toExclusive } = getRollingWeekBounds()

    const rows = await this.userXpHistoryRepository.findBetweenDates(
      userId,
      from,
      toExclusive,
    )

    const byDay = new Map<string, number>()
    for (const row of rows) {
      const day = startOfDayUTC(row.createdAt).toISOString().slice(0, 10) // YYYY-MM-DD
      byDay.set(day, (byDay.get(day) ?? 0) + row.xpAmount)
    }

    const days: { date: string; xp: number }[] = []
    for (let i = 0; i < 7; i++) {
      const date = addDaysUTC(from, i).toISOString().slice(0, 10)
      days.push({ date, xp: byDay.get(date) ?? 0 })
    }

    return {
      from: from.toISOString(),
      toExclusive: toExclusive.toISOString(),
      days,
      totalXp: days.reduce((acc, d) => acc + d.xp, 0),
    }
  }
}

