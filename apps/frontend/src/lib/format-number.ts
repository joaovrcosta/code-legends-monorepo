/**
 * Formata número em formato compacto (ex: 1,7k) para exibição.
 * Valores abaixo de 1000 são exibidos inteiros; a partir de 1000 usa "k".
 */
export function formatNumberCompact(value: number): string {
  if (value < 1000) return value.toLocaleString('pt-BR')
  const k = value / 1000
  const fixed = k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)
  return fixed.replace('.', ',') + 'k'
}

/**
 * Formata número por extenso (ex: 1.700) para tooltip/valor exato.
 */
export function formatNumberFull(value: number): string {
  return value.toLocaleString('pt-BR')
}

export type CompactNumberDisplay = {
  compact: string
  full: string
}

/**
 * Retorna tanto a versão compacta quanto a completa para uso com tooltip.
 */
export function getCompactNumberDisplay(value: number): CompactNumberDisplay {
  return {
    compact: formatNumberCompact(value),
    full: formatNumberFull(value),
  }
}
