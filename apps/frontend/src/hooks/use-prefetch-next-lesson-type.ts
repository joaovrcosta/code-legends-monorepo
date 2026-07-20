'use client'

import { useEffect } from 'react'
import type { LessonType } from '@/types/roadmap'
import { useOptionalClassroomRoadmap } from '@/components/classroom/classroom-roadmap-context'

/** Tipos cujo chunk pode ser prefetched sem puxar Sandpack. */
const PREFETCHABLE_TYPES = new Set<LessonType>([
  'video',
  'article',
  'text',
  'quiz',
  'multi_quiz',
  'project',
])

function prefetchLessonTypeChunk(type: LessonType): void {
  switch (type) {
    case 'video':
      void import('@/components/classroom/video')
      break
    case 'article':
    case 'text':
      void import('@/components/classroom/article/components')
      break
    case 'quiz':
    case 'multi_quiz':
      void import('@/components/classroom/challenge/QuizView')
      break
    case 'project':
      void import('@/components/classroom/project-view')
      break
    default:
      // lab (e desconhecidos): nunca prefetch — evita antecipar Sandpack
      break
  }
}

function scheduleIdle(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  const ric = window.requestIdleCallback
  if (typeof ric === 'function') {
    const id = ric(() => cb(), { timeout: 4000 })
    return () => window.cancelIdleCallback(id)
  }
  const t = window.setTimeout(cb, 1500)
  return () => window.clearTimeout(t)
}

/**
 * Prefetch idle do próximo tipo na trilha, exceto lab.
 */
export function usePrefetchNextLessonType(currentLessonId: number | undefined) {
  const roadmap = useOptionalClassroomRoadmap()

  useEffect(() => {
    if (!roadmap || currentLessonId == null) return
    const { allLessons } = roadmap
    const idx = allLessons.findIndex((l) => l.id === currentLessonId)
    if (idx < 0 || idx >= allLessons.length - 1) return
    const next = allLessons[idx + 1]
    const current = allLessons[idx]
    if (!next || !current || next.type === current.type) return
    if (!PREFETCHABLE_TYPES.has(next.type)) return

    return scheduleIdle(() => {
      prefetchLessonTypeChunk(next.type)
    })
  }, [roadmap, currentLessonId])
}
