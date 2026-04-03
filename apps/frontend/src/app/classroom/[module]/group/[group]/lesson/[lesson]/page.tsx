'use client'

import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { useParams, useRouter, useSearchParams, notFound } from 'next/navigation'
import {
  getLessonBySlug,
  type LessonResponse,
  type LessonUpgradeRequired,
  getCourseRoadmapFresh,
  revalidateRoadmapCache,
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
import { LessonsList } from '@/components/classroom/lessons-list'
import { Skeleton } from '@/components/skeleton'
import { Loading } from '@/components/loading'
import { LessonsAccordion } from '@/components/learn/lessons-accordion'
import { useActiveCourseStore } from '@/stores/active-course-store'
import { useCourseModalStore } from '@/stores/course-modal-store'
import useClassroomSidebarStore from '@/stores/classroom-sidebar'
import type { RoadmapResponse } from '@/types/roadmap'
import { appendCourseIdToClassroomHref } from '@/utils/lesson-url'

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
    lessonCompletedTimestamp,
    currentLesson,
    setShowModuleStatsOnce,
  } = useCourseModalStore()
  const { isOpen: isSidebarOpen } = useClassroomSidebarStore()

  const moduleSlug = params.module as string
  const lessonSlug = params.lesson as string

  const [lessonData, setLessonData] = useState<LessonResponse | null>(null)
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [upgradeRequired, setUpgradeRequired] = useState(false)
  const [_isUnlocking, _setIsUnlocking] = useState(false)
  const lessonDataRef = useRef<LessonResponse | null>(null)
  const loadSeqRef = useRef(0)
  const lastLoadedKeyRef = useRef<string | null>(null)

  useEffect(() => {
    lessonDataRef.current = lessonData
  }, [lessonData])

  // Resetar flag de "mostrar stats uma vez" ao entrar/trocar de aula (stats só aparecem ao clicar Completar).
  useEffect(() => {
    setShowModuleStatsOnce(false)
  }, [lessonSlug, moduleSlug, setShowModuleStatsOnce])

  // Carrega a aula: ?courseId= tem prioridade sobre o curso ativo (evita aula errada + piscada ao sincronizar store)
  useEffect(() => {
    let cancelled = false

    const loadLesson = async () => {
      if (!lessonSlug) {
        setIsLoading(false)
        return
      }

      let courseId =
        courseIdFromUrl || useActiveCourseStore.getState().activeCourse?.id

      if (!courseId) {
        await fetchActiveCourse()
        if (cancelled) return
        courseId =
          courseIdFromUrl || useActiveCourseStore.getState().activeCourse?.id
      }

      if (!courseId) {
        setIsLoading(false)
        return
      }

      const fetchKey = `${courseId}|${moduleSlug}|${lessonSlug}`
      const existing = lessonDataRef.current

      if (
        existing &&
        existing.lesson.slug === lessonSlug &&
        lastLoadedKeyRef.current === fetchKey
      ) {
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
        setIsLoading(false)
        return
      }

      if (cancelled || seq !== loadSeqRef.current) return

      // notFound() lança: não pode ficar dentro do catch acima
      if (isLessonApiNotFound(data)) {
        setIsLoading(false)
        notFound()
      }

      if (isLessonUpgradeRequiredResult(data)) {
        lastLoadedKeyRef.current = null
        setError(data.message)
        setUpgradeRequired(true)
        setIsLoading(false)
        return
      }
      if (data) {
        lastLoadedKeyRef.current = fetchKey
        setLessonData(data)
        const lessonWithStatus = {
          ...data.lesson,
          status: data.status,
        }
        setLessonForPage(lessonWithStatus)
      } else {
        lastLoadedKeyRef.current = null
        setError('Aula não encontrada')
      }

      if (!cancelled && seq === loadSeqRef.current) {
        setIsLoading(false)
      }
    }

    void loadLesson()
    return () => {
      cancelled = true
    }
  }, [
    courseIdFromUrl,
    activeCourse?.id,
    lessonSlug,
    moduleSlug,
    setLessonForPage,
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
    const loadRoadmap = async () => {
      const cid = courseIdFromUrl || activeCourse?.id
      if (!cid) return

      try {
        const roadmapData = await getCourseRoadmapFresh(cid)
        if (roadmapData) {
          setRoadmap(roadmapData)
        }
      } catch (error) {
        console.error('Erro ao carregar roadmap:', error)
      }
    }

    loadRoadmap()
  }, [courseIdFromUrl, activeCourse?.id])

  // Consolida a atualização do roadmap e lição quando uma lição é completada
  useEffect(() => {
    const updateAfterCompletion = async () => {
      const cid = courseIdFromUrl || activeCourse?.id
      if (!cid || !lessonCompletedTimestamp || !lessonSlug) return

      const currentLessonData = lessonDataRef.current
      if (!currentLessonData) return

      let refreshedLessonData: Awaited<ReturnType<typeof getLessonBySlug>> = null
      let roadmapData: Awaited<ReturnType<typeof getCourseRoadmapFresh>> = null

      try {
        await revalidateRoadmapCache(cid)

        await new Promise((resolve) => setTimeout(resolve, 300))

        ;[refreshedLessonData, roadmapData] = await Promise.all([
          getLessonBySlug(cid, lessonSlug, moduleSlug),
          getCourseRoadmapFresh(cid),
        ])
      } catch (error) {
        console.error('Erro ao atualizar após completar lição:', error)
        return
      }

      if (isLessonApiNotFound(refreshedLessonData)) {
        notFound()
      }

      if (
        refreshedLessonData &&
        !isLessonUpgradeRequiredResult(refreshedLessonData)
      ) {
        setLessonData(refreshedLessonData)
        const lessonWithStatus = {
          ...refreshedLessonData.lesson,
          status: refreshedLessonData.status,
        }
        setLessonForPage(lessonWithStatus)
      }

      if (roadmapData) {
        setRoadmap(roadmapData)
      }
    }

    updateAfterCompletion()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    lessonCompletedTimestamp,
    courseIdFromUrl,
    activeCourse?.id,
    lessonSlug,
    moduleSlug,
  ])

  // Atualiza a lição local quando o currentLesson do store mudar (após completar)
  useEffect(() => {
    if (
      currentLesson &&
      lessonData &&
      currentLesson.id === lessonData.lesson.id
    ) {
      // Se o status mudou para completed, atualiza o lessonData local
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

  // Função para navegar para uma aula
  const navigateToLesson = useCallback(
    (nextSlug: string, targetModuleSlug: string, targetGroupSlug: string) => {
      const path = `/classroom/${targetModuleSlug}/group/${targetGroupSlug}/lesson/${nextSlug}`
      const cid = courseIdFromUrl || activeCourse?.id
      router.push(
        cid ? appendCourseIdToClassroomHref(path, cid) : path,
      )
    },
    [router, courseIdFromUrl, activeCourse?.id],
  )

  // Coleta todas as aulas para a sidebar (memoizado)
  const allLessons = useMemo(() => {
    if (!roadmap?.modules) return []
    return roadmap.modules
      .flatMap((m) => m?.groups || [])
      .flatMap((g) => g?.lessons || [])
  }, [roadmap?.modules])

  const classroomCourseId = courseIdFromUrl || activeCourse?.id || undefined

  if (isLoading) {
    return (
      <div className="flex h-[100dvh] w-full min-h-[calc(100dvh-63px)]">
        <aside
          className={`hidden lg:block fixed left-0 top-[63px] bg-surface flex-shrink-0 h-[calc(100dvh-63px)] overflow-hidden z-40 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-[378px]' : 'w-0'
            }`}
        >
          {isSidebarOpen && (
            <div className="h-full flex flex-col w-[378px]">
              <div className="p-4 bg-surface">
                <h2 className="text-[20px] font-semibold text-[#C4C4CC]">
                  Trilha
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="space-y-3 border-b border-zinc-900 pb-4 last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <Skeleton
                        variant="circular"
                        width={44}
                        height={44}
                        className="shrink-0 dark:bg-zinc-800"
                      />
                      <div className="flex-1 space-y-2">
                        <Skeleton
                          variant="text"
                          width="30%"
                          className="h-3 dark:bg-zinc-800"
                        />
                        <Skeleton
                          variant="text"
                          width="70%"
                          className="h-4 dark:bg-zinc-800"
                        />
                      </div>
                    </div>
                    <div className="pl-11 space-y-2">
                      <Skeleton
                        variant="text"
                        width="100%"
                        className="h-3 dark:bg-zinc-800"
                      />
                      <Skeleton
                        variant="text"
                        width="90%"
                        className="h-3 dark:bg-zinc-800"
                      />
                      <Skeleton
                        variant="text"
                        width="95%"
                        className="h-3 dark:bg-zinc-800"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
        <div
          className={`flex-1 w-full min-h-[calc(100dvh-63px)] lg:bg-[radial-gradient(circle_at_center,_#627fa1_0%,_var(--color-surface)_70%)] bg-[radial-gradient(circle_at_center,_#344c68_0%,_var(--color-surface)_70%)] text-white flex flex-col transition-all duration-300 ease-in-out pt-[112px] lg:pt-0 ${isSidebarOpen ? 'lg:ml-[378px]' : 'lg:ml-0'
            }`}
        >
          <header className="h-[63px] py-4 pb-0 bg-transparent rounded-t-[20px] lg:border-b lg:border-[#25252A] border-none lg:mb-2 mb-0 flex-shrink-0 lg:block hidden">
            <div className="flex items-center justify-between w-full px-4">
              <Link href="/learn">
                <X size={32} className="text-white cursor-pointer" />
              </Link>
            </div>
          </header>
          <div className="flex flex-1 items-center justify-center">
            <Loading className="flex-1" />
          </div>
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
      <div className="flex h-[100dvh] w-full min-h-[calc(100dvh-63px)]">
        <aside
          className={`hidden lg:block fixed left-0 top-[63px] bg-surface flex-shrink-0 h-[calc(100dvh-63px)] overflow-hidden z-40 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-[378px]' : 'w-0'
            }`}
        >
          {isSidebarOpen && (
            <div className="h-full flex flex-col w-[378px]">
              <div className="p-4 bg-surface">
                <h2 className="text-[20px] font-semibold text-[#C4C4CC]">
                  Trilha
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto">
                {roadmap ? (
                  <LessonsList
                    lessons={allLessons}
                    roadmap={roadmap}
                    courseId={classroomCourseId}
                  />
                ) : (
                  <div className="flex items-center justify-center p-4">
                    <div className="w-full space-y-4 px-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="space-y-3 border-b border-zinc-900 pb-4 last:border-b-0"
                        >
                          <div className="flex items-center gap-3">
                            <Skeleton
                              variant="circular"
                              width={44}
                              height={44}
                              className="shrink-0 dark:bg-zinc-800"
                            />
                            <div className="flex-1 space-y-2">
                              <Skeleton
                                variant="text"
                                width="30%"
                                className="h-3 dark:bg-zinc-800"
                              />
                              <Skeleton
                                variant="text"
                                width="70%"
                                className="h-4 dark:bg-zinc-800"
                              />
                            </div>
                          </div>
                          <div className="pl-11 space-y-2">
                            <Skeleton
                              variant="text"
                              width="100%"
                              className="h-3 dark:bg-zinc-800"
                            />
                            <Skeleton
                              variant="text"
                              width="90%"
                              className="h-3 dark:bg-zinc-800"
                            />
                            <Skeleton
                              variant="text"
                              width="95%"
                              className="h-3 dark:bg-zinc-800"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>

        <div
          className={`flex-1 w-full min-h-0 flex flex-col lg:bg-[radial-gradient(circle_at_center,_#627fa1_0%,_var(--color-surface)_70%)]
             bg-[radial-gradient(circle_at_center,_#344c68_0%,_var(--color-surface)_70%)]
             text-white shadow-2xl shadow-[#00C8FF]/10 transition-all duration-300 ease-in-out pt-[112px] lg:pt-0 ${isSidebarOpen ? 'lg:ml-[378px]' : 'lg:ml-0'
            }`}
        >
          <header className="h-[63px] py-4 pb-0 bg-transparent rounded-t-[20px] lg:border-b lg:border-[#25252A] border-none lg:mb-2 mb-0 flex-shrink-0 lg:block hidden">
            <div className="flex items-center justify-between w-full px-4">
              <Link href="/learn">
                <X size={32} className="text-white cursor-pointer" />
              </Link>
            </div>
          </header>

          {/* Mobile: coluna rolável — paywall em cima, accordion embaixo */}
          <div className="lg:hidden flex-1 min-h-0 overflow-y-auto flex flex-col scrollbar-classroom">
            <div className="flex-shrink-0">
              <LessonPaywall />
            </div>
            <div className="w-full pt-4 pb-6">
              <LessonsAccordion />
            </div>
          </div>

          {/* Desktop: paywall centralizado */}
          <div className="hidden lg:flex flex-1 min-h-0">
            <LessonPaywall />
          </div>
        </div>
      </div>
    )
  }

  if (error || !lessonData) {
    return (
      <div className="flex min-h-[calc(100dvh-63px)] w-full items-center justify-center bg-surface">
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

  // lessonData não pode ser null aqui devido ao check anterior
  const lesson = lessonData!.lesson
  const navigation = lessonData!.navigation

  return (
    <div className="flex h-[100dvh] w-full">
      <aside
        className={`hidden lg:block fixed left-0 top-[63px] bg-surface flex-shrink-0 h-[calc(100dvh-63px)] overflow-hidden z-40 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-[378px]' : 'w-0'
          }`}
      >
        {isSidebarOpen && (
          <div className="h-full flex flex-col w-[378px]">
            <div className="p-4 bg-surface">
              <h2 className="text-[20px] font-semibold text-[#C4C4CC]">
                Trilha
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              <LessonsList
                lessons={allLessons}
                currentLessonId={lesson.id}
                roadmap={roadmap}
                courseId={classroomCourseId}
              />
            </div>
          </div>
        )}
      </aside>

      <div
        className={`flex-1 w-full min-h-0 max-w-full overflow-x-hidden lg:bg-[radial-gradient(circle_at_center,_#627fa1_0%,_var(--color-surface)_70%)]
             bg-[radial-gradient(circle_at_center,_#344c68_0%,_var(--color-surface)_70%)]
             text-white shadow-2xl shadow-[#00C8FF]/10 flex flex-col transition-all duration-300 ease-in-out pt-[112px] lg:pt-0 ${isSidebarOpen ? 'lg:ml-[378px]' : 'lg:ml-0'
          }`}
      >
        <header className="h-[63px] py-4 pb-0 bg-transparent rounded-t-[20px] lg:border-b lg:border-[#25252A] border-none mb-0 flex-shrink-0 lg:block hidden">
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
            {/* min-h-full: filho ocupa a altura do scrollport — o card da aula pode crescer e não deixa “buraco” de gradiente quando o acordeão está fechado */}
            <div className="flex min-h-full w-full min-w-0 flex-col lg:pr-4 pr-0">
              <LessonContent
                lesson={lesson}
                courseTitle={activeCourse?.title ?? 'Curso'}
                moduleTitle={lessonData.moduleTitle}
                groupTitle={lessonData.groupTitle}
                courseIcon={activeCourse?.icon}
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
                      disabled={!navigation?.next}
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
    </div>
  )
}
