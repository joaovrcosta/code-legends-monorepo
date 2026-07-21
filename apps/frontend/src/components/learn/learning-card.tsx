'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Article,
  Question,
  VideoCamera,
} from '@phosphor-icons/react/dist/ssr'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { getCourseRoadmap } from '@/actions/course'
import {
  appendCourseIdToClassroomHref,
  findLessonContext,
  generateLessonUrl,
  pickContinueTargetLesson,
} from '@/utils/lesson-url'
import type { Lesson } from '@/types/roadmap'

type NextLessonInfo = {
  title: string
  typeLabel: string
  durationLabel: string | null
  href: string
}

interface LearningCardProps {
  title: string
  slug: string
  progress: number
  icon?: string
  courseId: string
  courseKind?: 'CATALOG' | 'PATH_UNIT'
  isCompleted?: boolean
}

/** Grid pai: a coluna da direita (360px) alinha todos os cards na mesma divisória. */
export const learningCardsListClassName =
  'mt-6 flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-y-4'

function mapLessonTypeLabel(lesson: Lesson): string {
  if (lesson.type === 'video') return 'Vídeo'
  if (lesson.type === 'quiz' || lesson.type === 'multi_quiz') return 'Quiz'
  if (lesson.type === 'article' || lesson.type === 'text') return 'Leitura'
  if (lesson.type === 'project') return 'Projeto'
  if (lesson.type === 'lab') return 'Lab'
  return 'Conteúdo'
}

function mapLessonDuration(lesson: Lesson): string | null {
  const raw =
    lesson.video?.duration ?? lesson.video_duration ?? null
  if (!raw) return null
  if (typeof raw === 'string' && /min/i.test(raw)) return raw
  const minutes = Number(raw)
  if (Number.isFinite(minutes) && minutes > 0) {
    return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`
  }
  return String(raw)
}

function LessonTypeIcon({ type }: { type: Lesson['type'] }) {
  if (type === 'video') {
    return <VideoCamera size={14} className="shrink-0 text-[#737373]" />
  }
  if (type === 'quiz') {
    return <Question size={14} className="shrink-0 text-[#737373]" />
  }
  if (type === 'article') {
    return <Article size={14} className="shrink-0 text-[#737373]" />
  }
  return <Article size={14} className="shrink-0 text-[#737373]" />
}

function NextLessonSkeleton() {
  return (
    <div
      className="flex h-full min-h-[108px] flex-col"
      aria-busy
      aria-label="Carregando próxima lição"
    >
      <div className="min-w-0 flex-1">
        <Skeleton className="h-4 w-full max-w-[280px] rounded-md" />
        <Skeleton className="mt-2 h-4 w-[88%] max-w-[240px] rounded-md" />
        <div className="mt-2 flex items-center gap-1.5">
          <Skeleton className="h-3.5 w-3.5 shrink-0 rounded-sm" />
          <Skeleton className="h-3 w-24 rounded-md" />
        </div>
      </div>

      <div className="mt-auto flex justify-end pt-4">
        <Skeleton className="h-10 w-[108px] rounded-full" />
      </div>
    </div>
  )
}

export function LearningCard({
  title,
  slug,
  progress,
  icon,
  courseId,
  courseKind = 'CATALOG',
  isCompleted = false,
}: LearningCardProps) {
  const router = useRouter()
  const [nextLesson, setNextLesson] = useState<NextLessonInfo | null>(null)
  const [nextLessonType, setNextLessonType] = useState<Lesson['type']>('video')
  const [isLoadingNext, setIsLoadingNext] = useState(true)
  const [isNavigating, setIsNavigating] = useState(false)

  const typeLabel =
    courseKind === 'PATH_UNIT' ? 'Unidade extra' : 'Curso'

  useEffect(() => {
    let cancelled = false

    async function loadNextLesson() {
      try {
        setIsLoadingNext(true)
        const roadmap = await getCourseRoadmap(courseId)
        if (cancelled || !roadmap?.modules) return

        const allLessons = roadmap.modules.flatMap((m) =>
          (m.groups || []).flatMap((g) => g.lessons || []),
        )
        const targetLesson = pickContinueTargetLesson(allLessons)

        if (!targetLesson) {
          setNextLesson(null)
          return
        }

        const context = findLessonContext(targetLesson.id, roadmap.modules)
        if (!context) {
          setNextLesson(null)
          return
        }

        const href = appendCourseIdToClassroomHref(
          generateLessonUrl(targetLesson, context.module, context.group),
          courseId,
        )

        setNextLessonType(targetLesson.type)
        setNextLesson({
          title: targetLesson.title,
          typeLabel: mapLessonTypeLabel(targetLesson),
          durationLabel: mapLessonDuration(targetLesson),
          href,
        })
      } catch (error) {
        console.error('Erro ao carregar próxima lição:', error)
        if (!cancelled) setNextLesson(null)
      } finally {
        if (!cancelled) setIsLoadingNext(false)
      }
    }

    void loadNextLesson()
    return () => {
      cancelled = true
    }
  }, [courseId])

  const handleResume = () => {
    if (!nextLesson?.href || isNavigating) return
    setIsNavigating(true)
    router.push(nextLesson.href)
  }

  const actionLabel = isCompleted
    ? 'Revisar'
    : progress > 0
      ? 'Retomar'
      : 'Começar'

  const courseOverviewHref = `/learn/paths/${slug || courseId}`

  return (
    <div className="flex flex-col overflow-hidden rounded-[20px] border border-[#25252A] bg-primary lg:col-span-2 lg:grid lg:grid-cols-subgrid">
      <div className="flex min-h-[168px] flex-col justify-between p-5 lg:p-6">
          <div>
            {icon ? (
              <div className="mb-4 h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={icon}
                  alt=""
                  width={40}
                  height={40}
                  className="h-full w-full object-contain"
                />
              </div>
            ) : null}

            <h3 className="line-clamp-2 text-lg font-bold leading-snug text-white">
              {title}
            </h3>

            <p className="mt-2 text-xs text-[#737373]">
              {typeLabel} · {progress}% completo
              {isCompleted ? ' · Concluído' : ''}
            </p>
          </div>

          <Progress
            value={progress}
            className="mt-5 h-[2px] bg-[#25252A] [&>div>div]:shadow-none"
          />
        </div>

      <div className="flex min-h-[168px] flex-col border-t border-[#25252A] p-5 lg:border-l lg:border-t-0 lg:p-6">
          {isLoadingNext ? (
            <NextLessonSkeleton />
          ) : nextLesson && !isCompleted ? (
            <div className="flex h-full min-h-[108px] flex-col">
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-semibold leading-snug text-white">
                  {nextLesson.title}
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-[#737373]">
                  <LessonTypeIcon type={nextLessonType} />
                  <span>
                    {nextLesson.typeLabel}
                    {nextLesson.durationLabel
                      ? ` (${nextLesson.durationLabel})`
                      : ''}
                  </span>
                </div>
              </div>

              <div className="mt-auto flex justify-end pt-4">
                <Button
                  onClick={handleResume}
                  disabled={isNavigating}
                  aria-busy={isNavigating}
                  className="h-10 shrink-0 rounded-full bg-blue-gradient-500 px-6 font-semibold text-white hover:opacity-90 disabled:opacity-50"
                >
                  {isNavigating ? (
                    <Loader2 className="!size-4 animate-spin text-white" />
                  ) : (
                    actionLabel
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[108px] flex-col">
              <p className="text-sm text-[#737373]">
                {isCompleted
                  ? 'Curso concluído. Revise o conteúdo quando quiser.'
                  : 'Pronto para começar sua jornada neste conteúdo.'}
              </p>
              <div className="mt-auto flex justify-end pt-4">
                <Button
                  asChild
                  className="h-10 shrink-0 rounded-full bg-blue-gradient-500 px-6 font-semibold text-white hover:opacity-90"
                >
                  <Link href={courseOverviewHref}>{actionLabel}</Link>
                </Button>
              </div>
            </div>
          )}
      </div>
    </div>
  )
}
