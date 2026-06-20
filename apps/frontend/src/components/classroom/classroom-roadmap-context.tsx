'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import type { Lesson, LessonStatus, RoadmapResponse } from '@/types/roadmap'
import { useActiveCourseStore } from '@/stores/active-course-store'
import { useCourseModalStore } from '@/stores/course-modal-store'
import useClassroomSidebarStore from '@/stores/classroom-sidebar'
import { useClassroomRoadmapLoader } from '@/hooks/use-classroom-roadmap-loader'

type RefreshRoadmapOptions = {
  fresh?: boolean
  delay?: number
}

export type ClassroomRoadmapContextValue = {
  roadmap: RoadmapResponse | null
  isLoading: boolean
  courseId: string | undefined
  currentLessonId: number | undefined
  allLessons: Lesson[]
  refreshRoadmap: (options?: RefreshRoadmapOptions) => Promise<RoadmapResponse | null>
  patchLessonStatus: (lessonId: number, status: LessonStatus) => void
}

const ClassroomRoadmapContext =
  createContext<ClassroomRoadmapContextValue | null>(null)

export function ClassroomRoadmapProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams()
  const params = useParams()
  const courseIdFromUrl = (searchParams.get('courseId') || '').trim()
  const { activeCourse, fetchActiveCourse } = useActiveCourseStore()
  const {
    currentLesson,
    lessonCompletedTimestamp,
    moduleUnlockedTimestamp,
  } = useCourseModalStore()
  const { resetAccordionForCourse } = useClassroomSidebarStore()

  const [roadmap, setRoadmapState] = useState<RoadmapResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const setRoadmap = useCallback(
    (
      value:
        | RoadmapResponse
        | null
        | ((prev: RoadmapResponse | null) => RoadmapResponse | null),
    ) => {
      setRoadmapState(value)
    },
    [],
  )

  const courseId = courseIdFromUrl || activeCourse?.id || undefined
  const lessonSlug = params?.lesson as string | undefined

  useEffect(() => {
    if (courseIdFromUrl || activeCourse?.id) return
    void fetchActiveCourse()
  }, [courseIdFromUrl, activeCourse?.id, fetchActiveCourse])

  useEffect(() => {
    resetAccordionForCourse(courseId ?? null)
  }, [courseId, resetAccordionForCourse])

  const { refreshRoadmap, patchLessonStatus } = useClassroomRoadmapLoader({
    courseId,
    lessonCompletedTimestamp,
    moduleUnlockedTimestamp,
    setRoadmap,
    setIsLoading,
  })

  const currentLessonId = useMemo(() => {
    if (currentLesson?.id) {
      return currentLesson.id
    }

    if (!roadmap?.modules || !lessonSlug) {
      return undefined
    }

    for (const moduleItem of roadmap.modules) {
      for (const group of moduleItem.groups || []) {
        const match = group.lessons?.find((lesson) => lesson.slug === lessonSlug)
        if (match) {
          return match.id
        }
      }
    }

    return undefined
  }, [currentLesson?.id, lessonSlug, roadmap])

  const allLessons = useMemo(() => {
    if (!roadmap?.modules) return []
    return roadmap.modules
      .flatMap((module) => module?.groups || [])
      .flatMap((group) => group?.lessons || [])
  }, [roadmap?.modules])

  const value = useMemo<ClassroomRoadmapContextValue>(
    () => ({
      roadmap,
      isLoading,
      courseId,
      currentLessonId,
      allLessons,
      refreshRoadmap,
      patchLessonStatus,
    }),
    [
      roadmap,
      isLoading,
      courseId,
      currentLessonId,
      allLessons,
      refreshRoadmap,
      patchLessonStatus,
    ],
  )

  return (
    <ClassroomRoadmapContext.Provider value={value}>
      {children}
    </ClassroomRoadmapContext.Provider>
  )
}

export function useClassroomRoadmap(): ClassroomRoadmapContextValue {
  const ctx = useContext(ClassroomRoadmapContext)
  if (!ctx) {
    throw new Error(
      'useClassroomRoadmap deve ser usado dentro de ClassroomRoadmapProvider',
    )
  }
  return ctx
}

/** Fora da classroom (ex.: modal de curso), retorna null e o consumidor faz fetch próprio. */
export function useOptionalClassroomRoadmap(): ClassroomRoadmapContextValue | null {
  return useContext(ClassroomRoadmapContext)
}
