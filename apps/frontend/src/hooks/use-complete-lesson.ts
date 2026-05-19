'use client'

import { useCallback, useState } from 'react'
import { continueCourse } from '@/actions/course'
import { showLessonXpToast } from '@/lib/show-lesson-xp-toast'
import { maybeShowStreakCongrats } from '@/lib/maybe-show-streak-congrats'
import { useActiveCourseStore } from '@/stores/active-course-store'
import { useCourseModalStore } from '@/stores/course-modal-store'
import type { Lesson } from '@/types/roadmap'

export function useCompleteLesson(lesson: Lesson | null, moduleTitle?: string) {
  const [isMarking, setIsMarking] = useState(false)
  const { activeCourse, fetchActiveCourse } = useActiveCourseStore()
  const {
    currentLesson,
    updateCurrentLessonStatus,
    setLastModuleCompletion,
    setShowModuleStatsOnce,
  } = useCourseModalStore()

  const isMarked =
    !!lesson &&
    currentLesson?.id === lesson.id &&
    currentLesson?.status === 'completed'

  const completeLesson = useCallback(async (): Promise<{
    ok: boolean
    moduleCompleted?: boolean
    alreadyCompleted?: boolean
  }> => {
    if (!lesson?.id || !currentLesson?.id || currentLesson.id !== lesson.id) {
      return { ok: false }
    }
    if (currentLesson.status === 'completed') {
      return { ok: true, alreadyCompleted: true }
    }
    if (isMarking) {
      return { ok: false }
    }

    try {
      setIsMarking(true)
      const result = await continueCourse(currentLesson.id, activeCourse?.id)

      if (!result?.success) {
        return { ok: false }
      }

      showLessonXpToast(result)
      maybeShowStreakCongrats(result)

      if (result.moduleCompleted) {
        setLastModuleCompletion({
          moduleCompleted: true,
          moduleId: result.moduleId,
          moduleTitle: result.moduleTitle ?? moduleTitle,
          progress: result.progress,
          xpGained: result.xpGained,
          xpGainedInModule: result.xpGainedInModule,
          xpGainedInModuleBySkill: result.xpGainedInModuleBySkill,
        })
        setShowModuleStatsOnce(true)
      }

      updateCurrentLessonStatus('completed')
      await fetchActiveCourse()
      return { ok: true, moduleCompleted: result.moduleCompleted }
    } catch (error) {
      console.error('Erro ao concluir lição:', error)
      return { ok: false }
    } finally {
      setIsMarking(false)
    }
  }, [
    lesson?.id,
    currentLesson?.id,
    currentLesson?.status,
    isMarking,
    activeCourse?.id,
    moduleTitle,
    updateCurrentLessonStatus,
    setLastModuleCompletion,
    setShowModuleStatsOnce,
    fetchActiveCourse,
  ])

  return {
    isMarking,
    isMarked,
    completeLesson,
    currentLesson,
  }
}
