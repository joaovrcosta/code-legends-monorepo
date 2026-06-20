'use client'

import VideoComponent from '@/components/classroom/video'
import { ComponentsArticle } from '@/components/classroom/article/components'
import { QuizView } from '@/components/classroom/challenge/QuizView'
import { ProjectView } from '@/components/classroom/project-view'
import type { Lesson } from '@/types/roadmap'
import { memo } from 'react'
import { useCourseModalStore } from '@/stores/course-modal-store'
import { SkillStatsOverview } from '@/components/classroom/skill-stats-overview'

interface LessonContentProps {
  lesson: Lesson
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

  const shouldShowStats =
    lastModuleCompletion?.moduleCompleted && showModuleStatsOnce

  if (shouldShowStats) {
    return (
      <div className="mx-0 flex min-h-full w-full min-w-0 flex-1 flex-col">
        <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col border border-[#25252A] rounded-[20px] bg-surface px-0">
          <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col px-3 pt-3 lg:px-4 lg:pt-4 pb-4 lg:pb-5">
            <SkillStatsOverview />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-0 flex min-h-full w-full min-w-0 flex-1 flex-col">
      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col border-0 bg-surface px-0 lg:rounded-t-[20px] lg:border lg:border-[#25252A] lg:border-b-0">
        <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col px-0 pt-0 lg:px-4 lg:pt-4 pb-3 lg:pb-4">
          {lesson?.type === 'video' && (
            <VideoComponent
              description={lesson.description}
              title={lesson.title}
              src={lesson.video?.url ?? lesson.video_url ?? undefined}
              providerHandlerKey={lesson.video?.provider?.handlerKey}
              onVideoEnded={onVideoEnded}
              startPlaybackAutoplay={startVideoPlaybackAutoplay}
            />
          )}
          {(lesson?.type === 'article' || lesson?.type === 'text') && (
            <ComponentsArticle lesson={lesson} moduleTitle={moduleTitle} />
          )}
          {(lesson?.type === 'quiz' || lesson?.type === 'multi_quiz') && (
            <QuizView
              lessonId={lesson.id}
              title={lesson.title}
              description={lesson.description}
              challenges={lesson.quiz?.content ?? []}
              isMultiQuiz={lesson.type === 'multi_quiz'}
            />
          )}
          {lesson?.type === 'project' && (
            <ProjectView lesson={lesson} moduleTitle={moduleTitle} />
          )}
        </div>
      </div>
    </div>
  )
})
