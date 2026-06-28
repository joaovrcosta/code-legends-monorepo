'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet'
import { X } from 'lucide-react'
import { useClassroomMobileContentStore } from '@/stores/classroom-mobile-content-store'
import { useClassroomRoadmap } from '@/components/classroom/classroom-roadmap-context'
import { LessonsList } from '@/components/classroom/lessons-list'
import { ClassroomSidebarSkeleton } from '@/components/classroom/classroom-sidebar-skeleton'

export function ClassroomMobileContentSheet() {
  const pathname = usePathname()
  const { isOpen, close, open } = useClassroomMobileContentStore()
  const { roadmap, isLoading, courseId, currentLessonId, activeLessonId, paywallLessonId, allLessons } =
    useClassroomRoadmap()

  useEffect(() => {
    close()
  }, [pathname, close])

  const showSkeleton = isLoading && !roadmap

  return (
    <Sheet open={isOpen} onOpenChange={(next) => (next ? open() : close())}>
      <SheetContent
        side="bottom"
        className="flex h-[min(92dvh,900px)] flex-col gap-0 border-[#25252A] bg-surface p-0 text-white rounded-t-[20px] [&>button]:hidden"
      >
        <div className="shrink-0 border-b border-[#25252A] px-4 pb-3 pt-3">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#3f3f47] lg:hidden" />
          <div className="flex items-center justify-between gap-3">
            <SheetTitle className="text-left text-base font-medium text-[#C4C4CC]">
              Conteúdo do curso
            </SheetTitle>
            <SheetClose
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#C4C4CC] transition-colors hover:bg-[#25252a] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
              aria-label="Fechar conteúdo do curso"
            >
              <X className="h-6 w-6" />
            </SheetClose>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-[max(1rem,env(safe-area-inset-bottom))] scrollbar-classroom">
          {showSkeleton ? (
            <ClassroomSidebarSkeleton />
          ) : (
            <LessonsList
              lessons={allLessons}
              currentLessonId={currentLessonId}
              activeLessonId={activeLessonId}
              paywallLessonId={paywallLessonId}
              roadmap={roadmap}
              courseId={courseId}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
