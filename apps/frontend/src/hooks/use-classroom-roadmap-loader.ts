import { useCallback, useEffect, useRef, type Dispatch, type SetStateAction } from 'react'
import {
  getCourseRoadmap,
  getCourseRoadmapFresh,
  revalidateRoadmapCache,
} from '@/actions/course'
import type { LessonStatus, RoadmapResponse } from '@/types/roadmap'

type UseClassroomRoadmapLoaderArgs = {
  courseId: string | undefined
  lessonCompletedTimestamp: number | null
  moduleUnlockedTimestamp: number | null
  setRoadmap: Dispatch<SetStateAction<RoadmapResponse | null>>
  setIsLoading: (loading: boolean) => void
}

function patchLessonInRoadmap(
  roadmap: RoadmapResponse,
  lessonId: number,
  status: LessonStatus,
): RoadmapResponse {
  return {
    ...roadmap,
    modules: roadmap.modules.map((module) => ({
      ...module,
      groups: module.groups.map((group) => ({
        ...group,
        lessons: (group.lessons || []).map((lesson) =>
          lesson.id === lessonId ? { ...lesson, status } : lesson,
        ),
      })),
    })),
  }
}

/** Carrega roadmap da classroom: fetch inicial por curso + refresh só em completion/unlock. */
export function useClassroomRoadmapLoader({
  courseId,
  lessonCompletedTimestamp,
  moduleUnlockedTimestamp,
  setRoadmap,
  setIsLoading,
}: UseClassroomRoadmapLoaderArgs) {
  const lastCourseIdRef = useRef<string | null>(null)
  const loadedCourseIdRef = useRef<string | null>(null)
  const lastCompletedRef = useRef<number | null>(null)
  const lastUnlockedRef = useRef<number | null>(null)

  const refreshRoadmap = useCallback(
    async (options?: { fresh?: boolean; delay?: number }) => {
      if (!courseId) return null

      const fresh = options?.fresh ?? false
      const delay = options?.delay ?? 0

      try {
        if (fresh) {
          await revalidateRoadmapCache(courseId)
        } else {
          revalidateRoadmapCache(courseId).catch(() => undefined)
        }

        if (delay > 0) {
          await new Promise((resolve) => setTimeout(resolve, delay))
        }

        const data = fresh
          ? await getCourseRoadmapFresh(courseId)
          : await getCourseRoadmap(courseId)

        if (data) {
          loadedCourseIdRef.current = courseId
          setRoadmap(data)
          return data
        }
      } catch (error) {
        console.error('Erro ao atualizar roadmap da classroom:', error)
      }

      return null
    },
    [courseId, setRoadmap],
  )

  const patchLessonStatus = useCallback(
    (lessonId: number, status: LessonStatus) => {
      setRoadmap((prev) => {
        if (!prev) return prev
        return patchLessonInRoadmap(prev, lessonId, status)
      })
    },
    [setRoadmap],
  )

  useEffect(() => {
    if (!courseId) {
      lastCourseIdRef.current = null
      loadedCourseIdRef.current = null
      setRoadmap(null)
      setIsLoading(false)
      return
    }

    if (loadedCourseIdRef.current === courseId) {
      setIsLoading(false)
      return
    }

    lastCourseIdRef.current = courseId
    lastCompletedRef.current = null
    lastUnlockedRef.current = null
    setIsLoading(true)

    let cancelled = false

    void (async () => {
      try {
        const data = await getCourseRoadmap(courseId)
        if (!cancelled && data) {
          loadedCourseIdRef.current = courseId
          setRoadmap(data)
        }
      } catch (error) {
        console.error('Erro ao carregar roadmap da classroom:', error)
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
      setIsLoading(false)
      loadedCourseIdRef.current = null
    }
  }, [courseId, setRoadmap, setIsLoading])

  useEffect(() => {
    if (!courseId || !lessonCompletedTimestamp) return
    if (lessonCompletedTimestamp === lastCompletedRef.current) return

    lastCompletedRef.current = lessonCompletedTimestamp
    void refreshRoadmap({ fresh: true, delay: 300 })
  }, [courseId, lessonCompletedTimestamp, refreshRoadmap])

  useEffect(() => {
    if (!courseId || !moduleUnlockedTimestamp) return
    if (moduleUnlockedTimestamp === lastUnlockedRef.current) return

    lastUnlockedRef.current = moduleUnlockedTimestamp
    void refreshRoadmap({ fresh: true, delay: 300 })
  }, [courseId, moduleUnlockedTimestamp, refreshRoadmap])

  return { refreshRoadmap, patchLessonStatus }
}
