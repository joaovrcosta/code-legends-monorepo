'use client'

import type { ReactNode } from 'react'
import { ClassroomSidebarAside } from '@/components/classroom/classroom-sidebar-aside'
import { ClassroomSidebarSkeleton } from '@/components/classroom/classroom-sidebar-skeleton'
import { LessonsList } from '@/components/classroom/lessons-list'
import { useClassroomRoadmap } from '@/components/classroom/classroom-roadmap-context'
import { classroomContentOffset } from '@/lib/classroom-sidebar-layout'
import useClassroomSidebarStore from '@/stores/classroom-sidebar'
import { cn } from '@/lib/utils'

type ClassroomShellProps = {
  children: ReactNode
}

export function ClassroomShell({ children }: ClassroomShellProps) {
  const { isOpen: isSidebarOpen } = useClassroomSidebarStore()
  const { roadmap, isLoading, courseId, currentLessonId, allLessons } =
    useClassroomRoadmap()

  const showSidebarSkeleton = isLoading && !roadmap

  return (
    <div className="flex h-[100dvh] w-full min-h-[calc(100dvh-78px)]">
      <ClassroomSidebarAside>
        {showSidebarSkeleton ? (
          <ClassroomSidebarSkeleton />
        ) : (
          <LessonsList
            lessons={allLessons}
            currentLessonId={currentLessonId}
            roadmap={roadmap}
            courseId={courseId}
          />
        )}
      </ClassroomSidebarAside>

      <main
        className={cn(
          'flex min-h-0 flex-1 flex-col w-full max-w-full overflow-x-hidden bg-surface text-white',
          classroomContentOffset(isSidebarOpen),
        )}
      >
        {children}
      </main>
    </div>
  )
}
