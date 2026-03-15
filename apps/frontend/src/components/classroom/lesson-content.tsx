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
}

export const LessonContent = memo(function LessonContent({
  lesson,
  moduleTitle,
}: LessonContentProps) {
  const { lastModuleCompletion, showModuleStatsOnce } = useCourseModalStore()

  const shouldShowStats =
    lastModuleCompletion?.moduleCompleted && showModuleStatsOnce

  if (shouldShowStats) {
    return (
      <div className="flex-1 flex flex-col min-h-0 lg:mx-4 mx-0">
        <div className="flex-1 flex flex-col min-h-0 px-0 border border-[#25252A] rounded-[20px] bg-[#121214]">
          <div className="flex-1 min-h-0 flex flex-col lg:px-4 px-3 lg:pt-4 pt-3 pb-[54px] lg:pb-[84px]">
            <SkillStatsOverview />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 lg:mx-4 mx-0">
      <div className="flex-1 flex flex-col min-h-0 px-0 border border-[#25252A] lg:rounded-[20px] rounded-[28px] bg-[#121214]">
        <div className="flex-1 min-h-0 flex flex-col lg:px-2 px-0 lg:pt-2 pt-0 pb-[54px] lg:pb-[84px]">
          {lesson?.type === 'video' && (
            <VideoComponent
              description={lesson.description}
              title={lesson.title}
              src={lesson.video?.url ?? lesson.video_url ?? undefined}
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
