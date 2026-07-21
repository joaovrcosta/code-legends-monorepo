'use client'

import dynamic from 'next/dynamic'
import { memo } from 'react'
import type { LessonWithContent, RoadmapLesson } from '@/types/roadmap'
import { useCourseModalStore } from '@/stores/course-modal-store'
import { SkillStatsOverview } from '@/components/classroom/skill-stats-overview'
import { usePrefetchNextLessonType } from '@/hooks/use-prefetch-next-lesson-type'
import {
  CLASSROOM_CONTENT_INSET_CLASS,
  CLASSROOM_CONTENT_PANEL_FULL_RADIUS_CLASS,
  CLASSROOM_CONTENT_PANEL_TOP_RADIUS_CLASS,
} from '@/lib/classroom-content-layout'

function LessonTypeSkeleton() {
  return (
    <div
      className="min-h-[24rem] w-full animate-pulse rounded-xl border border-white/5 bg-white/[0.02]"
      aria-busy
      aria-label="Carregando conteúdo da aula"
    />
  )
}

/** SSR explícito — não copiar ssr:false do Lab (first paint / SEO). */
const VideoComponent = dynamic(() => import('@/components/classroom/video'), {
  ssr: true,
  loading: () => <LessonTypeSkeleton />,
})

const ComponentsArticle = dynamic(
  () =>
    import('@/components/classroom/article/components').then(
      (m) => m.ComponentsArticle,
    ),
  {
    ssr: true,
    loading: () => <LessonTypeSkeleton />,
  },
)

const QuizView = dynamic(
  () =>
    import('@/components/classroom/challenge/QuizView').then((m) => m.QuizView),
  {
    ssr: true,
    loading: () => <LessonTypeSkeleton />,
  },
)

const ProjectView = dynamic(
  () =>
    import('@/components/classroom/project-view').then((m) => m.ProjectView),
  {
    ssr: true,
    loading: () => <LessonTypeSkeleton />,
  },
)

/** Sandpack — fora do grafo SSR. */
const LabView = dynamic(
  () => import('@/components/classroom/lab/lab-view').then((m) => m.LabView),
  {
    ssr: false,
    loading: () => <LessonTypeSkeleton />,
  },
)

interface LessonContentProps {
  lesson: RoadmapLesson | LessonWithContent
  courseTitle?: string
  moduleTitle?: string
  groupTitle?: string
  courseIcon?: string
  showModuleCompletionStats?: boolean
  onVideoEnded?: () => void
  startVideoPlaybackAutoplay?: boolean
}

export const LessonContent = memo(function LessonContent({
  lesson,
  moduleTitle,
  onVideoEnded,
  startVideoPlaybackAutoplay,
}: LessonContentProps) {
  const { lastModuleCompletion, showModuleStatsOnce } = useCourseModalStore()
  const contentLesson = lesson as LessonWithContent

  usePrefetchNextLessonType(lesson?.id)

  const shouldShowStats =
    lastModuleCompletion?.moduleCompleted && showModuleStatsOnce

  if (shouldShowStats) {
    return (
      <div className="mx-0 flex min-h-full w-full min-w-0 flex-1 flex-col">
        <div
          className={`flex min-h-0 w-full min-w-0 flex-1 flex-col border border-[#25252A] ${CLASSROOM_CONTENT_PANEL_FULL_RADIUS_CLASS} bg-surface px-0`}
        >
          <div
            className={`flex min-h-0 w-full min-w-0 flex-1 flex-col px-3 pt-3 ${CLASSROOM_CONTENT_INSET_CLASS} pb-4 lg:pb-5`}
          >
            <SkillStatsOverview />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-0 flex min-h-full w-full min-w-0 flex-1 flex-col">
      <div
        className={`flex min-h-0 w-full min-w-0 flex-1 flex-col border-0 bg-surface px-0 ${CLASSROOM_CONTENT_PANEL_TOP_RADIUS_CLASS} lg:border lg:border-[#25252A] lg:border-b-0`}
      >
        <div
          className={`relative flex min-h-0 w-full min-w-0 flex-1 flex-col px-0 pt-0 ${CLASSROOM_CONTENT_INSET_CLASS} pb-3 lg:pb-4`}
        >
          {lesson?.type === 'video' && (
            <VideoComponent
              description={lesson.description}
              title={lesson.title}
              src={
                contentLesson.video?.url ?? contentLesson.video_url ?? undefined
              }
              providerHandlerKey={contentLesson.video?.provider?.handlerKey}
              onVideoEnded={onVideoEnded}
              startPlaybackAutoplay={startVideoPlaybackAutoplay}
            />
          )}
          {(lesson?.type === 'article' || lesson?.type === 'text') && (
            <ComponentsArticle
              lesson={contentLesson}
              moduleTitle={moduleTitle}
            />
          )}
          {(lesson?.type === 'quiz' || lesson?.type === 'multi_quiz') && (
            <QuizView
              lessonId={lesson.id}
              title={lesson.title}
              description={lesson.description}
              challenges={contentLesson.quiz?.content ?? []}
              isMultiQuiz={lesson.type === 'multi_quiz'}
            />
          )}
          {lesson?.type === 'project' && (
            <ProjectView lesson={contentLesson} moduleTitle={moduleTitle} />
          )}
          {lesson?.type === 'lab' && (
            <LabView lesson={contentLesson} moduleTitle={moduleTitle} />
          )}
        </div>
      </div>
    </div>
  )
})
