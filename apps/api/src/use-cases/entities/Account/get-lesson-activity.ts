import { prisma } from '../../../lib/prisma'

const SAO_PAULO_TZ = 'America/Sao_Paulo'

function formatYYYYMMDDInTZ(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const y = parts.find((p) => p.type === 'year')?.value
  const m = parts.find((p) => p.type === 'month')?.value
  const d = parts.find((p) => p.type === 'day')?.value
  if (!y || !m || !d) return null
  return `${y}-${m}-${d}`
}

function addDaysUTCNoon(base: Date, days: number) {
  const d = new Date(base.getTime())
  d.setUTCHours(12, 0, 0, 0)
  d.setUTCDate(d.getUTCDate() + days)
  return d
}

export type LessonActivityDay = {
  date: string // YYYY-MM-DD
  count: number
}

export type GetLessonActivityResponse = {
  from: string
  toExclusive: string
  days: LessonActivityDay[]
}

export class GetLessonActivityUseCase {
  async execute(userId: string, params?: { days?: number }): Promise<GetLessonActivityResponse> {
    const days = Math.min(Math.max(params?.days ?? 90, 1), 365)

    // Criamos a janela "em dias" baseada no calendário de São Paulo.
    // Para não errar o filtro por fuso sem libs, buscamos um range um pouco maior e filtramos por `YYYY-MM-DD` em memória.
    const todayNoonUTC = addDaysUTCNoon(new Date(), 0)
    const fromNoonUTC = addDaysUTCNoon(todayNoonUTC, -(days - 1))
    const toExclusiveNoonUTC = addDaysUTCNoon(todayNoonUTC, 1)

    const targetDays: string[] = []
    const targetSet = new Set<string>()
    for (let i = 0; i < days; i++) {
      const d = addDaysUTCNoon(fromNoonUTC, i)
      const key = formatYYYYMMDDInTZ(d, SAO_PAULO_TZ)
      if (key) {
        targetDays.push(key)
        targetSet.add(key)
      }
    }

    const fetchFrom = addDaysUTCNoon(fromNoonUTC, -2)
    const fetchToExclusive = addDaysUTCNoon(toExclusiveNoonUTC, 2)

    const rows = await prisma.userProgress.findMany({
      where: {
        userId,
        isCompleted: true,
        completedAt: {
          not: null,
          gte: fetchFrom,
          lt: fetchToExclusive,
        },
      },
      select: { completedAt: true },
    })

    const byDay = new Map<string, number>()
    for (const row of rows) {
      if (!row.completedAt) continue
      const key = formatYYYYMMDDInTZ(row.completedAt, SAO_PAULO_TZ)
      if (!key || !targetSet.has(key)) continue
      byDay.set(key, (byDay.get(key) ?? 0) + 1)
    }

    return {
      from: fromNoonUTC.toISOString(),
      toExclusive: toExclusiveNoonUTC.toISOString(),
      days: targetDays.map((date) => ({ date, count: byDay.get(date) ?? 0 })),
    }
  }
}

