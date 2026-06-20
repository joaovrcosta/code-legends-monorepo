'use client'

import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { useClassroomRoadmap } from '@/components/classroom/classroom-roadmap-context'
import { useActiveCourseStore } from '@/stores/active-course-store'
import { classroomPageTitle } from '@/lib/classroom-page-title'
import type { ActiveCourse, EnrolledCourse } from '@/types/user-course.ts'

type ClassroomDocumentTitleProps = {
  initialActiveCourse: ActiveCourse | null
  initialUserCourses: EnrolledCourse[]
}

export function ClassroomDocumentTitle({
  initialActiveCourse,
  initialUserCourses,
}: ClassroomDocumentTitleProps) {
  const searchParams = useSearchParams()
  const courseIdFromUrl = (searchParams.get('courseId') || '').trim()
  const { activeCourse } = useActiveCourseStore()
  const { roadmap } = useClassroomRoadmap()

  const courseTitle = useMemo(() => {
    if (roadmap?.course?.title?.trim()) {
      return roadmap.course.title.trim()
    }

    if (courseIdFromUrl) {
      const enrolled = initialUserCourses.find(
        (entry) =>
          entry.courseId === courseIdFromUrl ||
          entry.course?.id === courseIdFromUrl,
      )
      if (enrolled?.course?.title?.trim()) {
        return enrolled.course.title.trim()
      }
    }

    const current = activeCourse ?? initialActiveCourse
    return current?.title?.trim() ?? null
  }, [
    roadmap?.course?.title,
    courseIdFromUrl,
    initialUserCourses,
    activeCourse,
    initialActiveCourse,
  ])

  useEffect(() => {
    document.title = classroomPageTitle(courseTitle)
  }, [courseTitle])

  return null
}
