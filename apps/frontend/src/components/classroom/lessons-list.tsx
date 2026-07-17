'use client'

import { useCourseModalStore } from '@/stores/course-modal-store'
import type { RoadmapLesson, RoadmapResponse } from '@/types/roadmap'
import {
  appendCourseIdToClassroomHref,
  findLessonContext,
  generateLessonUrl,
} from '@/utils/lesson-url'
import { useRouter } from 'next/navigation'
import { useMemo, memo, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import useClassroomSidebarStore from '@/stores/classroom-sidebar'
import { useSyncClassroomModuleAccordion } from '@/hooks/use-sync-classroom-module-accordion'
import { ChevronDown, Circle } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ProgressRing } from '@/components/classroom/module-progress-ring'
import { Skeleton } from '@/components/skeleton'
import { CheckIcon } from '@phosphor-icons/react'

function getLessonMeta(lesson: RoadmapLesson) {
  const typeLabel =
    lesson.type === 'video'
      ? 'Vídeo'
      : lesson.type === 'article' || lesson.type === 'text'
        ? 'Leitura'
        : lesson.type === 'quiz'
          ? 'Quiz'
          : lesson.type === 'multi_quiz'
            ? 'Desafios'
            : lesson.type === 'project'
              ? 'Projeto'
              : lesson.type === 'lab'
                ? 'Lab'
              : lesson.type

  const duration = lesson.video?.duration ?? lesson.video_duration

  return duration ? `${typeLabel} • ${duration}` : typeLabel
}

interface LessonsListProps {
  lessons: RoadmapLesson[]
  currentLessonId?: number
  activeLessonId?: number
  paywallLessonId?: number
  roadmap: RoadmapResponse | null
  courseId?: string
}

export const LessonsList = memo(function LessonsList({
  lessons,
  currentLessonId,
  activeLessonId,
  paywallLessonId,
  roadmap,
  courseId,
}: LessonsListProps) {
  const { setLessonsForPage } = useCourseModalStore()
  const { openModuleIds, setOpenModuleIds } = useClassroomSidebarStore()
  const router = useRouter()
  const { data: session } = useSession()
  const userPlan = (session?.user as { plan?: string } | undefined)?.plan

  const organizedLessons = useMemo(() => {
    if (!roadmap?.modules) return []
    return roadmap.modules.map((module) => ({
      ...module,
      groups: module.groups.map((group) => ({
        ...group,
        lessons: group.lessons || [],
      })),
    }))
  }, [roadmap])

  const handleLessonClick = useCallback(
    (lesson: RoadmapLesson, index: number) => {
      if (!roadmap?.modules) return

      const context = findLessonContext(lesson.id, roadmap.modules)

      if (context) {
        const url = generateLessonUrl(lesson, context.module, context.group)
        router.push(
          courseId ? appendCourseIdToClassroomHref(url, courseId) : url,
        )
      } else {
        setLessonsForPage(lessons, index)
        const fallback = '/classroom'
        router.push(
          courseId
            ? appendCourseIdToClassroomHref(fallback, courseId)
            : fallback,
        )
      }
    },
    [roadmap?.modules, router, setLessonsForPage, lessons, courseId],
  )

  // Encontra o módulo que contém a aula atual (sempre executado antes de qualquer return)
  const currentModule = useMemo(() => {
    if (!organizedLessons || organizedLessons.length === 0) {
      return null
    }

    if (!currentLessonId) {
      return organizedLessons[0] // Fallback para o primeiro módulo
    }

    // Procura em todos os módulos qual contém a aula atual
    for (const moduleItem of organizedLessons) {
      for (const group of moduleItem.groups) {
        if (group.lessons.some((lesson) => lesson.id === currentLessonId)) {
          return moduleItem
        }
      }
    }

    // Se não encontrar, retorna o primeiro módulo
    return organizedLessons[0]
  }, [organizedLessons, currentLessonId])

  useSyncClassroomModuleAccordion(organizedLessons, currentModule)

  if (!roadmap || organizedLessons.length === 0 || !currentModule) {
    return (
      <div className="py-4 space-y-4">
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
    )
  }

  return (
    <div className="min-w-0 bg-surface">
      <Accordion
        type="multiple"
        value={openModuleIds}
        onValueChange={setOpenModuleIds}
        className="min-w-0 pt-0 pb-4"
      >
        {organizedLessons.map((moduleItem, moduleIndex) => {
          const moduleValue = `module-${moduleItem.id}`
          const isCurrentModule = currentModule?.id === moduleItem.id
          const allModuleLessons = moduleItem.groups.flatMap(
            (g) => g.lessons || [],
          )
          const totalLessons = allModuleLessons.length
          const completedLessons = allModuleLessons.filter(
            (l) => l.status === 'completed',
          ).length
          const progress =
            totalLessons > 0 ? completedLessons / totalLessons : 0

          return (
            <AccordionItem
              key={moduleItem.id}
              value={moduleValue}
              className="min-w-0 border-b border-zinc-900 last:border-b-0"
            >
              <AccordionTrigger className="sticky top-0 z-10 grid w-full min-w-0 grid-cols-[minmax(0,1fr)_1rem] items-center gap-x-2 bg-surface py-4 hover:no-underline border-b border-transparent [&[data-state=open]]:border-zinc-800 [&[data-state=open]>svg]:rotate-180">
                <div className="col-start-1 flex min-w-0 items-center gap-3 text-left">
                  <ProgressRing
                    progress={progress}
                    moduleNumber={moduleIndex + 1}
                    isCurrent={isCurrentModule}
                  />
                  <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Level {String(moduleIndex + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={`w-full truncate font-bold text-[16px] ${isCurrentModule
                        ? 'bg-blue-gradient-500 bg-clip-text text-transparent'
                        : 'text-zinc-200'
                        }`}
                    >
                      {moduleItem.title}
                    </span>
                  </div>
                </div>
                <ChevronDown className="col-start-2 h-4 w-4 shrink-0 justify-self-center text-zinc-400 transition-transform duration-200 origin-center" />
              </AccordionTrigger>
              <AccordionContent className="pb-4 pt-6">
                <div className="flex flex-col gap-6">
                  {moduleItem.groups.map((group, groupIndex) => {
                    const isLastGroup =
                      groupIndex === moduleItem.groups.length - 1

                    return (
                      <div key={group.id} className="relative">
                        {!isLastGroup && (
                          <div className="absolute left-[11px] top-8 bottom-[-24px] w-[2px] bg-zinc-800/50 z-0" />
                        )}

                        <div className="relative z-10 mb-2 flex min-w-0 items-center gap-4">
                          <div className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-zinc-700 bg-zinc-900">
                            <div className="h-2 w-2 rounded-full bg-zinc-500" />
                          </div>
                          <h3 className="min-w-0 flex-1 truncate text-base font-semibold text-zinc-200">
                            {group.title}
                          </h3>
                        </div>

                        <div className="relative pl-[11px]">
                          <div
                            className={`absolute left-[11px] top-0 bottom-0 w-[2px] bg-zinc-800/50 ${group.lessons.length === 0 ? 'hidden' : ''
                              }`}
                          />

                          <div className="flex flex-col">
                            {group.lessons.map((lesson, lessonIndex) => {
                              const isActive = activeLessonId === lesson.id
                              const isPaywallTarget = paywallLessonId === lesson.id
                              const isLastLesson = lessonIndex === group.lessons.length - 1
                              const lessonIndexInAll = lessons.findIndex((l) => l.id === lesson.id)
                              const isPaidLesson = lesson.isFree === false
                              const isFreePlan = userPlan === 'FREE'

                              return (
                                <div
                                  key={lesson.id}
                                  className="relative pl-8 pt-1"
                                >
                                  <div
                                    className="absolute left-0 top-0 h-[32px] w-8 border-b-2 border-l-2 border-[#1a1a1b] rounded-bl-xl"
                                  />

                                  {isLastLesson && (
                                    <div className="absolute left-0 top-[26px] bottom-0 w-[2px] bg-surface z-10" />
                                  )}

                                  <button
                                    onClick={() => handleLessonClick(lesson, lessonIndexInAll)}
                                    className={`group relative flex items-center gap-3 w-full py-2 px-3 rounded-[12px] transition-colors duration-200 text-left ${
                                      isActive
                                        ? 'bg-zinc-800/50'
                                        : isPaywallTarget
                                          ? 'bg-zinc-800/30'
                                          : 'hover:bg-zinc-800/30'
                                    } ${isFreePlan && isPaidLesson && !isPaywallTarget ? 'opacity-50' : ''}`}
                                  >
                                    {lesson.status === 'completed' ? (
                                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#278b4d]">
                                        <CheckIcon
                                          size={12}
                                          weight="bold"
                                          className="text-white"
                                        />
                                      </span>
                                    ) : (
                                      <Circle
                                        size={20}
                                        strokeWidth={1.75}
                                        className={`shrink-0 fill-transparent transition-colors ${
                                          isActive
                                            ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]'
                                            : 'text-zinc-500'
                                        }`}
                                      />
                                    )}

                                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                      <span
                                        className={`text-sm truncate transition-colors duration-200 ${
                                          isActive
                                            ? 'text-cyan-50 font-semibold'
                                            : 'text-zinc-400 font-base group-hover:text-zinc-200'
                                        }`}
                                      >
                                        {lesson.title}
                                      </span>
                                      <span
                                        className={`truncate text-xs tabular-nums ${isActive ? 'text-slate-500' : 'text-zinc-500'
                                          }`}
                                      >
                                        {getLessonMeta(lesson)}
                                      </span>
                                    </div>

                                    {userPlan === 'FREE' && (
                                      <span
                                        className={`shrink-0 text-[10px] font-semibold uppercase tracking-wide rounded-full h-[24px] w-[24px] flex items-center justify-center ${lesson.isFree
                                          ? 'bg-green-500/10 text-[#6ee7b7]'
                                          : 'bg-purple-500/10 text-purple-400'
                                          }`}
                                      >
                                        {lesson.isFree ? 'G' : 'P'}
                                      </span>
                                    )}
                                  </button>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
})
