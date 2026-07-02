'use client'

import { useRouter } from 'next/navigation'
import { PrimaryButton } from '@/components/ui/primary-button'
import { Play } from '@phosphor-icons/react/dist/ssr'
import { Loader2 } from 'lucide-react'
import { useCourseEnrollment } from '@/hooks/use-course-enrollment'
import { useState, useEffect } from 'react'
import { getCourseRoadmapFresh } from '@/actions/course'
import {
  appendCourseIdToClassroomHref,
  findLessonContext,
  generateLessonUrl,
  pickContinueTargetLesson,
} from '@/utils/lesson-url'

interface ContinueCourseButtonProps {
  courseId: string
  courseSlug: string
  className?: string
}

export function ContinueCourseButton({
  courseId,
  className = '',
}: ContinueCourseButtonProps) {
  const router = useRouter()
  const { isEnrolled, isLoading, isCheckingEnrollment, handleStartCourse } =
    useCourseEnrollment(courseId)
  const [mounted, setMounted] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isButtonLoading =
    !mounted || isCheckingEnrollment || isLoading || isNavigating

  const handleClick: () => Promise<void> = async () => {
    if (isButtonLoading) return

    try {
      setIsNavigating(true)
      await handleStartCourse(courseId)

      const roadmapData = await getCourseRoadmapFresh(courseId)

      if (roadmapData?.modules) {
        const allLessons = roadmapData.modules
          .flatMap((module) => module?.groups || [])
          .flatMap((group) => group?.lessons || [])

        const targetLesson = pickContinueTargetLesson(allLessons)

        if (targetLesson) {
          const context = findLessonContext(
            targetLesson.id,
            roadmapData.modules,
          )

          if (context) {
            const url = generateLessonUrl(
              targetLesson,
              context.module,
              context.group,
            )
            router.push(appendCourseIdToClassroomHref(url, courseId))
            return
          }
        }
      }

      router.push(appendCourseIdToClassroomHref('/classroom', courseId))
    } catch {
      setIsNavigating(false)
    }
  }

  const getButtonText = () => {
    if (isEnrolled) return 'Continuar'
    return 'Inscrever'
  }

  return (
    <PrimaryButton
      onClick={handleClick}
      disabled={isButtonLoading}
      aria-busy={isButtonLoading}
      aria-label={
        isButtonLoading
          ? isCheckingEnrollment || !mounted
            ? 'Verificando inscrição'
            : 'Abrindo curso'
          : undefined
      }
      className={`w-full bg-blue-gradient-500 transition-all rounded-full lg:text-[18px] text-[16px] duration-300 hover:shadow-[0_0_12px_#00C8FF] font-semibold px-6 h-[54px] disabled:opacity-50 border-none min-w-[160px] ${className}`}
      suppressHydrationWarning
    >
      {isButtonLoading ? (
        <Loader2
          className="!size-6 animate-spin text-white motion-reduce:animate-none"
          aria-hidden
        />
      ) : (
        <span className="flex items-center gap-2">
          <Play size={24} weight="fill" className="text-white" />
          {getButtonText()}
        </span>
      )}
    </PrimaryButton>
  )
}
