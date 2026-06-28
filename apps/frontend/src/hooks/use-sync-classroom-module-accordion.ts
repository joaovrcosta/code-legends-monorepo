import { useEffect } from 'react'
import type { Module } from '@/types/roadmap'
import useClassroomSidebarStore from '@/stores/classroom-sidebar'

export function moduleAccordionValue(moduleId: string): string {
  return `module-${moduleId}`
}

/**
 * Mantém o accordion do sidebar alinhado com a aula atual:
 * - não abre automaticamente módulos já 100% concluídos
 * - remove módulos concluídos da lista aberta ao carregar o roadmap (ex.: race no redirect)
 */
export function useSyncClassroomModuleAccordion(
  organizedLessons: Module[],
  currentModule: Module | null,
) {
  const { openModuleIds, setOpenModuleIds, ensureModuleOpen } =
    useClassroomSidebarStore()

  useEffect(() => {
    if (!organizedLessons.length) return

    const completedModuleValues = new Set(
      organizedLessons
        .filter((module) => module.isCompleted)
        .map((module) => moduleAccordionValue(module.id)),
    )

    const withoutCompleted = openModuleIds.filter(
      (id) => !completedModuleValues.has(id),
    )

    if (withoutCompleted.length !== openModuleIds.length) {
      setOpenModuleIds(withoutCompleted)
    }
  }, [organizedLessons, openModuleIds, setOpenModuleIds])

  useEffect(() => {
    if (!currentModule || currentModule.isCompleted) return
    ensureModuleOpen(moduleAccordionValue(currentModule.id))
  }, [currentModule?.id, currentModule?.isCompleted, ensureModuleOpen])
}
