/**
 * Define qual lição exibir como "atual" no roadmap/classroom.
 * Prioriza a primeira incompleta na ordem do curso, ignorando currentTaskId stale no banco.
 */
export function resolveDisplayCurrentTaskId(
  allLessons: Array<{ id: number }>,
  isCompleted: (taskId: number) => boolean,
  storedTaskId?: number | null,
): number | null {
  if (allLessons.length === 0) return null

  const firstIncomplete = allLessons.find((l) => !isCompleted(l.id))
  if (firstIncomplete) return firstIncomplete.id

  if (storedTaskId && allLessons.some((l) => l.id === storedTaskId)) {
    return storedTaskId
  }

  return allLessons.at(-1)?.id ?? null
}
