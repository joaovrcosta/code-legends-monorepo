'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion'
import { ProgressRing } from '@/components/classroom/module-progress-ring'
import { Skeleton } from '@/components/skeleton'
import { useClassroomRoadmap } from '@/components/classroom/classroom-roadmap-context'
import useClassroomSidebarStore from '@/stores/classroom-sidebar'
import { useMemo, useCallback } from 'react'
import type { Lesson } from '@/types/roadmap'
import { useSyncClassroomModuleAccordion } from '@/hooks/use-sync-classroom-module-accordion'
import {
  appendCourseIdToClassroomHref,
  findLessonContext,
  generateLessonUrl,
} from '@/utils/lesson-url'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ChevronDown } from 'lucide-react'

function getLessonMeta(lesson: Lesson) {
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
              : lesson.type

  const duration = lesson.video?.duration ?? lesson.video_duration

  return duration ? `${typeLabel} • ${duration}` : typeLabel
}

export function LessonsAccordion() {
  const { roadmap, courseId, currentLessonId, isLoading } = useClassroomRoadmap()
  const { openModuleIds, setOpenModuleIds } = useClassroomSidebarStore()
  const { data: session } = useSession()
  const userPlan = (session?.user as { plan?: string } | undefined)?.plan
  const router = useRouter()

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
    (lesson: Lesson) => {
      if (!roadmap?.modules) return

      const context = findLessonContext(lesson.id, roadmap.modules)

      if (context) {
        const url = generateLessonUrl(lesson, context.module, context.group)
        router.push(
          courseId ? appendCourseIdToClassroomHref(url, courseId) : url,
        )
      }
    },
    [roadmap?.modules, router, courseId],
  )

  const currentModule = useMemo(() => {
    if (!organizedLessons || organizedLessons.length === 0) {
      return null
    }

    if (!currentLessonId) {
      return organizedLessons[0]
    }

    for (const moduleItem of organizedLessons) {
      for (const group of moduleItem.groups) {
        if (group.lessons.some((lesson) => lesson.id === currentLessonId)) {
          return moduleItem
        }
      }
    }

    return organizedLessons[0]
  }, [organizedLessons, currentLessonId])

  useSyncClassroomModuleAccordion(organizedLessons, currentModule)

  const showLoading =
    (isLoading && !roadmap) ||
    organizedLessons.length === 0 ||
    !currentModule

  if (showLoading) {
    return (
      <Accordion
        type="single"
        collapsible
        defaultValue="lessons"
        className="lg:hidden block"
      >
        <AccordionItem value="lessons" className="p-0">
          <div className="w-full mx-auto lg:rounded-[20px] rounded-none bg-[#0C0C0F] border border-[#2A2A2A] shadow-xl">
            <div className="w-full lg:px-8 px-6 lg:py-8 py-6">
              <div className="flex justify-between w-full items-center gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <Skeleton variant="circular" width={42} height={42} />
                  <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton variant="text" className="h-3 w-16" />
                    <Skeleton
                      variant="text"
                      className="h-5 w-full max-w-[180px]"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:px-8 px-6 pb-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton variant="text" className="h-3 w-24" />
                  <div className="flex flex-col gap-2">
                    {[1, 2].map((j) => (
                      <Skeleton
                        key={j}
                        variant="rectangular"
                        className="h-12 w-full"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AccordionItem>
      </Accordion>
    )
  }

  return (
    <Accordion
      type="multiple"
      value={openModuleIds}
      onValueChange={setOpenModuleIds}
      className="lg:hidden block"
    >
      <div className="w-full mx-auto lg:rounded-[20px] rounded-none bg-[#0C0C0F] border border-[#2A2A2A] shadow-xl overflow-hidden">
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
              className="border-b border-[#2A2A2A] last:border-b-0 px-0"
            >
              <AccordionTrigger className="group w-full lg:px-8 pl-3 pr-6 lg:py-6 py-5 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                <div className="flex items-center gap-3 text-left">
                  <ProgressRing
                    progress={progress}
                    moduleNumber={moduleIndex + 1}
                    isCurrent={isCurrentModule}
                  />
                  <div className="flex flex-col items-start gap-0.5 flex-1 min-w-0">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Level {String(moduleIndex + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={`font-bold text-[14px] truncate w-full ${isCurrentModule
                        ? 'bg-blue-gradient-500 bg-clip-text text-transparent'
                        : 'text-zinc-200'
                        }`}
                    >
                      {moduleItem.title.length > 24
                        ? `${moduleItem.title.slice(0, 24)}...`
                        : moduleItem.title}
                    </span>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-200 origin-center" />
              </AccordionTrigger>
              <AccordionContent className="lg:px-8 px-6 pb-6 pt-2 text-white overflow-y-auto">
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
                            className={`absolute left-[11px] top-0 bottom-0 w-[2px] bg-zinc-800/50 ${group.lessons.length === 0 ? 'hidden' : ''
                              }`}
                          />

                          <div className="flex flex-col">
                            {group.lessons.map((lesson, lessonIndex) => {
                              const isActive = currentLessonId === lesson.id
                              const isLastLesson =
                                lessonIndex === group.lessons.length - 1
                              const isPaidLesson = lesson.isFree === false
                              const isFreePlan = userPlan === 'FREE'

                              return (
                                <div
                                  key={lesson.id}
                                  className="relative pl-8 pt-1"
                                >
                                  {isLastLesson && (
                                    <div className="absolute left-0 top-4 bottom-0 w-[4px] bg-[#0C0C0F] z-10" />
                                  )}
                                  <div className="absolute left-0 top-0 h-[24px] w-[24px] border-b-2 border-l-2 border-zinc-800/50 rounded-bl-xl translate-y-[-50%]" />

                                  <button
                                    onClick={() => handleLessonClick(lesson)}
                                    className={`group relative flex items-center gap-3 w-full py-2 px-3 rounded-[12px] transition-colors duration-200 text-left ${isActive
                                      ? 'bg-zinc-800/50'
                                      : 'hover:bg-zinc-800/30 border border-transparent'
                                      } ${isFreePlan && isPaidLesson
                                        ? 'opacity-50'
                                        : ''
                                      }`}
                                  >
                                    <div
                                      className={`w-2 h-2 rounded-full shrink-0 transition-colors ${isActive
                                        ? 'bg-cyan-400'
                                        : 'bg-cyan-400/50'
                                        }`}
                                    />

                                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                      <span
                                        className={`text-sm truncate transition-colors duration-200 ${isActive
                                          ? 'text-cyan-50 font-semibold'
                                          : 'text-zinc-400 font-medium group-hover:text-zinc-200'
                                          }`}
                                      >
                                        {lesson.title}
                                      </span>
                                      <span
                                        className={`text-xs tabular-nums ${isActive
                                          ? 'text-slate-200'
                                          : 'text-zinc-500'
                                          }`}
                                      >
                                        {getLessonMeta(lesson)}
                                      </span>
                                    </div>

                                    {userPlan === 'FREE' && (
                                      <span
                                        className={`shrink-0 text-[10px] h-[24px] w-[24px] flex items-center justify-center font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${lesson.isFree
                                          ? 'bg-green-500/10 text-[#6ee7b7]'
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
      </div>
    </Accordion>
  )
}
