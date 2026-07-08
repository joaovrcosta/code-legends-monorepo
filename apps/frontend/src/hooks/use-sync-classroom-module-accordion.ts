import { useEffect } from 'react'
import type { Module } from '@/types/roadmap'
import useClassroomSidebarStore from '@/stores/classroom-sidebar'

export function moduleAccordionValue(moduleId: string): string {
  return `module-${moduleId}`
}

/**
 * Mantém o accordion do sidebar alinhado com a aula atual:
 * - abre o módulo da aula em que o usuário está
 * - ao atualizar o roadmap, fecha módulos concluídos que ainda estavam abertos
 *   (ex.: race no redirect) — sem bloquear reabertura manual depois
 */
export function useSyncClassroomModuleAccordion(
  organizedLessons: Module[],
  currentModule: Module | null,
) {
  const ensureModuleOpen = useClassroomSidebarStore(
    (state) => state.ensureModuleOpen,
  )

  useEffect(() => {
    if (!organizedLessons.length) return

    const completedModuleValues = new Set(
      organizedLessons
        .filter((module) => module.isCompleted)
        .map((module) => moduleAccordionValue(module.id)),
    )

    const { openModuleIds, setOpenModuleIds } =
      useClassroomSidebarStore.getState()
    const withoutCompleted = openModuleIds.filter(
      (id) => !completedModuleValues.has(id),
    )

    if (withoutCompleted.length !== openModuleIds.length) {
      setOpenModuleIds(withoutCompleted)
    }
  }, [organizedLessons])

  useEffect(() => {
    if (!currentModule) return
    ensureModuleOpen(moduleAccordionValue(currentModule.id))
  }, [currentModule?.id, ensureModuleOpen])
}
