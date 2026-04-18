import { ConditionalAppShell } from '@/components/layout/conditional-app-shell'
import { getActiveCourse } from '@/actions/user/get-active-course'
import { getUserEnrolledList } from '@/actions/progress'

export async function AppShellWithData({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [enrolledCoursesData, activeCourse] = await Promise.all([
    getUserEnrolledList(),
    getActiveCourse(),
  ])

  return (
    <ConditionalAppShell
      initialUserCourses={enrolledCoursesData.userCourses || []}
      initialActiveCourse={activeCourse}
    >
      {children}
    </ConditionalAppShell>
  )
}
