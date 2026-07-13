'use client'

import { Button } from '@/components/ui/button'
import { useCourseModalStore } from '@/stores/course-modal-store'
import { useActiveCourseStore } from '@/stores/active-course-store'
import { Menu, X } from 'lucide-react'
import { LessonContent } from '@/components/classroom/lesson-content'
import { LevelProgressBar } from '@/components/learn/level-progress-bar'
import { SkipForward } from '@phosphor-icons/react'
import { SkipBack, LockOpen } from '@phosphor-icons/react/dist/ssr'
import { useEffect, useMemo, useCallback, useState } from 'react'
import { unlockNextModule } from '@/actions/course'
import { isLessonAccessibleForUser } from '@/utils/lesson-access'
import type { RoadmapLesson } from '@/types/roadmap'
import { useClassroomRoadmap } from '@/components/classroom/classroom-roadmap-context'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  generateLessonUrl,
  findLessonContext,
  pickContinueTargetLesson,
} from '@/utils/lesson-url'
import { useSession } from 'next-auth/react'
import { classroomFooterOffset } from '@/lib/classroom-sidebar-layout'
import useClassroomSidebarStore from '@/stores/classroom-sidebar'

export default function ClassroomPage() {
  const { data: session } = useSession()
  const userPlan = (session?.user as { plan?: string } | undefined)?.plan
  const isPaidUser = userPlan === 'PRO' || userPlan === 'PREMIUM'

  const {
    currentLesson,
    lessons,
    currentIndex,
    setLessonsForPage,
    setModuleUnlockedTimestamp,
  } = useCourseModalStore()

  const { activeCourse, fetchActiveCourse } = useActiveCourseStore()
  const { isOpen: isSidebarOpen } = useClassroomSidebarStore()
  const { roadmap, refreshRoadmap } = useClassroomRoadmap()
  const [isUnlocking, setIsUnlocking] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!roadmap?.modules || lessons.length > 0) return
    const all = roadmap.modules
      .flatMap((m) => m?.groups || [])
      .flatMap((g) => g?.lessons || [])
    if (all.length === 0) return
    const firstUnlockedIndex = Math.max(
      0,
      all.findIndex((l) => isLessonAccessibleForUser(l, isPaidUser)),
    )
    setLessonsForPage(all, firstUnlockedIndex >= 0 ? firstUnlockedIndex : 0)
  }, [roadmap?.modules, lessons.length, setLessonsForPage, isPaidUser])

  useEffect(() => {
    const redirectToTargetLesson = (
      modules: NonNullable<typeof roadmap>['modules'],
    ) => {
      const allLessons = modules
        .flatMap((module) => module?.groups || [])
        .flatMap((group) => group?.lessons || [])

      const targetLesson = pickContinueTargetLesson(
        allLessons,
        (l) => isLessonAccessibleForUser(l, isPaidUser),
      )

      if (targetLesson) {
        const context = findLessonContext(targetLesson.id, modules)
        if (context) {
          const url = generateLessonUrl(
            targetLesson,
            context.module,
            context.group,
          )
          router.push(url)
          return
        }
      }

      const startIndex = targetLesson
        ? allLessons.findIndex((lesson) => lesson.id === targetLesson.id)
        : 0
      setLessonsForPage(allLessons, startIndex >= 0 ? startIndex : 0)
    }

    const loadLessons = async () => {
      if (!activeCourse?.id) {
        await fetchActiveCourse()
        await new Promise((resolve) => setTimeout(resolve, 200))
        const updatedActiveCourse = useActiveCourseStore.getState().activeCourse
        if (!updatedActiveCourse?.id || lessons.length > 0) return
        if (!roadmap?.modules) return
        redirectToTargetLesson(roadmap.modules)
        return
      }

      if (lessons.length > 0) return
      if (!roadmap?.modules) return

      redirectToTargetLesson(roadmap.modules)
    }

    void loadLessons()
  }, [
    activeCourse?.id,
    setLessonsForPage,
    lessons.length,
    router,
    fetchActiveCourse,
    isPaidUser,
    roadmap?.modules,
  ])

  const {
    hasNextLesson,
    hasPreviousLesson,
    nextLesson,
    previousLesson,
    isNextLessonLocked,
  } = useMemo(() => {
    const hasNext = currentIndex < lessons.length - 1
    const hasPrevious = currentIndex > 0
    const next = hasNext ? lessons[currentIndex + 1] : null
    const previous = hasPrevious ? lessons[currentIndex - 1] : null
    const isNextLocked = next?.status === 'locked'

    return {
      hasNextLesson: hasNext,
      hasPreviousLesson: hasPrevious,
      nextLesson: next,
      previousLesson: previous,
      isNextLessonLocked: isNextLocked,
    }
  }, [currentIndex, lessons])

  const navigateToLesson = useCallback(
    (lesson: RoadmapLesson) => {
      if (!roadmap?.modules) return

      const context = findLessonContext(lesson.id, roadmap.modules)
      if (context) {
        const url = generateLessonUrl(lesson, context.module, context.group)
        router.push(url)
      }
    },
    [roadmap?.modules, router],
  )

  const handleNextLesson = useCallback(() => {
    if (currentLesson?.status !== 'completed') {
      return
    }
    if (nextLesson && !isNextLessonLocked) {
      navigateToLesson(nextLesson)
    }
  }, [currentLesson?.status, nextLesson, isNextLessonLocked, navigateToLesson])

  const handlePreviousLesson = useCallback(() => {
    if (previousLesson) {
      navigateToLesson(previousLesson)
    }
  }, [previousLesson, navigateToLesson])

  const canUnlockNextModule = useMemo(() => {
    return roadmap?.course.canUnlockNextModule ?? false
  }, [roadmap?.course.canUnlockNextModule])

  const { moduleTitle, groupTitle } = useMemo(() => {
    let moduleTitleValue: string | undefined
    let groupTitleValue: string | undefined

    if (roadmap?.modules && currentLesson) {
      for (const moduleItem of roadmap.modules) {
        for (const groupItem of moduleItem.groups || []) {
          if (groupItem.lessons?.some((l) => l.id === currentLesson.id)) {
            moduleTitleValue = moduleItem.title
            groupTitleValue = groupItem.title
            break
          }
        }
        if (moduleTitleValue && groupTitleValue) break
      }
    }

    return { moduleTitle: moduleTitleValue, groupTitle: groupTitleValue }
  }, [roadmap?.modules, currentLesson])

  const handleUnlockNext = useCallback(async () => {
    if (!activeCourse?.id) return

    setIsUnlocking(true)
    try {
      const result = await unlockNextModule(activeCourse.id)
      if (result.success) {
        setModuleUnlockedTimestamp()
        const updatedRoadmap = await refreshRoadmap({ fresh: true, delay: 300 })

        if (updatedRoadmap?.modules) {
          const allLessons = updatedRoadmap.modules
            .flatMap((module) => module?.groups || [])
            .flatMap((group) => group?.lessons || [])

          const nextModuleNumber = updatedRoadmap.course.nextModule
          let nextLessonIndex = 0

          if (nextModuleNumber && updatedRoadmap.modules[nextModuleNumber - 1]) {
            const nextModule = updatedRoadmap.modules[nextModuleNumber - 1]

            for (const group of nextModule.groups || []) {
              const firstUnlockedLesson = group.lessons?.find((lesson) =>
                isLessonAccessibleForUser(lesson, isPaidUser),
              )

              if (firstUnlockedLesson) {
                nextLessonIndex = allLessons.findIndex(
                  (lesson) => lesson.id === firstUnlockedLesson.id,
                )
                break
              }
            }

            if (nextLessonIndex === -1) {
              nextLessonIndex = allLessons.findIndex((lesson) =>
                isLessonAccessibleForUser(lesson, isPaidUser),
              )
            }
          } else {
            nextLessonIndex = allLessons.findIndex((lesson) =>
              isLessonAccessibleForUser(lesson, isPaidUser),
            )
          }

          if (nextLessonIndex === -1) {
            nextLessonIndex = 0
          }

          setLessonsForPage(allLessons, nextLessonIndex)
        }
      } else {
        console.error('Erro ao desbloquear módulo:', result.error)
        alert(result.error || 'Erro ao desbloquear módulo')
      }
    } catch (unlockError) {
      console.error('Erro ao desbloquear módulo:', unlockError)
      alert('Erro ao desbloquear módulo')
    } finally {
      setIsUnlocking(false)
    }
  }, [
    activeCourse?.id,
    setModuleUnlockedTimestamp,
    refreshRoadmap,
    setLessonsForPage,
    isPaidUser,
  ])

  if (!activeCourse) {
    return (
      <div className="flex flex-1 items-center justify-center w-full h-full">
        <div className="text-center text-white">
          <p className="text-muted mb-4">
            Nenhum curso ativo encontrado. Selecione um curso para começar.
          </p>
          <Link href="/learn/catalog">
            <Button>Explorar cursos</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!currentLesson) {
    return (
      <div className="flex flex-1 flex-col pt-[111px] lg:pt-0">
        <header className="h-[63px] py-4 pb-0 bg-transparent rounded-t-[20px] lg:border-b lg:border-[#25252A] border-none lg:mb-2 mb-0 flex-shrink-0 lg:block hidden">
          <div className="flex items-center justify-between w-full px-4">
            <div className="lg:hidden flex">
              <Menu size={32} className="text-white" />
            </div>
            <Link href="/learn">
              <X size={32} className="text-white cursor-pointer" />
            </Link>
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted">
            {roadmap?.modules?.length
              ? 'Selecione uma aula na lista ao lado'
              : 'Carregando aulas...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col pt-[110px] lg:pt-0">
      {currentLesson && (
        <LessonContent
          lesson={currentLesson}
          courseTitle={activeCourse?.title}
          moduleTitle={moduleTitle}
          groupTitle={groupTitle}
          courseIcon={activeCourse?.icon}
        />
      )}

      <footer
        className={`fixed left-0 right-0 bottom-0 lg:bg-[#0C0C0F] bg-[#0C0C0F] lg:border-t lg:border-t-[#25252A] border-t border-t-[#25252A] lg:rounded-b-[20px] rounded-b-none p-0 z-50 ${classroomFooterOffset(isSidebarOpen)}`}
      >
        <div className="flex justify-between w-full m-0 p-0">
          <Button
            variant="outline"
            className="h-[64px] lg:min-h-[84px] w-1/2 max-w-[320px] bg-black rounded-none text-base border-none 
      lg:rounded-bl-[20px] rounded-bl-none disabled:opacity-50"
            onClick={handlePreviousLesson}
            disabled={!hasPreviousLesson}
          >
            <SkipBack weight="fill" size={16} />
            Aula anterior
          </Button>
          <div className="w-full lg:flex items-center justify-center px-8 hidden">
            <LevelProgressBar />
          </div>
          {canUnlockNextModule ? (
            <Button
              variant="outline"
              onClick={handleUnlockNext}
              disabled={isUnlocking}
              className="h-[64px] lg:min-h-[84px] w-1/2 max-w-[320px] rounded-none text-base bg-blue-gradient-500 border-none
      lg:rounded-br-[20px] rounded-br-none disabled:opacity-50"
            >
              {isUnlocking ? (
                'Desbloqueando...'
              ) : (
                <>
                  Desbloquear módulo <LockOpen weight="fill" size={16} />
                </>
              )}
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleNextLesson}
              disabled={
                !hasNextLesson ||
                isNextLessonLocked ||
                currentLesson?.status !== 'completed'
              }
              className="h-[64px] lg:min-h-[84px] w-1/2 max-w-[320px] rounded-none text-base bg-black border-none
      lg:rounded-br-[20px] rounded-br-none disabled:opacity-50"
            >
              Próxima <SkipForward weight="fill" size={16} />
            </Button>
          )}
        </div>
      </footer>
    </div>
  )
}
