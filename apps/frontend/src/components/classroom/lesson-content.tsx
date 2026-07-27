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

function LabBone({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-white/[0.06] ${className}`} />
  )
}

/** Espelha o layout do LabView: sidebar (descrição/instruções) + playground. */
function LabLoading() {
  return (
    <div
      className="flex min-h-[70vh] w-full flex-col gap-4 lg:h-[calc(100vh-12rem)]"
      aria-busy
      aria-label="Carregando lab"
    >
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="min-h-0 w-full overflow-hidden rounded-lg border border-[#25252A] bg-[#101012] lg:w-[320px] lg:shrink-0">
          <div className="border-b border-[#25252A] px-4 py-3">
            <LabBone className="h-3 w-24" />
          </div>
          <div className="space-y-3 px-4 py-4">
            <LabBone className="h-3 w-2/3" />
            <LabBone className="h-3 w-full" />
            <LabBone className="h-3 w-[90%]" />
            <LabBone className="h-3 w-4/5" />
          </div>
          <div className="border-t border-[#25252A] px-4 py-3">
            <LabBone className="h-3 w-28" />
          </div>
          <div className="space-y-2.5 px-4 py-4">
            <LabBone className="h-8 w-full rounded-lg" />
            <LabBone className="h-8 w-full rounded-lg" />
            <LabBone className="h-8 w-full rounded-lg" />
            <LabBone className="h-8 w-[85%] rounded-lg" />
          </div>
        </aside>

        <div className="relative hidden w-3 shrink-0 items-stretch justify-center lg:flex">
          <span className="my-auto h-10 w-1 rounded-full bg-white/15" />
        </div>

        <div className="mt-4 flex min-h-0 min-w-0 flex-1 flex-col lg:mt-0">
          <div className="flex min-h-[420px] flex-1 flex-col overflow-hidden rounded-lg border border-[#25252A] bg-[#1A1A1A]">
            <div className="flex items-center gap-2 border-b border-[#25252A] bg-[#2a2d31] px-2 py-2">
              <LabBone className="h-6 w-20" />
            </div>
            <div className="flex min-h-0 flex-1">
              <div className="min-w-0 flex-1 space-y-2.5 p-4">
                <LabBone className="h-3 w-[40%]" />
                <LabBone className="h-3 w-[72%]" />
                <LabBone className="h-3 w-[55%]" />
                <LabBone className="h-3 w-[88%]" />
                <LabBone className="h-3 w-[63%]" />
                <LabBone className="h-3 w-[78%]" />
                <LabBone className="h-3 w-[45%]" />
                <LabBone className="h-3 w-[70%]" />
              </div>
            </div>
            <div className="flex items-center gap-2 border-t border-[#25252A] bg-[#373A3E] px-3 py-2.5">
              <LabBone className="h-[42px] w-[110px] rounded-[16px]" />
              <LabBone className="h-[42px] w-[42px] rounded-[16px]" />
              <div className="mx-1 h-6 w-px bg-white/10" />
              <LabBone className="h-6 w-14" />
              <LabBone className="h-6 w-16" />
              <LabBone className="h-6 w-14" />
            </div>
          </div>
        </div>
      </div>
    </div>
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
    loading: () => <LabLoading />,
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
