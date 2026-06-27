export type SkillWeightRow = { skillId: string; weight: number }

/** Distribui `xpAmount` por peso (0–100). Ignora linhas que arredondam para 0. */
export function distributeXpToSkills(
  xpAmount: number,
  skillRows: SkillWeightRow[],
): Array<{ skillId: string; xpAmount: number }> {
  if (skillRows.length === 0 || xpAmount <= 0) return []
  return skillRows
    .map((row) => ({
      skillId: row.skillId,
      xpAmount: Math.round(xpAmount * (row.weight / 100)),
    }))
    .filter((entry) => entry.xpAmount > 0)
}

/**
 * XP de lição/desafio é aditivo: skills do curso + skills da aula.
 * Retorna o total distribuído (pode ser menor que `xpAmount` por arredondamento).
 */
export function distributeAdditiveSkillXp(
  xpAmount: number,
  courseSkills: SkillWeightRow[],
  lessonSkills: SkillWeightRow[],
): Array<{ skillId: string; xpAmount: number }> {
  return [
    ...distributeXpToSkills(xpAmount, courseSkills),
    ...distributeXpToSkills(xpAmount, lessonSkills),
  ]
}

export function sumXpEntries(
  entries: Array<{ xpAmount: number }>,
): number {
  return entries.reduce((acc, entry) => acc + entry.xpAmount, 0)
}

/** XP remanescente quando arredondamentos não somam o valor base da lição/desafio. */
export function xpRemainderAfterDistribution(
  xpAmount: number,
  entries: Array<{ xpAmount: number }>,
): number {
  return Math.max(0, xpAmount - sumXpEntries(entries))
}
