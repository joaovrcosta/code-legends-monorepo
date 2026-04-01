'use client'

import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  getLessonBySlug,
  type LessonResponse,
  type LessonUpgradeRequired,
  getCourseRoadmapFresh,
  revalidateRoadmapCache,
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
import { useSession } from 'next-auth/react'

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
  const { data: session } = useSession()
  const userPlan = (session?.user as { plan?: string } | undefined)?.plan
  const isPaidUser = userPlan === 'PRO' || userPlan === 'PREMIUM'

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

  useEffect(() => {
    lessonDataRef.current = lessonData
  }, [lessonData])

  // Resetar flag de "mostrar stats uma vez" ao entrar/trocar de aula (stats só aparecem ao clicar Completar).
  useEffect(() => {
    setShowModuleStatsOnce(false)
  }, [lessonSlug, moduleSlug, setShowModuleStatsOnce])

  // Carrega a aula específica
  useEffect(() => {
    const loadLesson = async () => {
      // Se não há activeCourse, tenta buscar
      if (!activeCourse?.id) {
        await fetchActiveCourse()
        // Aguarda um pouco para a store ser atualizada e o componente re-renderizar
        await new Promise((resolve) => setTimeout(resolve, 200))
        // Verifica novamente após atualizar (usa getState para pegar o valor mais recente)
        const updatedActiveCourse = useActiveCourseStore.getState().activeCourse
        if (!updatedActiveCourse?.id || !lessonSlug) {
          setIsLoading(false)
          return
        }
        // Usa o activeCourse atualizado
        const courseId = updatedActiveCourse.id
        setIsLoading(true)
        setError(null)
        setUpgradeRequired(false)

        try {
          const data = await getLessonBySlug(courseId, lessonSlug, moduleSlug)
          if (isLessonUpgradeRequiredResult(data)) {
            setError(data.message)
            setUpgradeRequired(true)
            return
          }
          if (data) {
            setLessonData(data)

            // Atualiza o store com a lição atual, incluindo o status do nível raiz
            const lessonWithStatus = {
              ...data.lesson,
              status: data.status, // Usa o status do nível raiz da resposta
            }
            setLessonForPage(lessonWithStatus)
          } else {
            setError('Aula não encontrada')
          }
        } catch (err) {
          console.error('Erro ao carregar aula:', err)
          setError(err instanceof Error ? err.message : 'Erro ao carregar aula')
        } finally {
          setIsLoading(false)
        }
        return
      }

      if (!lessonSlug) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)
      setUpgradeRequired(false)

      try {
        const data = await getLessonBySlug(
          activeCourse.id,
          lessonSlug,
          moduleSlug,
        )
        if (isLessonUpgradeRequiredResult(data)) {
          setError(data.message)
          setUpgradeRequired(true)
          return
        }
        if (data) {
          setLessonData(data)

          // Atualiza o store com a lição atual, incluindo o status do nível raiz
          const lessonWithStatus = {
            ...data.lesson,
            status: data.status, // Usa o status do nível raiz da resposta
          }
          setLessonForPage(lessonWithStatus)
        } else {
          setError('Aula não encontrada')
        }
      } catch (err) {
        console.error('Erro ao carregar aula:', err)
        setError(err instanceof Error ? err.message : 'Erro ao carregar aula')
      } finally {
        setIsLoading(false)
      }
    }

    loadLesson()
  }, [
    activeCourse?.id,
    lessonSlug,
    moduleSlug,
    setLessonForPage,
    router,
    fetchActiveCourse,
    isPaidUser,
  ])

  // Carrega o roadmap para a sidebar
  useEffect(() => {
    const loadRoadmap = async () => {
      if (!activeCourse?.id) return

      try {
        const roadmapData = await getCourseRoadmapFresh(activeCourse.id)
        if (roadmapData) {
          setRoadmap(roadmapData)
        }
      } catch (error) {
        console.error('Erro ao carregar roadmap:', error)
      }
    }

    loadRoadmap()
  }, [activeCourse?.id])

  // Consolida a atualização do roadmap e lição quando uma lição é completada
  useEffect(() => {
    const updateAfterCompletion = async () => {
      if (!activeCourse?.id || !lessonCompletedTimestamp || !lessonSlug) return

      // Usa o ref para acessar lessonData sem causar loop
      const currentLessonData = lessonDataRef.current
      if (!currentLessonData) return

      try {
        // Revalida o cache primeiro
        await revalidateRoadmapCache(activeCourse.id)

        // Aguarda um delay reduzido para garantir que a API foi atualizada
        await new Promise((resolve) => setTimeout(resolve, 300))

        // Busca roadmap e lição em paralelo para melhor performance
        const [refreshedLessonData, roadmapData] = await Promise.all([
          getLessonBySlug(activeCourse.id, lessonSlug),
          getCourseRoadmapFresh(activeCourse.id),
        ])

        if (
          refreshedLessonData &&
          !isLessonUpgradeRequiredResult(refreshedLessonData)
        ) {
          setLessonData(refreshedLessonData)
          // Atualiza o store com o status correto do nível raiz
          const lessonWithStatus = {
            ...refreshedLessonData.lesson,
            status: refreshedLessonData.status,
          }
          setLessonForPage(lessonWithStatus)
        }

        if (roadmapData) {
          setRoadmap(roadmapData)
        }
      } catch (error) {
        console.error('Erro ao atualizar após completar lição:', error)
      }
    }

    updateAfterCompletion()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonCompletedTimestamp, activeCourse?.id, lessonSlug])

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
    (lessonSlug: string, targetModuleSlug: string, targetGroupSlug: string) => {
      router.push(
        `/classroom/${targetModuleSlug}/group/${targetGroupSlug}/lesson/${lessonSlug}`,
      )
    },
    [router],
  )

  // Coleta todas as aulas para a sidebar (memoizado)
  const allLessons = useMemo(() => {
    if (!roadmap?.modules) return []
    return roadmap.modules
      .flatMap((m) => m?.groups || [])
      .flatMap((g) => g?.lessons || [])
  }, [roadmap?.modules])

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

  // Paywall: conteúdo exclusivo para assinantes — mantém sidebar e layout, mostra paywall no lugar do vídeo
  if (isUpgradeRequired && activeCourse) {
    return (
      <div className="flex h-[100dvh] w-full min-h-[calc(100dvh-63px)]">
        {/* Sidebar com lista de aulas */}
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
                  <LessonsList lessons={allLessons} roadmap={roadmap} />
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

  if (!activeCourse) {
    return (
      <div className="flex min-h-[calc(100dvh-63px)] w-full items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-[#a1a1aa] mb-4">Nenhum curso ativo encontrado.</p>
          <Link href="/learn/catalog">
            <Button>Explorar cursos</Button>
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
              />
            </div>
          </div>
        )}
      </aside>

      {/* Conteúdo principal */}
      <div
        className={`flex-1 w-full min-h-0 max-w-full overflow-x-hidden lg:bg-[radial-gradient(circle_at_center,_#627fa1_0%,_var(--color-surface)_70%)]
             bg-[radial-gradient(circle_at_center,_#344c68_0%,_var(--color-surface)_70%)]
             text-white shadow-2xl shadow-[#00C8FF]/10 flex flex-col transition-all duration-300 ease-in-out pt-[112px] lg:pt-0 ${isSidebarOpen ? 'lg:ml-[378px]' : 'lg:ml-0'
          }`}
      >
        {/* Header */}
        <header className="h-[63px] py-4 pb-0 bg-transparent rounded-t-[20px] lg:border-b lg:border-[#25252A] border-none mb-0 flex-shrink-0 lg:block hidden">
          <div className="flex items-center justify-between w-full px-4">
            <div className="lg:hidden flex">
              <Menu size={32} className="text-white" />
            </div>

            {/* Botão de voltar (direita) */}
            <Link href="/learn">
              <X size={32} className="text-white cursor-pointer" />
            </Link>
          </div>
        </header>

        {/* Área rolável: vídeo + accordions (título, completar aula, etc.) */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-0 max-lg:scrollbar-classroom-none lg:scrollbar-classroom lg:pr-6">
          <LessonContent
            lesson={lesson}
            courseTitle={activeCourse?.title}
            moduleTitle={lessonData.moduleTitle}
            groupTitle={lessonData.groupTitle}
            courseIcon={activeCourse?.icon}
          />
        </div>

        <footer
          className={`fixed bottom-0 left-0 right-0 z-50 max-w-full overflow-hidden border-t border-[#25252A] bg-[#0C0C0F] transition-all duration-300 ease-in-out lg:mx-4 lg:rounded-b-[20px] ${isSidebarOpen ? 'lg:left-[378px]' : 'lg:left-0'
            }`}
        >
          <div className="flex h-[60px] w-full min-w-0 max-w-full items-stretch lg:h-[84px]">
            {/* Botão Anterior */}
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

            {/* Área Central com Progresso (Desktop) */}
            <div className="hidden min-w-0 flex-[2] items-center justify-center overflow-hidden bg-[#0C0C0F] px-8 lg:flex">
              <div className="w-full max-w-xl min-w-0">
                <LevelProgressBar />
              </div>
            </div>

            {/* Botão Próximo */}
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
  )
}
