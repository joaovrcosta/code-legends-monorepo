'use client'

import VideoComponent from '@/components/classroom/video'
import { ComponentsArticle } from '@/components/classroom/article/components'
import type { Lesson } from '@/types/roadmap'
import { memo } from 'react'

interface LessonContentProps {
  lesson: Lesson
  courseTitle?: string
  moduleTitle?: string
  groupTitle?: string
  courseIcon?: string
}

export const LessonContent = memo(function LessonContent({
  lesson,
}: LessonContentProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0 lg:mx-4 mx-0">
      <div className="flex-1 flex flex-col min-h-0 px-0 border border-[#25252A] rounded-[20px] bg-[#121214]">
        <div className="flex-1 min-h-0 flex flex-col lg:px-2 px-0 lg:pt-2 pt-0 pb-[54px] lg:pb-[84px]">
          {lesson?.type === 'video' && (
            <VideoComponent
              description={lesson.description}
              title={lesson.title}
              src={lesson.video?.url ?? lesson.video_url ?? undefined}
            />
          )}
          {(lesson?.type === 'article' || lesson?.type === 'text') && (
            <ComponentsArticle lesson={lesson} />
          )}
          {lesson?.type === 'quiz' && <p>Quiz bb</p>}
          {lesson?.type === 'project' && <p>Projeto</p>}
        </div>
      </div>
    </div>
  )
})
