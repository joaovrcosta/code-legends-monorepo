'use client'

import { useRouter } from 'next/navigation'
import { PrimaryButton } from '@/components/ui/primary-button'
import { Play } from '@phosphor-icons/react/dist/ssr'
import { useCourseEnrollment } from '@/hooks/use-course-enrollment'
import { useState, useEffect } from 'react'
import { getCourseRoadmapFresh } from '@/actions/course'
import {
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

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleClick: () => Promise<void> = async () => {
    try {
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
            router.push(url)
            return
          }
        }
      }

      router.push('/classroom')
    } catch { }
  }

  const getButtonText = () => {
    if (!mounted) return 'Continuar'
    if (isLoading) return 'Carregando...'
    if (isCheckingEnrollment) return 'Verificando...'
    if (isEnrolled) return 'Continuar'
    return 'Inscrever'
  }

  return (
    <PrimaryButton
      onClick={handleClick}
      disabled={isLoading || isCheckingEnrollment}
      className={`w-full bg-blue-gradient-500 transition-all rounded-full lg:text-[18px] text-[16px] duration-300 hover:shadow-[0_0_12px_#00C8FF] font-semibold px-6 h-[54px] disabled:opacity-50 border-none ${className}`}
      suppressHydrationWarning
    >
      <span className="flex items-center gap-2">
        <Play size={24} weight="fill" className="text-white" />
        {getButtonText()}
      </span>
    </PrimaryButton>
  )
}
