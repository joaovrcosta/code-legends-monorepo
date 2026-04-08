import type { IUserXpHistoryRepository } from '../../../repositories/user-xp-history-repository'

function startOfDayUTC(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

function addDaysUTC(d: Date, days: number) {
  const next = new Date(d.getTime())
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

export type GetXpHistoryParams = {
  days?: number
  limit?: number
}

export type GetXpHistoryRow = {
  xpAmount: number
  createdAt: string
}

export type GetXpHistoryResponse = {
  from: string
  toExclusive: string
  rows: GetXpHistoryRow[]
}

export class GetXpHistoryUseCase {
  constructor(private userXpHistoryRepository: IUserXpHistoryRepository) {}

  async execute(
    userId: string,
    { days = 30, limit = 200 }: GetXpHistoryParams = {},
  ): Promise<GetXpHistoryResponse> {
    const safeDays = Number.isFinite(days) ? Math.max(1, Math.min(365, days)) : 30
    const safeLimit = Number.isFinite(limit)
      ? Math.max(1, Math.min(1000, limit))
      : 200

    const today = startOfDayUTC(new Date())
    const from = addDaysUTC(today, -(safeDays - 1))
    const toExclusive = addDaysUTC(today, 1)

    const rows = await this.userXpHistoryRepository.findBetweenDates(
      userId,
      from,
      toExclusive,
    )

    const mapped = rows
      .slice(-safeLimit)
      .map((r) => ({ xpAmount: r.xpAmount, createdAt: r.createdAt.toISOString() }))

    return {
      from: from.toISOString(),
      toExclusive: toExclusive.toISOString(),
      rows: mapped,
    }
  }
}

