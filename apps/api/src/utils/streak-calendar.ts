/** Fuso usado em UserStreak.lastActiveDate (Prisma) e na ofensiva. */
export const STREAK_CALENDAR_TIMEZONE = 'America/Sao_Paulo'

export function formatYYYYMMDDInTZSP(date: Date): string | null {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: STREAK_CALENDAR_TIMEZONE,
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

/** key: YYYY-MM-DD em calendário SP (via meio-dia UTC para evitar DST). */
export function addDaysToISODateKeySP(
  key: string,
  days: number
): string | null {
  const [y, m, d] = key.split('-').map((n) => Number(n))
  if (!y || !m || !d) return null
  const base = new Date(Date.UTC(y, m - 1, d, 12, 0, 0, 0))
  base.setUTCDate(base.getUTCDate() + days)
  return formatYYYYMMDDInTZSP(base)
}

/**
 * Streak ainda "viva": última atividade foi hoje ou ontem (SP).
 * Se passou um dia inteiro de calendário sem atividade, a janela fecha.
 */
export function isStreakCalendarWindowOpen(
  lastActiveDate: string | null,
  now: Date = new Date()
): boolean {
  if (!lastActiveDate) return false
  const todayKey = formatYYYYMMDDInTZSP(now)
  if (!todayKey) return false
  const yesterdayKey = addDaysToISODateKeySP(todayKey, -1)
  if (!yesterdayKey) return false
  return lastActiveDate === todayKey || lastActiveDate === yesterdayKey
}

export function effectiveCurrentStreak(
  currentStreak: number,
  lastActiveDate: string | null,
  now: Date = new Date()
): number {
  if (!isStreakCalendarWindowOpen(lastActiveDate, now)) return 0
  return currentStreak
}
