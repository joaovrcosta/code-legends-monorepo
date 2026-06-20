import { cn } from '@/lib/utils'

/** Largura reservada no layout com sidebar aberta (painel + inset esquerdo + gap à direita) */
export const CLASSROOM_SIDEBAR_OPEN_WIDTH_CLASS = 'w-[390px]' as const
export const CLASSROOM_SIDEBAR_OPEN_OFFSET_CLASS = 'lg:ml-[390px]' as const
export const CLASSROOM_SIDEBAR_OPEN_LEFT_CLASS = 'lg:left-[390px]' as const

/** Padding do slot: pl-3 à esquerda, pr-6 entre o painel e o conteúdo principal */
export const CLASSROOM_SIDEBAR_OPEN_INSET_CLASS = 'pl-3 pr-6' as const

/** Padding interno do painel (lista de aulas) */
export const CLASSROOM_SIDEBAR_PANEL_INSET_CLASS = 'px-3' as const

/** Evita layout shift quando a scrollbar aparece ao expandir módulos */
export const CLASSROOM_SIDEBAR_SCROLL_CLASS =
  'overflow-x-hidden overflow-y-auto [scrollbar-gutter:stable]' as const

/** Rail flutuante colapsado: pl-4 + 56px pill + 12px gap */
export const CLASSROOM_SIDEBAR_COLLAPSED_INSET_CLASS = 'pl-4' as const
export const CLASSROOM_SIDEBAR_COLLAPSED_RAIL_CLASS = 'w-14' as const
export const CLASSROOM_SIDEBAR_COLLAPSED_SLOT_CLASS = 'w-[84px]' as const
export const CLASSROOM_SIDEBAR_COLLAPSED_OFFSET_CLASS = 'lg:ml-[84px]' as const
export const CLASSROOM_SIDEBAR_COLLAPSED_LEFT_CLASS = 'lg:left-[84px]' as const

const SIDEBAR_TRANSITION = 'duration-300 ease-in-out' as const

export function classroomContentOffset(isOpen: boolean) {
  return cn(
    `transition-[margin-left] ${SIDEBAR_TRANSITION}`,
    isOpen
      ? CLASSROOM_SIDEBAR_OPEN_OFFSET_CLASS
      : CLASSROOM_SIDEBAR_COLLAPSED_OFFSET_CLASS,
  )
}

export function classroomFooterOffset(isOpen: boolean) {
  return cn(
    `transition-[left] ${SIDEBAR_TRANSITION}`,
    isOpen
      ? CLASSROOM_SIDEBAR_OPEN_LEFT_CLASS
      : CLASSROOM_SIDEBAR_COLLAPSED_LEFT_CLASS,
  )
}
