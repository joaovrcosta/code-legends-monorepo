/**
 * Raio concêntrico em containers aninhados:
 * innerRadius = outerRadius - padding (gap uniforme nos cantos).
 *
 * Painel externo: 20px + inset lg 16px (p-4).
 * Filho interno: 12px no desktop — visível; com p-4 o ideal seria 4px (quase reto).
 */
export const CLASSROOM_CONTENT_OUTER_RADIUS_PX = 20 as const
export const CLASSROOM_CONTENT_INSET_PX = 16 as const

/** Raio visível do container interno (player, header de artigo, etc.) */
export const CLASSROOM_CONTENT_INNER_RADIUS_PX = 12 as const

export function nestedInnerRadiusPx(
  outerRadiusPx: number,
  insetPx: number,
): number {
  return Math.max(0, outerRadiusPx - insetPx)
}

/** Mobile sem inset do painel → 20px; lg → 12px */
export const CLASSROOM_CONTENT_NESTED_RADIUS_CLASS =
  'rounded-[20px] lg:rounded-[12px]' as const

export const CLASSROOM_CONTENT_PANEL_TOP_RADIUS_CLASS =
  'lg:rounded-t-[20px]' as const

export const CLASSROOM_CONTENT_PANEL_FULL_RADIUS_CLASS =
  'rounded-[20px]' as const

export const CLASSROOM_CONTENT_INSET_CLASS = 'lg:px-4 lg:pt-4' as const
