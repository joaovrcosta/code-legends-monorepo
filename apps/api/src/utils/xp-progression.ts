export function calculateXpForLevel(level: number): number {
  if (level <= 1) return 100
  return 100 * level + 25 * (level - 1) * level
}

export function calculateLevel(totalXp: number): number {
  if (totalXp < 100) return 1

  let level = 1
  while (calculateXpForLevel(level + 1) <= totalXp) {
    level++
  }
  return level
}

/**
 * Retorna quanto XP falta para atingir o próximo nível.
 * Ex.: se o usuário já tem XP suficiente, retorna 0.
 */
export function calculateXpRemainingToNextLevel(
  level: number,
  totalXp: number,
): number {
  const xpForNextLevel = calculateXpForLevel(level + 1)
  const xpNeeded = xpForNextLevel - totalXp
  return Math.max(0, xpNeeded)
}

