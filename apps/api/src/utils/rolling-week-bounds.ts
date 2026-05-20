function startOfDayUTC(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

function addDaysUTC(d: Date, days: number) {
  const next = new Date(d.getTime())
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

/** Janela rolante de 7 dias (hoje − 6 até amanhã UTC), alinhada a GET /me/xp/weekly. */
export function getRollingWeekBounds(referenceDate = new Date()) {
  const today = startOfDayUTC(referenceDate)
  const from = addDaysUTC(today, -6)
  const toExclusive = addDaysUTC(today, 1)
  return { from, toExclusive }
}
