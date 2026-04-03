/**
 * Converte o texto do input de peso (0–100%) em inteiro clampado.
 * Remove zeros à esquerda antes dos dígitos (ex.: "050" → 50) para não irritar ao digitar.
 */
export function parseSkillWeightInput(raw: string): number {
  const t = raw.trim()
  if (t === '') return 0
  const normalized = t.replace(/^0+(?=\d)/, '')
  const n = parseInt(normalized, 10)
  if (Number.isNaN(n)) return 0
  return Math.min(100, Math.max(0, n))
}
