'use client'

import { useCourseModalStore } from '@/stores/course-modal-store'
import type { Lesson, RoadmapResponse } from '@/types/roadmap'
import { findLessonContext, generateLessonUrl } from '@/utils/lesson-url'
import { useRouter } from 'next/navigation'
import { useMemo, memo, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { ChevronDown, Video, FileText, HelpCircle, Code2 } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ProgressRing } from '@/components/classroom/module-progress-ring'
import { Skeleton } from '@/components/skeleton'

function getLessonMeta(lesson: Lesson) {
  const typeLabel =
    lesson.type === 'video'
      ? 'Vídeo'
      : lesson.type === 'article' || lesson.type === 'text'
        ? 'Leitura'
        : lesson.type === 'quiz'
          ? 'Quiz'
          : lesson.type === 'project'
            ? 'Projeto'
            : lesson.type

  const duration = lesson.video?.duration ?? lesson.video_duration

  return duration ? `${typeLabel} • ${duration}` : typeLabel
}

function getLessonTypeIcon(lesson: Lesson) {
  if (lesson.type === 'video') return Video
  if (lesson.type === 'article' || lesson.type === 'text') return FileText
  if (lesson.type === 'quiz') return HelpCircle
  if (lesson.type === 'project') return Code2
  return FileText
}

interface LessonsListProps {
  lessons: Lesson[]
  currentLessonId?: number
  roadmap: RoadmapResponse | null
}

export const LessonsList = memo(function LessonsList({
  lessons,
  currentLessonId,
  roadmap,
}: LessonsListProps) {
  const { setLessonsForPage } = useCourseModalStore()
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
    (lesson: Lesson, index: number) => {
      if (!roadmap?.modules) return

      const context = findLessonContext(lesson.id, roadmap.modules)

      if (context) {
        const url = generateLessonUrl(lesson, context.module, context.group)
        router.push(url)
      } else {
        setLessonsForPage(lessons, index)
        router.push('/classroom')
      }
    },
    [roadmap?.modules, router, setLessonsForPage, lessons],
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

  // Valor do accordion: só o módulo atual aberto por padrão
  const defaultOpenModuleValue = useMemo(() => {
    if (!currentModule) return undefined
    return `module-${currentModule.id}`
  }, [currentModule])

  if (!roadmap || organizedLessons.length === 0 || !currentModule) {
    return (
      <div className="px-4 py-4 space-y-4">
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
    <div
      className="h-full overflow-y-scroll bg-[#121214] scrollbar-thin [&::-webkit-scrollbar]:w-2
        [&::-webkit-scrollbar-track]:bg-transparent
        [&::-webkit-scrollbar-thumb]:bg-transparent
        [&::-webkit-scrollbar-thumb]:rounded-full
        hover:[&::-webkit-scrollbar-thumb]:bg-zinc-700/40
        [&::-webkit-scrollbar-thumb:hover]:bg-zinc-600"
    >
      <Accordion
        type="multiple"
        defaultValue={defaultOpenModuleValue ? [defaultOpenModuleValue] : []}
        className="px-4 pt-0 pb-4"
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
              className="border-b border-zinc-900 last:border-b-0"
            >
              <AccordionTrigger className="sticky top-0 z-10 bg-[#121214] py-4 hover:no-underline border-b border-transparent [&[data-state=open]]:border-zinc-800 [&[data-state=open]>svg]:rotate-180">
                <div className="flex items-center gap-3 text-left">
                  <ProgressRing
                    progress={progress}
                    moduleNumber={moduleIndex + 1}
                    isCurrent={isCurrentModule}
                  />
                  <div className="flex flex-col items-start gap-0.5">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Módulo {String(moduleIndex + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={`font-bold text-[16px] ${
                        isCurrentModule
                          ? 'bg-blue-gradient-500 bg-clip-text text-transparent'
                          : 'text-zinc-200'
                      }`}
                    >
                      {moduleItem.title}
                    </span>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-200 origin-center" />
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

                        <div className="relative z-10 flex items-center gap-4 mb-2">
                          <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-zinc-900 border-2 border-zinc-700 shadow-sm shrink-0">
                            <div className="w-2 h-2 rounded-full bg-zinc-500" />
                          </div>
                          <h3 className="text-base font-semibold text-zinc-200">
                            {group.title}
                          </h3>
                        </div>

                        <div className="relative pl-[11px]">
                          <div
                            className={`absolute left-[11px] top-0 bottom-0 w-[2px] bg-zinc-800/50 ${
                              group.lessons.length === 0 ? 'hidden' : ''
                            }`}
                          />

                          <div className="flex flex-col">
                            {group.lessons.map((lesson, lessonIndex) => {
                              const isActive = currentLessonId === lesson.id
                              const isLastLesson =
                                lessonIndex === group.lessons.length - 1
                              const lessonIndexInAll = lessons.findIndex(
                                (l) => l.id === lesson.id,
                              )
                              const isLocked = lesson.status === 'locked'
                              const isPaidLesson = lesson.isFree === false
                              const isFreePlan = userPlan === 'FREE'

                              return (
                                <div
                                  key={lesson.id}
                                  className="relative pl-8 pt-1"
                                >
                                  {isLastLesson && (
                                    <div className="absolute left-0 top-4 bottom-0 w-[4px] bg-[#121214] z-10" />
                                  )}
                                  <div className="absolute left-0 top-0 h-[24px] w-[24px] border-b-2 border-l-2 border-zinc-800/50 rounded-bl-xl translate-y-[-50%]" />

                                  <button
                                    onClick={() =>
                                      handleLessonClick(
                                        lesson,
                                        lessonIndexInAll,
                                      )
                                    }
                                    disabled={isLocked}
                                    className={`group relative flex items-center gap-3 w-full py-2 px-3 rounded-[12px] transition-colors duration-200 text-left ${
                                      isActive
                                        ? 'bg-zinc-800/50 shadow-xl'
                                        : 'hover:bg-zinc-800/30'
                                    } ${
                                      isLocked
                                        ? 'opacity-50 cursor-not-allowed'
                                        : isFreePlan && isPaidLesson
                                          ? 'opacity-50'
                                          : ''
                                    }`}
                                  >
                                    {(() => {
                                      const TypeIcon = getLessonTypeIcon(lesson)
                                      return (
                                        <TypeIcon
                                          size={16}
                                          className={`shrink-0 transition-colors ${
                                            isActive
                                              ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]'
                                              : 'text-cyan-400'
                                          }`}
                                        />
                                      )
                                    })()}

                                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                      <span
                                        className={`text-sm truncate transition-colors duration-200 ${
                                          isActive
                                            ? 'text-cyan-50 font-semibold'
                                            : 'text-zinc-400 font-medium group-hover:text-zinc-200'
                                        }`}
                                      >
                                        {lesson.title}
                                      </span>
                                      <span
                                        className={`text-xs tabular-nums ${
                                          isActive
                                            ? 'text-cyan-400/80'
                                            : 'text-zinc-500'
                                        }`}
                                      >
                                        {getLessonMeta(lesson)}
                                      </span>
                                    </div>

                                    {userPlan === 'FREE' && (
                                      <span
                                        className={`shrink-0 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${
                                          lesson.isFree
                                            ? 'bg-lime-500/10 text-lime-400 border border-lime-500/20'
                                            : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
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
