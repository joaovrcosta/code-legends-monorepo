/** Fontes de XP que contam para o total ganho em um módulo. */
export const MODULE_XP_SOURCES = [
  'lesson_completed',
  'challenge_first_correct',
] as const

export type ModuleXpSource = (typeof MODULE_XP_SOURCES)[number]

export type SkillXpHistoryRow = {
  skillId: string
  xpAmount: number
  source: string
  sourceId: number | null
}

export function aggregateModuleXpBySkill(
  historyRows: SkillXpHistoryRow[],
  moduleLessonIds: number[],
): {
  xpGainedInModule: number
  xpGainedInModuleBySkill: { skillId: string; xp: number }[]
} {
  const lessonIdSet = new Set(moduleLessonIds)
  const allowedSources = new Set<string>(MODULE_XP_SOURCES)
  const bySkill = new Map<string, number>()

  for (const row of historyRows) {
    if (!allowedSources.has(row.source)) continue
    if (row.sourceId == null || !lessonIdSet.has(row.sourceId)) continue
    bySkill.set(row.skillId, (bySkill.get(row.skillId) ?? 0) + row.xpAmount)
  }

  const xpGainedInModuleBySkill = [...bySkill.entries()]
    .filter(([, xp]) => xp > 0)
    .map(([skillId, xp]) => ({ skillId, xp }))

  const xpGainedInModule = xpGainedInModuleBySkill.reduce(
    (sum, row) => sum + row.xp,
    0,
  )

  return { xpGainedInModule, xpGainedInModuleBySkill }
}
