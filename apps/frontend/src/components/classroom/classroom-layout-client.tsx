'use client'

import type { ReactNode } from 'react'
import { Suspense } from 'react'
import ClassroomHeader from '@/components/classroom/header'
import { ClassroomRoadmapProvider } from '@/components/classroom/classroom-roadmap-context'
import { ClassroomShell } from '@/components/classroom/classroom-shell'
import { ClassroomMobileContentSheet } from '@/components/classroom/classroom-mobile-content-sheet'
import { ClassroomDocumentTitle } from '@/components/classroom/classroom-document-title'
import type { ActiveCourse, EnrolledCourse } from '@/types/user-course.ts'

type ClassroomLayoutClientProps = {
  children: ReactNode
  initialUserCourses: EnrolledCourse[]
  initialActiveCourse: ActiveCourse | null
}

function ClassroomLayoutInner({
  children,
  initialUserCourses,
  initialActiveCourse,
}: ClassroomLayoutClientProps) {
  return (
    <ClassroomRoadmapProvider>
      <ClassroomDocumentTitle
        initialActiveCourse={initialActiveCourse}
        initialUserCourses={initialUserCourses}
      />
      <ClassroomHeader
        initialUserCourses={initialUserCourses}
        initialActiveCourse={initialActiveCourse}
      />
      <ClassroomMobileContentSheet />
      <ClassroomShell>{children}</ClassroomShell>
    </ClassroomRoadmapProvider>
  )
}

export function ClassroomLayoutClient(props: ClassroomLayoutClientProps) {
  return (
    <Suspense fallback={null}>
      <ClassroomLayoutInner {...props} />
    </Suspense>
  )
}
