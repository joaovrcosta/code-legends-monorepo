import type { Metadata } from "next";
import ClassroomHeader from "@/components/classroom/header";
import { getActiveCourse } from "@/actions/user/get-active-course";
import { getUserEnrolledList } from "@/actions/progress";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sala de Aula - Code Legends",
  description: "Assista às aulas e continue aprendendo programação.",
};

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
    <>
      <ClassroomHeader
        initialUserCourses={enrolledCoursesData.userCourses || []}
        initialActiveCourse={activeCourse}
      />
      {children}
    </>
  );
}
