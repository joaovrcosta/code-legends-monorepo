'use client'

import Image from 'next/image'
import codeLegendsLogo from '../../../public/code-legends-logo.svg'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import useClassroomSidebarStore from '@/stores/classroom-sidebar'
import { SkipBack, SkipForward } from '@phosphor-icons/react/dist/ssr'
import codeLegendsLogoMobile from '../../../public/logo-mobile.png'
import { UserDropdown } from '../user-dropdown'
import { StrikeSection } from '../strike-section'
import { useActiveCourseStore } from '@/stores/active-course-store'
import { useCourseModalStore } from '@/stores/course-modal-store'
import type { EnrolledCourse, ActiveCourse } from '@/types/user-course.ts'
import { useState, useMemo, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useRoadmapUpdater } from '@/hooks/use-roadmap-updater'
import type { RoadmapResponse } from '@/types/roadmap'

interface ClassroomHeaderProps {
  initialUserCourses: EnrolledCourse[]
  initialActiveCourse: ActiveCourse | null
}

export default function ClassroomHeader({
  initialUserCourses: _initialUserCourses,
  initialActiveCourse,
}: ClassroomHeaderProps) {
  const { toggleSidebar } = useClassroomSidebarStore()
  const { activeCourse, setActiveCourse } = useActiveCourseStore()
  const { currentLesson } = useCourseModalStore()
  const [isAutoplay, setIsAutoplay] = useState(false)
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null)

  useEffect(() => {
    setActiveCourse(initialActiveCourse ?? null)
  }, [
    initialActiveCourse?.id,
    initialActiveCourse?.title,
    initialActiveCourse?.slug,
    initialActiveCourse?.progress,
    initialActiveCourse?.isCompleted,
    initialActiveCourse?.currentModuleId,
    initialActiveCourse?.currentTaskId,
    setActiveCourse,
  ])

  useRoadmapUpdater({
    isOpen: true,
    courseId: activeCourse?.id,
    currentLessonId: currentLesson?.id,
    lessonCompletedTimestamp: null,
    onRoadmapUpdate: setRoadmap,
  })

  const currentActiveCourse = activeCourse || initialActiveCourse

  const coursePath = currentActiveCourse?.slug
    ? `/learn/paths/${currentActiveCourse.slug}`
    : '/learn/catalog'

  const courseName = currentActiveCourse?.title || 'Curso'

  const { moduleTitle, groupTitle } = useMemo(() => {
    let moduleTitleValue: string | undefined
    let groupTitleValue: string | undefined

    if (roadmap?.modules && currentLesson) {
      for (const moduleItem of roadmap.modules) {
        for (const groupItem of moduleItem.groups || []) {
          if (groupItem.lessons?.some((l) => l.id === currentLesson.id)) {
            moduleTitleValue = moduleItem.title
            groupTitleValue = groupItem.title
            break
          }
        }
        if (moduleTitleValue && groupTitleValue) break
      }
    }

    return { moduleTitle: moduleTitleValue, groupTitle: groupTitleValue }
  }, [roadmap?.modules, currentLesson])

  const breadcrumbPath = useMemo(() => {
    return [currentActiveCourse?.title, moduleTitle, groupTitle]
      .filter(Boolean)
      .join(' / ')
  }, [currentActiveCourse?.title, moduleTitle, groupTitle])

  return (
    <div className="fixed top-0 left-0 w-full z-40 bg-white shadow-md">
      <header className="fixed top-0 left-0 w-full z-40 bg-surface shadow-lg lg:py-0 pt-2 pb-0">
        <ul className="relative z-10 mx-auto flex w-full items-center justify-between px-4 pt-2 pb-4 lg:pt-4 lg:pb-4">
          <li className="flex items-center lg:space-x-6">
            <button
              onClick={toggleSidebar}
              className="text-white p-1 border border-[#25252a] rounded-lg lg:block hidden hover:bg-[#25252a] transition-colors duration-150 ease-in-out"
            >
              <Menu size={24} />
            </button>

            <div className="flex items-center space-x-4">
              <div>
                <Link href="/">
                  <Image
                    src={codeLegendsLogo}
                    alt="Code Legends"
                    className="lg:block hidden"
                  />
                </Link>
                <Link href="/">
                  <Image
                    src={codeLegendsLogoMobile}
                    alt="Code Legends"
                    className="lg:hidden block"
                    height={24}
                    width={24}
                  />
                </Link>
              </div>
            </div>
            {currentActiveCourse && (
              <Link href={coursePath}>
                <div className="border rounded-full border-[#25252a] py-2 lg:flex hidden items-center gap-2 px-3 hover:bg-[#25252a] cursor-pointer transition-colors duration-150 ease-in-out">
                  {currentActiveCourse?.icon ? (
                    <div className="w-6 h-6 rounded-full overflow-hidden">
                      <Image
                        src={currentActiveCourse.icon}
                        alt={courseName}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {courseName[0]?.toUpperCase() || 'C'}
                      </span>
                    </div>
                  )}

                  <span className="text-[14px] truncate max-w-[160px]">
                    {courseName}
                  </span>
                </div>
              </Link>
            )}
            <div className="p-2 lg:flex hidden px-3 space-x-2">
              <SkipBack size={24} />
              <SkipForward size={24} weight="fill" />
            </div>
            <div className="p-2 lg:flex hidden px-3 space-x-2">
              <p className="text-white text-sm truncate max-w-[200px]">
                {currentLesson?.title || 'Introdução'}
              </p>
            </div>
          </li>

          <li className="flex lg:space-x-2 space-x-1 items-center ">
            <div className="flex items-center lg:space-x-4 space-x-4">
              <StrikeSection />
              <UserDropdown />
            </div>
          </li>
        </ul>

        <div className="relative z-0 lg:hidden block border-t border-[#25252A]">
          <div className="bg-surface/90">
            <div className="flex items-center justify-between px-4 py-2">
              {/* Lado esquerdo */}
              <div className="flex items-center gap-3 flex-1 min-w-0 mr-3">
                <Link
                  href={`/learn/paths/${currentActiveCourse?.slug}`}
                  className="flex items-center justify-center"
                >
                  <button className="flex-shrink-0 text-white hover:text-[#00C8FF] transition-colors">
                    <ArrowLeft size={20} />
                  </button>
                </Link>

                <div className="h-6 w-px bg-[#25252A]" />

                {/* Ícone do curso */}
                {currentActiveCourse?.icon ? (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden">
                    <Image
                      src={currentActiveCourse.icon}
                      alt={courseName}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {courseName[0]?.toUpperCase() || 'C'}
                    </span>
                  </div>
                )}

                {/* Breadcrumb */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#C4C4CC] truncate">
                    {breadcrumbPath || courseName}
                  </p>
                </div>
              </div>

              {/* Lado direito */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Reprodução automática */}
                <button
                  onClick={() => setIsAutoplay(!isAutoplay)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${isAutoplay ? 'bg-[#00C8FF]' : 'bg-[#25252A]'
                    }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isAutoplay ? 'translate-x-5' : 'translate-x-0'
                      }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  )
}
