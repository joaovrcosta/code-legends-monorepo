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
    <div className="flex-1 flex flex-col min-h-0">
      {/* <div className="sticky top-[63px] z-40 lg:px-4 px-0 lg:pt-2 pt-0 hidden lg:block">
        <LessonHeader
          courseTitle={courseTitle}
          moduleTitle={moduleTitle}
          groupTitle={groupTitle}
          courseIcon={courseIcon}
          title={lesson.title}
        />
      </div> */}

      <div className="flex-1 flex flex-col min-h-0 lg:px-4 px-0">
        <div className="flex-1 min-h-0 flex flex-col lg:px-4 px-0 lg:pt-4 pt-0 pb-[54px] lg:pb-[84px]">
          {lesson?.type === 'video' && (
            <VideoComponent
              description={lesson.description}
              title={lesson.title}
              src={lesson.video_url}
            />
          )}
          {lesson?.type === 'article' && <ComponentsArticle />}
          {lesson?.type === 'quiz' && <p>Quiz bb</p>}
          {lesson?.type === 'project' && <p>Projeto</p>}
        </div>
      </div>
    </div>
  )
})
