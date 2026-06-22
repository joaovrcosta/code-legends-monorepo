'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter, useSearchParams, notFound } from 'next/navigation'
import {
  getLessonBySlug,
  type LessonResponse,
  type LessonUpgradeRequired,
  isLessonApiNotFound,
} from '@/actions/course'
import { LessonContent } from '@/components/classroom/lesson-content'
import { LessonPaywall } from '@/components/classroom/lesson-paywall'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { LevelProgressBar } from '@/components/learn/level-progress-bar'
import { SkipForward } from '@phosphor-icons/react'
import { SkipBack } from '@phosphor-icons/react/dist/ssr'
import Link from 'next/link'
import { Loading } from '@/components/loading'
import { LessonsAccordion } from '@/components/learn/lessons-accordion'
import { useActiveCourseStore } from '@/stores/active-course-store'
import { useCourseModalStore } from '@/stores/course-modal-store'
import { useClassroomRoadmap } from '@/components/classroom/classroom-roadmap-context'
import { appendCourseIdToClassroomHref } from '@/utils/lesson-url'
import { useClassroomAutoplayStore } from '@/stores/classroom-autoplay-store'
import { useCompleteLesson } from '@/hooks/use-complete-lesson'
import { resolveAutoplayNextVideo } from '@/lib/lesson-chain-navigation'

function isLessonUpgradeRequiredResult(
  data: LessonResponse | LessonUpgradeRequired | null,
): data is LessonUpgradeRequired {
  return !!(
    data &&
    typeof data === 'object' &&
    '__upgradeRequired' in data &&
    (data as LessonUpgradeRequired).__upgradeRequired
  )
}

export default function DynamicLessonPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseIdFromUrl = (searchParams.get('courseId') || '').trim()

  const { activeCourse, fetchActiveCourse } = useActiveCourseStore()
  const {
    setLessonForPage,
    setExclusiveAccessBlocked,
    lessonCompletedTimestamp,
    currentLesson,
    setShowModuleStatsOnce,
    multiQuizBlocksNextLesson,
  } = useCourseModalStore()
  const { allLessons, courseId: contextCourseId, patchLessonStatus } =
    useClassroomRoadmap()

  const moduleSlug = params.module as string
  const lessonSlug = params.lesson as string

  const [lessonData, setLessonData] = useState<LessonResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [upgradeRequired, setUpgradeRequired] = useState(false)
  const lessonDataRef = useRef<LessonResponse | null>(null)
  const loadSeqRef = useRef(0)
  const lastLoadedKeyRef = useRef<string | null>(null)
  const lastCompletionHandledRef = useRef<number | null>(null)

  useEffect(() => {
    lessonDataRef.current = lessonData
  }, [lessonData])

  useEffect(() => {
    setShowModuleStatsOnce(false)
  }, [lessonSlug, moduleSlug, setShowModuleStatsOnce])

  useEffect(() => {
    let cancelled = false

    const loadLesson = async () => {
      if (!lessonSlug) {
        setIsLoading(false)
        return
      }

      let courseId =
        courseIdFromUrl ||
        contextCourseId ||
        useActiveCourseStore.getState().activeCourse?.id

      if (!courseId) {
        await fetchActiveCourse()
        if (cancelled) return
        courseId =
          courseIdFromUrl ||
          contextCourseId ||
          useActiveCourseStore.getState().activeCourse?.id
      }

      if (!courseId) {
        if (!cancelled) setIsLoading(false)
        return
      }

      const fetchKey = `${courseId}|${moduleSlug}|${lessonSlug}`
      const existing = lessonDataRef.current

      if (
        existing &&
        existing.lesson.slug === lessonSlug &&
        lastLoadedKeyRef.current === fetchKey
      ) {
        setIsLoading(false)
        return
      }

      loadSeqRef.current += 1
      const seq = loadSeqRef.current

      setIsLoading(true)
      setError(null)
      setUpgradeRequired(false)

      let data: Awaited<ReturnType<typeof getLessonBySlug>> = null
      try {
        data = await getLessonBySlug(courseId, lessonSlug, moduleSlug)
      } catch (err) {
        if (cancelled || seq !== loadSeqRef.current) return
        lastLoadedKeyRef.current = null
        console.error('Erro ao carregar aula:', err)
        setError(err instanceof Error ? err.message : 'Erro ao carregar aula')
        return
      } finally {
        if (!cancelled && seq === loadSeqRef.current) {
          setIsLoading(false)
        }
      }

      if (cancelled || seq !== loadSeqRef.current) return

      if (isLessonApiNotFound(data)) {
        notFound()
      }

      if (isLessonUpgradeRequiredResult(data)) {
        lastLoadedKeyRef.current = null
        setError(data.message)
        setUpgradeRequired(true)
        setExclusiveAccessBlocked(true)
        return
      }

      if (data) {
        lastLoadedKeyRef.current = fetchKey
        setLessonData(data)
        setLessonForPage({
          ...data.lesson,
          status: data.status,
        })
      } else {
        lastLoadedKeyRef.current = null
        setError('Aula não encontrada')
      }
    }

    void loadLesson()
    return () => {
      cancelled = true
      loadSeqRef.current += 1
    }
  }, [
    courseIdFromUrl,
    activeCourse?.id,
    contextCourseId,
    lessonSlug,
    moduleSlug,
    setLessonForPage,
    setExclusiveAccessBlocked,
    fetchActiveCourse,
  ])

  useEffect(() => {
    if (!courseIdFromUrl || !lessonData) return
    if (activeCourse?.id === courseIdFromUrl) return

    let cancelled = false
      ; (async () => {
        try {
          const { startCourse } = await import('@/actions/course/start')
          await startCourse(courseIdFromUrl)
          if (!cancelled) await fetchActiveCourse()
        } catch (e) {
          console.warn('[classroom] Não foi possível alinhar curso ativo:', e)
        }
      })()

    return () => {
      cancelled = true
    }
  }, [
    courseIdFromUrl,
    lessonData?.lesson?.id,
    activeCourse?.id,
    fetchActiveCourse,
  ])

  useEffect(() => {
    if (!lessonCompletedTimestamp || !lessonSlug) return
    if (lessonCompletedTimestamp === lastCompletionHandledRef.current) return

    lastCompletionHandledRef.current = lessonCompletedTimestamp

    const currentLessonData = lessonDataRef.current
    if (!currentLessonData) return

    const cid = courseIdFromUrl || activeCourse?.id || contextCourseId
    if (!cid) return

    patchLessonStatus(currentLessonData.lesson.id, 'completed')

    void (async () => {
      try {
        const refreshedLessonData = await getLessonBySlug(
          cid,
          lessonSlug,
          moduleSlug,
        )

        if (isLessonApiNotFound(refreshedLessonData)) {
          notFound()
        }

        if (
          refreshedLessonData &&
          !isLessonUpgradeRequiredResult(refreshedLessonData)
        ) {
          setLessonData(refreshedLessonData)
          setLessonForPage({
            ...refreshedLessonData.lesson,
            status: refreshedLessonData.status,
          })
        }
      } catch (refreshError) {
        console.error('Erro ao atualizar aula após completar:', refreshError)
      }
    })()
  }, [
    lessonCompletedTimestamp,
    courseIdFromUrl,
    activeCourse?.id,
    contextCourseId,
    lessonSlug,
    moduleSlug,
    patchLessonStatus,
    setLessonForPage,
  ])

  useEffect(() => {
    if (
      currentLesson &&
      lessonData &&
      currentLesson.id === lessonData.lesson.id
    ) {
      if (
        currentLesson.status === 'completed' &&
        lessonData.status !== 'completed'
      ) {
        setLessonData((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            status: 'completed',
            lesson: { ...prev.lesson, status: 'completed' },
          }
        })
      }
    }
  }, [currentLesson, lessonData])

  const navigateToLesson = useCallback(
    (nextSlug: string, targetModuleSlug: string, targetGroupSlug: string) => {
      const path = `/classroom/${targetModuleSlug}/group/${targetGroupSlug}/lesson/${nextSlug}`
      const cid = courseIdFromUrl || activeCourse?.id || contextCourseId
      router.push(
        cid ? appendCourseIdToClassroomHref(path, cid) : path,
      )
    },
    [router, courseIdFromUrl, activeCourse?.id, contextCourseId],
  )

  const lesson = lessonData?.lesson
  const navigation = lessonData?.navigation
  const { isAutoplayEnabled, pendingVideoAutoplay, setPendingVideoAutoplay } =
    useClassroomAutoplayStore()
  const { completeLesson } = useCompleteLesson(
    lesson ?? null,
    lessonData?.moduleTitle,
  )
  const videoChainBusyRef = useRef(false)

  const handleVideoEnded = useCallback(async () => {
    if (videoChainBusyRef.current || !lesson || lesson.type !== 'video') return
    videoChainBusyRef.current = true

    try {
      const wasCompleted = lessonData?.status === 'completed'
      let moduleCompleted = false

      if (!wasCompleted) {
        const result = await completeLesson()
        if (!result.ok) return
        moduleCompleted = !!result.moduleCompleted
      }

      if (moduleCompleted) return
      if (!isAutoplayEnabled) return

      const nextTarget = resolveAutoplayNextVideo(navigation, allLessons)
      if (!nextTarget) return

      setPendingVideoAutoplay(true)
      window.setTimeout(() => {
        navigateToLesson(
          nextTarget.slug,
          nextTarget.moduleSlug,
          nextTarget.groupSlug,
        )
      }, 700)
    } finally {
      window.setTimeout(() => {
        videoChainBusyRef.current = false
      }, 1200)
    }
  }, [
    lesson,
    lessonData?.status,
    completeLesson,
    isAutoplayEnabled,
    navigation,
    allLessons,
    setPendingVideoAutoplay,
    navigateToLesson,
  ])

  if (isLoading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col pt-[110px] lg:pt-0">
        <div className="flex flex-1 items-center justify-center">
          <Loading className="flex-1" width={64} />
        </div>
      </div>
    )
  }

  const isUpgradeRequired =
    upgradeRequired ||
    (error?.toLowerCase().includes('exclusivo') ?? false) ||
    (error?.toLowerCase().includes('assinantes') ?? false) ||
    (error?.toLowerCase().includes('upgrade') ?? false)

  if (isUpgradeRequired && (activeCourse || courseIdFromUrl)) {
    return (
      <div className="flex min-h-0 flex-1 flex-col pt-[110px] lg:pt-0">
        <div className="lg:hidden flex-1 min-h-0 overflow-y-auto flex flex-col scrollbar-classroom">
          <div className="flex-shrink-0">
            <LessonPaywall />
          </div>
          <div className="w-full pt-4 pb-6">
            <LessonsAccordion />
          </div>
        </div>

        <div className="hidden lg:flex flex-1 min-h-0">
          <LessonPaywall />
        </div>
      </div>
    )
  }

  if (error || !lessonData) {
    return (
      <div className="flex min-h-[calc(100dvh-63px)] w-full flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-4 px-4 text-center">
          <p className="text-[#a1a1aa] mb-4">
            {error || 'Aula não encontrada'}
          </p>
          {isUpgradeRequired && (
            <Link href="/plans">
              <Button className="rounded-full bg-blue-gradient-500 hover:opacity-90">
                Fazer upgrade para acessar
              </Button>
            </Link>
          )}
          <Link href="/learn">
            <Button>Voltar</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col pt-[110px] lg:pt-0">
      <header className="h-[78px] py-4 pb-0 bg-transparent rounded-t-[20px] lg:border-b lg:border-[#25252A] border-none mb-0 flex-shrink-0 lg:block hidden">
        <div className="flex items-center justify-between w-full px-4">
          <div className="lg:hidden flex">
            <Menu size={32} className="text-white" />
          </div>

          <Link href="/learn">
            <X size={32} className="text-white cursor-pointer" />
          </Link>
        </div>
      </header>

      <div className="flex flex-1 flex-col min-h-0 w-full min-w-0 overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden max-lg:scrollbar-classroom-none lg:scrollbar-classroom">
          <div className="flex min-h-full w-full min-w-0 flex-col lg:pr-2 pr-0">
            <LessonContent
              lesson={lessonData.lesson}
              courseTitle={activeCourse?.title ?? 'Curso'}
              moduleTitle={lessonData.moduleTitle}
              groupTitle={lessonData.groupTitle}
              courseIcon={activeCourse?.icon}
              onVideoEnded={
                lessonData.lesson.type === 'video' ? handleVideoEnded : undefined
              }
              startVideoPlaybackAutoplay={
                lessonData.lesson.type === 'video'
                  ? pendingVideoAutoplay
                  : false
              }
            />
          </div>
        </div>

        <div className="shrink-0 min-w-0">
          <div className="w-full lg:pr-4 pr-0">
            <footer className="z-50 w-full overflow-hidden border-t border-[#25252A] bg-[#0C0C0F] transition-all duration-300 ease-in-out lg:rounded-b-[20px]">
              <div className="flex h-[60px] w-full items-stretch lg:h-[84px]">
                <div className="flex min-w-0 flex-1 justify-start">
                  <Button
                    className="h-full w-full max-w-[320px] min-w-0 rounded-none lg:rounded-bl-[20px] border-l border-r border-[#25252A] border-y-0 bg-transparent text-base text-zinc-400 shadow-none hover:bg-white/5 hover:text-white disabled:pointer-events-none disabled:text-zinc-600 transition-all"
                    onClick={() => {
                      if (navigation?.previous) {
                        navigateToLesson(
                          navigation.previous.slug,
                          navigation.previous.moduleSlug,
                          navigation.previous.groupSlug,
                        )
                      }
                    }}
                    disabled={!navigation?.previous}
                  >
                    <SkipBack weight="fill" size={20} className="mr-2 shrink-0" />
                    Anterior
                  </Button>
                </div>

                <div className="hidden min-w-0 flex-[2] items-center justify-center overflow-hidden bg-[#0C0C0F] px-8 lg:flex">
                  <div className="w-full max-w-xl min-w-0">
                    <LevelProgressBar />
                  </div>
                </div>

                <div className="flex min-w-0 flex-1 justify-end">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (!navigation?.next) return
                      navigateToLesson(
                        navigation.next.slug,
                        navigation.next.moduleSlug,
                        navigation.next.groupSlug,
                      )
                    }}
                    disabled={!navigation?.next || multiQuizBlocksNextLesson}
                    className="group h-full w-full max-w-[320px] min-w-0 rounded-none lg:rounded-br-[20px] border-l border-r border-[#25252A] border-y-0 bg-transparent text-base text-white shadow-none hover:bg-[#00C8FF]/10 disabled:pointer-events-none disabled:text-zinc-600 transition-all"
                  >
                    Próxima
                    <SkipForward
                      weight="fill"
                      size={20}
                      className="ml-2 shrink-0 text-[#00C8FF] transition-transform group-hover:translate-x-1"
                    />
                  </Button>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  )
}
