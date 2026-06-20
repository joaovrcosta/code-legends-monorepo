import type { Metadata } from "next";
import { ClassroomLayoutClient } from "@/components/classroom/classroom-layout-client";
import { getActiveCourse } from "@/actions/user/get-active-course";
import { getUserEnrolledList } from "@/actions/progress";
import { classroomPageTitle } from "@/lib/classroom-page-title";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const activeCourse = await getActiveCourse();

  return {
    title: classroomPageTitle(activeCourse?.title),
    description: "Assista às aulas e continue aprendendo programação.",
  };
}

export default async function ClassroomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Busca os dados no servidor
  const [enrolledCoursesData, activeCourse] = await Promise.all([
    getUserEnrolledList(),
    getActiveCourse(),
  ]);

  return (
    <ClassroomLayoutClient
      initialUserCourses={enrolledCoursesData.userCourses || []}
      initialActiveCourse={activeCourse}
    >
      {children}
    </ClassroomLayoutClient>
  );
}
