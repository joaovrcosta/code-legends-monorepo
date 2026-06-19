import { cn } from '@/lib/utils'

/** Largura reservada no layout com sidebar aberta */
export const CLASSROOM_SIDEBAR_OPEN_WIDTH_CLASS = 'w-[378px]' as const
export const CLASSROOM_SIDEBAR_OPEN_OFFSET_CLASS = 'lg:ml-[378px]' as const
export const CLASSROOM_SIDEBAR_OPEN_LEFT_CLASS = 'lg:left-[378px]' as const

/** Rail flutuante colapsado: 12px margem + 56px pill + 12px gap */
export const CLASSROOM_SIDEBAR_COLLAPSED_RAIL_CLASS = 'w-14' as const
export const CLASSROOM_SIDEBAR_COLLAPSED_SLOT_CLASS = 'w-20' as const
export const CLASSROOM_SIDEBAR_COLLAPSED_OFFSET_CLASS = 'lg:ml-20' as const
export const CLASSROOM_SIDEBAR_COLLAPSED_LEFT_CLASS = 'lg:left-20' as const

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
